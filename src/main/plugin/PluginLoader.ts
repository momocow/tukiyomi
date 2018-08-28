import PluginBase from '@tukiyomi/plugin-base'
import { execFile, ExecFileOptions } from 'child_process'
import { promisify } from 'util'
import {
  ensureDir,
  ensureDirSync,
  copyFileSync,
  readJSONSync,
  removeSync,
  existsSync
 } from 'fs-extra'
import { EventEmitter } from 'events'
import { join } from 'path'

import { appLogger } from '../logging/loggers'

import { ROOT_DIR, APP_DIR, IS_WIN32 } from '../env'

const YARN_BIN = `./node_modules/.bin/yarn${IS_WIN32 ? '.cmd' : ''}`
const pExecFile = promisify(execFile)

function yarn (args: string[], options?: ExecFileOptions) {
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

function inspectPackage (dir: string, failover?: Function): {[k: string]: any} | null {
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
async function validateModuleAsPlugin (plugin: string): Promise<boolean> {
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

function getPluginNameCandidates (plugin: string): string[] {
  return plugin.startsWith('@tukiyomi/') || plugin.startsWith('tukiyomi-') ? [ plugin ]
    : [ `@tukiyomi/${plugin}`, `tukiyomi-${plugin}` ]
}

function normalizePluginName (name: string): string {
  if (name.startsWith('@tukiyomi/plugin-')) {
    return name.substr(17)
  } else if (name.startsWith('tukiyomi-plugin-')) {
    return name.substr(16)
  }
  return name
}

type Plugin = new (dir: string) => PluginBase

interface PluginMeta {
  version?: string,
  description?: string,
  keywords?: string[],
  author?: string | { name: string, email: string },
  license?: string,
  dependencies?: {[k: string]: string}
}

export default class PluginLoader extends EventEmitter {
  private readonly _pkgJson: string
  private readonly _pluginInsts: Map<string, PluginBase> = new Map()
  private readonly _pluginStates: WeakMap<PluginBase, PluginMeta> = new WeakMap()

  constructor (
    public readonly path: string = join(APP_DIR, 'plugins'),
    public readonly registry: string = 'https://registry.npmjs.org'
  ) {
    super()

    this._pkgJson = join(this.path, 'package.json')

    appLogger.debug('PluginLoader: (Init) Using plugin root "%s".', this.path)
    appLogger.debug('PluginLoader: (Init) using registry "%s".', this.registry)
  }

  _execBin (args: string[], options?: ExecFileOptions) {
    return yarn([
      ...args,
      '--cache-folder',
      join(this.path, '.yarn_cache')
    ], {
      ...options,
      cwd: this.path,
      env: {
        YARN_REGISTRY: this.registry
      }
    })
  }

  init () {
    ensureDirSync(this.path)
    if (!existsSync(this._pkgJson)) {
      copyFileSync(join(__static, 'plugins-package.json'), this._pkgJson)
    }
  }

  resetHard () {
    removeSync(this.path)
    this.init()
  }

  list (): string[] {
    const pkg = inspectPackage(this.path)
    return pkg && typeof pkg.dependencies ==='object' ? Object.keys(pkg.dependencies) : []
  }

  inspectLocal (plugin: string): {[field: string]: any} | null {
    return inspectPackage(join(this.path, 'node_modules', plugin))
  }

  // async inspectRemote (plugin: string, field: string = ''): Promise<object | null> {
  //   try {
  //     const { stdout } = await this._execBin([
  //       'info',
  //       plugin,
  //       field,
  //       '--json'
  //     ], {
  //       cwd: this.path
  //     })
  //     const meta = JSON.parse(stdout)
  //     appLogger.debug('PluginLoader: "%s" successfully inspected.', plugin)
  //     return meta
  //   } catch (e) {
  //     if (`${e}`.includes('E404')) {
  //       appLogger.debug('PluginLoader: Invalid candidate, "%s".', plugin)
  //     } else {
  //       appLogger.warn('PluginLoader: Error occurs when trying to inspect "%s".', plugin)
  //       appLogger.warn('%O', e)
  //     }
  //   }
  // }

  // async uninstall (plugin: string): Promise<void> {
  //   for (const candidate of getPluginNameCandidates(plugin)) {
  //     appLogger.debug('PluginLoader: Try to uninstall "%s".', candidate)
  //     if (this.list().includes(candidate)) {
  //       await this._execBin([ 'uninstall', candidate ], {
  //         cwd: this.path
  //       })
  //       appLogger.debug('PluginLoader: "%s" successfully uninstalled.', candidate)
  //       return
  //     } else {
  //       appLogger.debug('PluginLoader: plugin "%s" is not installed.', candidate)
  //     }
  //   }

  //   appLogger.debug('PluginLoader: Failed to uninstall "%s".', plugin)
  // }

  // async install (plugin: string = ''): Promise<void> {
  //   for (const candidate of getPluginNameCandidates(plugin)) {
  //     appLogger.debug('PluginLoader: Try to install "%s".', candidate)
  //     try {
  //       await this._execBin([ 'install', candidate, '--production' ], {
  //         cwd: this.path
  //       })
  //       appLogger.debug('PluginLoader: "%s" successfully installed.', candidate)
  //       return
  //     } catch (e) {
  //       if (`${e}`.includes('E404')) {
  //         appLogger.debug('PluginLoader: Invalid candidate, "%s".', candidate)
  //       } else {
  //         appLogger.warn('PluginLoader: Error occurs when trying to install "%s".', candidate)
  //         appLogger.warn('%O', e)
  //       }
  //     }
  //   }
  //   appLogger.warn('PluginLoader: Failed to install "%s".', plugin)
  // }

  async uninstall (plugin: string) {

  }

  async install (plugin: string) {

  }

  async load () {
    // yarn install
    await this._execBin([
      'install'
    ])

    this.list().forEach(async (plugin: string) => {
      const Plugin: Plugin = require(join(this.path, 'node_modules', plugin))

      const displayName = normalizePluginName(plugin)
      const pluginRoot = join(this.path, displayName)

      await ensureDir(pluginRoot)

      const instance = new Plugin(pluginRoot)
      this._pluginInsts.set(plugin, instance)

      const {
        version,
        description,
        keywords,
        author,
        license,
        dependencies
      }: PluginMeta = this.inspectLocal(plugin) || {}

      this._pluginStates.set(instance, {
        version,
        description,
        keywords,
        author,
        license,
        dependencies
      })

      instance.init()
    })
  }
}
