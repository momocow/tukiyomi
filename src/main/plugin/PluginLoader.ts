import { execFile } from 'child_process'
import { promisify } from 'util'
import {
  ensureDirSync,
  copyFileSync,
  readJSONSync,
  removeSync
 } from 'fs-extra'
import { EventEmitter } from 'events'
import { join } from 'path'

import { appLogger } from '../logging/loggers'

import { ROOT_DIR, IS_WIN32 } from '../env'

const pExecFile = promisify(execFile)

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

function getPluginNameCandidates (plugin: string): string[] {
  return plugin.startsWith('@tukiyomi/') || plugin.startsWith('tukiyomi-plugin-') ? [ plugin ]
    : [ `@tukiyomi/${plugin}`, `tukiyomi-plugin-${plugin}` ]
}

export default class PluginLoader extends EventEmitter {
  private readonly _pkgJson: string
  private readonly _npmBin: string = `./node_modules/.bin/npm${IS_WIN32 ? '.cmd' : ''}`
  private readonly _pluginInsts: Map<string, TukiYomi.IPlugin> = new Map()
  private readonly _pluginStates: WeakMap<TukiYomi.IPlugin, {[k: string]: any}> = new WeakMap()

  constructor (
    public readonly path: string = join(ROOT_DIR, 'plugins'),
    public readonly registry: string = 'https://registry.npmjs.org'
  ) {
    super()

    this._pkgJson = join(this.path, 'package.json')

    appLogger.debug('PluginLoader: (Init) Using plugin root "%s".', this.path)
    appLogger.debug('PluginLoader: (Init) using registry "%s".', this.registry)
  }

  _execNpm (args: string[], options?: object) {
    return pExecFile(this._npmBin, [
      ...args,
      '--registry',
      this.registry
    ], {
      ...options,
      windowsHide: true,
      env: {
        NODE_ENV: 'production'
      }
    })
  }

  _init () {
    removeSync(this.path)
    ensureDirSync(this.path)

    copyFileSync(join(__static, 'plugins-package.json'), this._pkgJson)
  }

  list (): string[] {
    const pkg = inspectPackage(this.path)
    return pkg && typeof pkg.dependencies ==='object' ? Object.keys(pkg.dependencies) : []
  }

  inspectLocal (plugin: string): object | null {
    return inspectPackage(join(this.path, 'node_modules', plugin))
  }

  async inspectRemote (plugin: string): Promise<object | null> {
    for (const candidate of getPluginNameCandidates(plugin)) {
      appLogger.debug('PluginLoader: Try to inspect "%s".', candidate)
      try {
        const { stdout } = await this._execNpm([
          'view',
          candidate,
          '--json'
        ], {
          cwd: this.path
        })
        const meta = JSON.parse(stdout)
        appLogger.debug('PluginLoader: "%s" successfully inspected.', candidate)
        return meta
      } catch (e) {
        if (`${e}`.includes('E404')) {
          appLogger.debug('PluginLoader: Invalid candidate, "%s".', candidate)
        } else {
          appLogger.warn('PluginLoader: Error occurs when trying to inspect "%s".', candidate)
          appLogger.warn('%O', e)
        }
      }
    }

    appLogger.warn('PluginLoader: Failed to inspect "%s".', plugin)

    return null
  }

  async uninstall (plugin: string): Promise<void> {
    for (const candidate of getPluginNameCandidates(plugin)) {
      appLogger.debug('PluginLoader: Try to uninstall "%s".', candidate)
      if (this.list().includes(candidate)) {
        await this._execNpm([ 'uninstall', candidate ], {
          cwd: this.path
        })
        appLogger.debug('PluginLoader: "%s" successfully uninstalled.', candidate)
        return
      } else {
        appLogger.debug('PluginLoader: plugin "%s" is not installed.', candidate)
      }
    }

    appLogger.debug('PluginLoader: Failed to uninstall "%s".', plugin)
  }

  async install (plugin: string = ''): Promise<void> {
    for (const candidate of getPluginNameCandidates(plugin)) {
      appLogger.debug('PluginLoader: Try to install "%s".', candidate)
      try {
        await this._execNpm([ 'install', candidate, '--production' ], {
          cwd: this.path
        })
        appLogger.debug('PluginLoader: "%s" successfully installed.', candidate)
        return
      } catch (e) {
        if (`${e}`.includes('E404')) {
          appLogger.debug('PluginLoader: Invalid candidate, "%s".', candidate)
        } else {
          appLogger.warn('PluginLoader: Error occurs when trying to install "%s".', candidate)
          appLogger.warn('%O', e)
        }
      }
    }
    appLogger.warn('PluginLoader: Failed to install "%s".', plugin)
  }

  load () {
  }
}
