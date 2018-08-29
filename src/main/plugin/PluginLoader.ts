import {
  ensureDir,
  ensureDirSync,
  copyFileSync,
  removeSync,
  existsSync
 } from 'fs-extra'
import { EventEmitter } from 'events'
import { join } from 'path'
import { NodeVM } from 'vm2'
import { ExecFileOptions } from 'child_process'

import { getLogger, getPluginLogger } from '../logging/loggers'

import { APP_DIR } from '../env'

import eventBus from './EventBus'

import {
  yarn,
  inspectPackage,
  normalizePluginName
} from './plugin-utils'

interface PluginMeta {
  name: string,
  main: string,
  version: string,
  description: string,
  keywords: string[],
  author: string | { name: string, email: string },
  license: string,
  dependencies: {[k: string]: string},
  displayName: string,
  dataRoot: string
}

export default class PluginLoader extends EventEmitter {
  private readonly _pkgJson: string
  private readonly _pluginInsts: Map<string, Object> = new Map()
  private readonly _pluginStates: WeakMap<Object, PluginMeta> = new WeakMap()
  private readonly logger = getLogger('PluginLoader')

  constructor (
    public readonly path: string = join(APP_DIR, 'plugins'),
    public readonly registry: string = 'https://registry.npmjs.org'
  ) {
    super()

    this._pkgJson = join(this.path, 'package.json')

    this.logger.debug('PluginLoader: (Init) Using plugin root "%s".', this.path)
    this.logger.debug('PluginLoader: (Init) using registry "%s".', this.registry)
  }

  _execBin (args: string[], options?: ExecFileOptions) {
    this.logger.debug('> yarn %s', args.join(' '))
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

  listLoaded () {
    return this._pluginInsts
  }

  listInstalled (): string[] {
    const pkg = inspectPackage(this.path)
    return pkg && typeof pkg.dependencies ==='object' ? Object.keys(pkg.dependencies) : []
  }

  inspectLocal (plugin: string): any {
    return inspectPackage(join(this.path, 'node_modules', plugin)) || {}
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
  //     this.logger.debug('PluginLoader: "%s" successfully inspected.', plugin)
  //     return meta
  //   } catch (e) {
  //     if (`${e}`.includes('E404')) {
  //       this.logger.debug('PluginLoader: Invalid candidate, "%s".', plugin)
  //     } else {
  //       this.logger.warn('PluginLoader: Error occurs when trying to inspect "%s".', plugin)
  //       this.logger.warn('%O', e)
  //     }
  //   }
  // }

  // async uninstall (plugin: string): Promise<void> {
  //   for (const candidate of getPluginNameCandidates(plugin)) {
  //     this.logger.debug('PluginLoader: Try to uninstall "%s".', candidate)
  //     if (this.list().includes(candidate)) {
  //       await this._execBin([ 'uninstall', candidate ], {
  //         cwd: this.path
  //       })
  //       this.logger.debug('PluginLoader: "%s" successfully uninstalled.', candidate)
  //       return
  //     } else {
  //       this.logger.debug('PluginLoader: plugin "%s" is not installed.', candidate)
  //     }
  //   }

  //   this.logger.debug('PluginLoader: Failed to uninstall "%s".', plugin)
  // }

  // async install (plugin: string = ''): Promise<void> {
  //   for (const candidate of getPluginNameCandidates(plugin)) {
  //     this.logger.debug('PluginLoader: Try to install "%s".', candidate)
  //     try {
  //       await this._execBin([ 'install', candidate, '--production' ], {
  //         cwd: this.path
  //       })
  //       this.logger.debug('PluginLoader: "%s" successfully installed.', candidate)
  //       return
  //     } catch (e) {
  //       if (`${e}`.includes('E404')) {
  //         this.logger.debug('PluginLoader: Invalid candidate, "%s".', candidate)
  //       } else {
  //         this.logger.warn('PluginLoader: Error occurs when trying to install "%s".', candidate)
  //         this.logger.warn('%O', e)
  //       }
  //     }
  //   }
  //   this.logger.warn('PluginLoader: Failed to install "%s".', plugin)
  // }

  async uninstall (plugin: string) {

  }

  async install (plugin: string) {

  }

  async load () {
    // yarn install --check-files
    await this._execBin([
      'install',
      '--check-files'
    ])

    this.listInstalled().forEach(async (plugin: string) => {
      const pluginDir = join(this.path, 'node_modules', plugin)

      const meta = this.inspectLocal(plugin)

      if (meta.main) {
        const pluginEntry = join(pluginDir, meta.main)
        const displayName = normalizePluginName(plugin)
        const dataRoot = join(this.path, displayName)

        const pluginLogger = getPluginLogger(dataRoot, displayName)
  
        const vm = new NodeVM({
          console: 'redirect',
          sandbox: {
            setTimeout,
            setInterval,
            setImmediate,
            eventBus
          },
          require: {
            external: true
          }
        })
          .on('console.log', (msg, ...args) => {
            pluginLogger.log(msg, ...args)
          })
          .on('console.info', (msg, ...args) => {
            pluginLogger.info(msg, ...args)
          })
          .on('console.debug', (msg, ...args) => {
            pluginLogger.debug(msg, ...args)
          })
          .on('console.warn', (msg, ...args) => {
            pluginLogger.warn(msg, ...args)
          })
          .on('console.error', (msg, ...args) => {
            pluginLogger.error(msg, ...args)
          })

        const startPlugin = `
          const Plugini = require("${pluginDir}").default
          module.exports = new Plugin("${dataRoot}")
        `
        const instance: Object = vm.run(startPlugin, pluginEntry)
  
        this._pluginInsts.set(plugin, instance)
        this._pluginStates.set(instance, meta)
      }
    })
  }
}
