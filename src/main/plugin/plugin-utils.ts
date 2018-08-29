import { promisify } from 'util'
import { readJSONSync } from 'fs-extra'
import { execFile, ExecFileOptions } from 'child_process'
import { join } from 'path'

import { IS_WIN32 } from '../env'
import { appLogger } from '../logging/loggers'

const YARN_BIN = `./node_modules/.bin/yarn${IS_WIN32 ? '.cmd' : ''}`
const pExecFile = promisify(execFile)

export function yarn (args: string[], options?: ExecFileOptions) {
  const _env = options && options.env ? options.env : {}
  return pExecFile(YARN_BIN, [
    ...args,
    '--non-interactive'
  ], {
    ...options,
    windowsHide: true,
    env: {
      ..._env,
      NODE_ENV: 'production'
    }
  }).then(({ stdout, stderr }) => {
    let err
    try {
      err = JSON.parse(stderr)
    } catch (e) { }

    if (typeof err === 'object' && err.type === 'error') {
      throw new Error(err.data || `Command failed. "yarn ${args.join(' ')}"`)
    }

    return {
      stdout, stderr
    }
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
export async function validateModuleAsPlugin (plugin: string): Promise<boolean> {
  if (!plugin.startsWith('tukiyomi-plugin-') || !plugin.startsWith('@tukiyomi/plugin-')) return false

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