import { readJSONSync } from 'fs-extra'
import { fork, ForkOptions } from 'child_process'
import { join, resolve } from 'path'

import { MODULE_DIR } from '../env'
import { appLogger } from '../logging/loggers'

const YARN_BIN = resolve(MODULE_DIR, `yarn/bin/yarn.js`)

export function yarn (args: string[], options?: ForkOptions): Promise<{stdout: string, stderr: string}> {
  const _env = options && options.env ? options.env : {}
  const proc = fork(YARN_BIN, [
    ...args,
    '--non-interactive',
    '--json'
  ], {
    ...options,
    stdio: 'pipe',
    env: {
      ..._env,
      NODE_ENV: 'production'
    }
  })

  let stdout = ''
  let stderr = ''
  proc.stdout.on('data', (chunk) => {
    stdout += `${chunk}`
  })
  proc.stderr.on('data', (chunk) => {
    stderr += `${chunk}`
  })

  return new Promise(function (resolve, reject) {
    proc
      .on('close', function () {
        let err
        try {
          err = JSON.parse(stderr)
        } catch (e) { }

        if (typeof err === 'object' && err.type === 'error') {
          reject(new Error(err.data || `Command failed. "yarn ${args.join(' ')}"`))
          return
        }

        resolve({ stdout, stderr })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

export function inspectPackage (dir: string, failover?: Function): {[k: string]: any} | null {
  const pkg: {[k: string]: any} | null = readJSONSync(join(dir, 'package.json'), {
    throws: false
  })

  if (typeof failover === 'function') {
    failover(dir)

    return readJSONSync(join(dir, 'package.json'), {
      throws: false
    })
  }

  return pkg
}

/**
 * A valid plugin is defined as the following rules:
 * 1. MUST includes "tukiyomi-plugin" in its keywords list. (For better npm search support)
 * 2. MUST has its name starting with "tukiyomi-plugin-" OR "@tukiyomi/plugin-" (published in the scope of TukiYomi).
 *    (For better context idetification)
 */
export async function validateRemotePlugin (plugin: string): Promise<boolean> {
  if (!plugin.startsWith('tukiyomi-plugin-') && !plugin.startsWith('@tukiyomi/plugin-')) return false

  const { stdout } = await yarn([ 'info', plugin, 'keywords', '--json' ])
  try {
    const { data }: { data: string[] } = JSON.parse(stdout)
    return data.includes('tukiyomi-plugin')
  } catch (e) {
    appLogger.warn('PluginLoader: Failed to validate plugin "%s". Assume it is invalid.', plugin)
    appLogger.warn('%O', e)
    return false
  }
}

export function validateLocalPlugin (pluginDir: string) {
  const meta = inspectPackage(pluginDir)
  if (meta) {
    const { name, keywords } = meta
    return (
        name.startsWith('tukiyomi-plugin-') ||
        name.startsWith('@tukiyomi/plugin-')
      ) &&
      Array.isArray(keywords) &&
      keywords.includes('tukiyomi-plugin')
  }
  return false
}

export function getPluginNameCandidates (plugin: string): string[] {
  return plugin.startsWith('@tukiyomi/') || plugin.startsWith('tukiyomi-') ? [ plugin ]
    : [ `@tukiyomi/${plugin}`, `tukiyomi-${plugin}` ]
}

export function normalizePluginName (name: string): string {
  if (name.startsWith('@tukiyomi/plugin-')) {
    return name.substr(17)
  } else if (name.startsWith('tukiyomi-plugin-')) {
    return name.substr(16)
  }
  return name
}