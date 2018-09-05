import {
  ensureDirSync,
  copyFileSync,
  removeSync,
  existsSync
 } from 'fs-extra'
import { EventEmitter } from 'events'
import { join } from 'path'
import { NodeVM, VMError } from 'vm2'
import { ExecFileOptions } from 'child_process'
import _pick from 'lodash/pick'
import { Event } from '@tukiyomi/events/src/index'

import { getLogger, getPluginLogger } from '../logging/loggers'
import { getConfig } from '../configuring/configs'

import { PLUGINS_DIR, STATIC_DIR, IS_WIN32 } from '../env'

import {
  yarn,
  inspectPackage,
  normalizePluginName,
  validateLocalPlugin
} from './plugin-utils'

interface PluginMeta {
  name: string,
  main: string,
  version: string,
  description?: string,
  keywords?: string[],
  author?: string | { name: string, email: string },
  license?: string,
  dependencies?: {[k: string]: string},

  // insert by loader
  displayName: string,
  meta?: TukiYomi.Plugin.PluginOptions
}

export default class PluginLoader extends EventEmitter {
  private readonly _pkgJson: string
  private readonly _pluginInsts: Map<string, TukiYomi.PluginWrapper> = new Map()
  private readonly _pluginStates: WeakMap<Object, PluginMeta> = new WeakMap()

  public static readonly logger = getLogger('PluginLoader')

  constructor (
    public path: string = PLUGINS_DIR,
    public registry: string = 'https://registry.npmjs.org'
  ) {
    super()

    this._pkgJson = join(this.path, 'package.json')

    PluginLoader.logger.debug('(Init) Using plugin root "%s".', this.path)
    PluginLoader.logger.debug('(Init) using registry "%s".', this.registry)
  }

  _execBin (args: string[], options?: ExecFileOptions) {
    PluginLoader.logger.debug('> yarn %s', args.join(' '))
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

  initDir () {
    PluginLoader.logger.debug('Ensuring plugin directory "%s"', this.path)
    ensureDirSync(this.path)
    if (!existsSync(this._pkgJson)) {
      PluginLoader.logger.debug('Creating package.json for runtime plugins. (%s)', this._pkgJson)
      copyFileSync(join(STATIC_DIR, 'plugins-package.json'), this._pkgJson)
    }
  }

  resetHard () {
    removeSync(this.path)
    this.initDir()
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

  async uninstall (plugin: string) {

  }

  async install (plugin: string) {

  }

  stop (plugin: string): this {
    const pluginInstance = this._pluginInsts.get(plugin)
    if (pluginInstance) {
      pluginInstance.emit('app.stop')
    }
    return this
  }

  stopAll () {
    this.broadcast('app.stop')
  }

  send (plugin: string, event: string, ...args: any[]): this {
    const pluginInstance = this._pluginInsts.get(plugin)
    if (pluginInstance) {
      pluginInstance.emit(event, ...args)
    }
    return this
  }

  broadcast (event: string, evtObj?: Event): this {
    // reduce noise
    if (!event.startsWith('network')) {
      PluginLoader.logger.debug(
        'Broadcast "%s" (%s)', event, evtObj ? evtObj.constructor.name : '')
    }
    this._pluginInsts.forEach((instance) => {
      instance.emit(event, evtObj)
    })
    return this
  }

  clear () {
    // plugin state map should also be cleared since it is a WeakMap
    this._pluginInsts.clear()
    PluginLoader.logger.debug('Plugin instances are cleared')
  }

  async reload () {
    this.clear()
    return this.load(false)
  }

  async load (checkFiles: boolean = true) {
    if (checkFiles) {
      this.initDir()

      // yarn install --check-files
      await this._execBin([
        'install',
        '--check-files'
      ])
    }

    const loadingQueue = this.listInstalled().map(async (plugin: string, index) => {
      PluginLoader.logger.debug('Plugin (%d: %s): start loading', index, plugin)

      const pluginDir = join(this.path, 'node_modules', plugin)

      if (!validateLocalPlugin(pluginDir)) {
        PluginLoader.logger.warn('Plugin (%d: %s): validation failed.', index, plugin)
        return
      }

      const inspectResult = this.inspectLocal(plugin)
      const meta = <PluginMeta>_pick(
        inspectResult,
        'name',
        'main',
        'version',
        'description',
        'keywords',
        'author',
        'license',
        'dependencies'
      )

      if (meta.name && meta.main && meta.version) {
        const displayName = normalizePluginName(plugin)

        meta.displayName = displayName

        const pluginLogger = getPluginLogger(plugin)
  
        const vm = new NodeVM({
          console: 'redirect',
          require: {
            external: true,
            builtin: [
              'events',
              'url',
              'querystring'
            ],
            root: join(this.path, 'node_modules'),
            context: 'sandbox'
          }
        })
          .on('console.log', (msg, ...args) => {
            pluginLogger.log(msg, ...args)
          })
          .on('console.info', (msg, ...args) => {
            pluginLogger.info(msg, ...args)
          })
          // TODO https://github.com/patriksimek/vm2/issues/152
          // .on('console.debug', (msg, ...args) => {
          //   console.log('!!! ' + msg, ...args)
          //   pluginLogger.info(msg, ...args)
          // })
          .on('console.warn', (msg, ...args) => {
            pluginLogger.warn(msg, ...args)
          })
          .on('console.error', (msg, ...args) => {
            pluginLogger.error(msg, ...args)
          })
        try {
          vm.require(
            IS_WIN32? pluginDir.replace(/\\/g, '\\\\') : pluginDir
          )
        } catch (e) {
          console.log('Error: %o', e)
        }

        try {
          PluginLoader.logger.debug('Plugin (%d: %s): Instantiating', index, plugin)

          const { default: Plugin } = vm.require(
            IS_WIN32? pluginDir.replace(/\\/g, '\\\\') : pluginDir
          )

          const instance: TukiYomi.PluginWrapper = new Plugin()
          meta.meta = instance.meta
          PluginLoader.logger.debug('Plugin (%d: %s): options %O', index, plugin, instance.meta)

          const defaultConfig = typeof instance.meta === 'object' ? instance.meta.default : undefined
          const pluginConfig = getConfig(`plugins/${plugin}`, defaultConfig)
          await pluginConfig.load()

          // inject config to plugin's sandbox
          vm.freeze(pluginConfig, 'config')
          instance.emit('app.start')

          this._pluginInsts.set(plugin, instance)
          this._pluginStates.set(instance, meta)
          this.emit('load', plugin, meta)
          PluginLoader.logger.debug('Plugin (%d: %s): loaded successfully', index, plugin)
        } catch (e) {
          if (e instanceof VMError) {
            PluginLoader.logger.warn('Plugin (%d: %s): possible scope violation', index, plugin)
          } else {
            PluginLoader.logger.warn('Plugin (%d: %s): uncaught exception', index, plugin)
          }
          PluginLoader.logger.warn('%O', e)
        }
      }
    })

    Promise.all(loadingQueue)
      .then(() => {
        PluginLoader.logger.info('Loaded plugins: %d', this._pluginInsts.size)
      })
  }
}

process.on('uncaughtException', (e) => {
  if (e instanceof VMError) {
    PluginLoader.logger.warn('Plugin exception occurs!')
    PluginLoader.logger.warn('%O', e)
    return
  }
})
