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

import { getLogger, getPluginLogger } from '../logging/loggers'

import { APP_DIR, STATIC_DIR, IS_WIN32 } from '../env'

import eventBus from './EventBus'

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
  dataRoot: string,
  meta?: TukiYomi.Plugin.PluginOptions
}

export default class PluginLoader extends EventEmitter {
  private readonly _pkgJson: string
  private readonly _pluginInsts: Map<string, TukiYomi.PluginWrapper> = new Map()
  private readonly _pluginStates: WeakMap<Object, PluginMeta> = new WeakMap()

  public static readonly logger = getLogger('PluginLoader')

  constructor (
    public path: string = join(APP_DIR, 'plugins'),
    public registry: string = 'https://registry.npmjs.org'
  ) {
    super()

    this._pkgJson = join(this.path, 'package.json')

    PluginLoader.logger.debug('PluginLoader: (Init) Using plugin root "%s".', this.path)
    PluginLoader.logger.debug('PluginLoader: (Init) using registry "%s".', this.registry)
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
    ensureDirSync(this.path)
    if (!existsSync(this._pkgJson)) {
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
  
  initAll () {
    eventBus.emit('init')
  }

  destroyAll () {
    eventBus.emit('destroy')
  }

  async reload () {
    // plugin state map should also be cleared since it is a WeakMap
    this._pluginInsts.clear()
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

    this.listInstalled().forEach((plugin: string, index) => {
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
        const dataRoot = join(this.path, displayName)

        meta.displayName = displayName
        meta.dataRoot = dataRoot

        const pluginLogger = getPluginLogger(dataRoot, displayName)
  
        const vm = new NodeVM({
          console: 'redirect',
          sandbox: {
            setTimeout,
            setInterval,
            setImmediate
          },
          require: {
            external: true,
            root: pluginDir
          }
        })
          .on('console.log', (msg, ...args) => {
            console.log('!!! ' + msg, ...args)
            pluginLogger.log(msg, ...args)
          })
          .on('console.info', (msg, ...args) => {
            console.log('!!! ' + msg, ...args)
            pluginLogger.info(msg, ...args)
          })
          .on('console.debug', (msg, ...args) => {
            pluginLogger.debug(msg, ...args)
          })
          .on('console.warn', (msg, ...args) => {
            console.log('!!! ' + msg, ...args)
            pluginLogger.warn(msg, ...args)
          })
          .on('console.error', (msg, ...args) => {
            console.log('!!! ' + msg, ...args)
            pluginLogger.error(msg, ...args)
          })

        try {
          PluginLoader.logger.debug('Plugin (%d: %s): Instantiating', index, plugin)

          const { default: Plugin } = vm.require(
            IS_WIN32? pluginDir.replace(/\\/g, '\\\\') : pluginDir
          )

          const instance: TukiYomi.PluginWrapper = new Plugin(dataRoot)
          meta.meta = instance.meta
          PluginLoader.logger.debug('Plugin (%d: %s): options %O', index, plugin, instance.meta)

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

    PluginLoader.logger.info('Loaded plugins: %d', this._pluginInsts.size)
  }
}

process.on('uncaughtException', (e) => {
  if (e instanceof VMError) {
    PluginLoader.logger.warn('Plugin exception occurs!')
    PluginLoader.logger.warn('%O', e)
    return
  }
})
