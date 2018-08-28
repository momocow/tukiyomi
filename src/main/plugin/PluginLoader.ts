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

  constructor (
    public readonly path: string = join(ROOT_DIR, 'plugins'),
    public readonly registry: string = 'https://registry.npmjs.org'
  ) {
    super()

    this._pkgJson = join(this.path, 'package.json')
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
    ensureDirSync(this.path)
    copyFileSync(join(__static, 'plugins-package.json'), this._pkgJson)
  }

  list (): string[] {
    const pkg = inspectPackage(this.path, () => {
      removeSync(this.path)
      this._init()
    })
    return pkg && typeof pkg.dependencies ==='object' ? Object.keys(pkg.dependencies) : []
  }

  inspectLocal (plugin: string): object | null {
    return inspectPackage(join(this.path, 'node_modules', plugin))
  }

  async inspectRemote (plugin: string): Promise<object | null> {
    for (const candidate of getPluginNameCandidates(plugin)) {
      try {
        const { stdout } = await this._execNpm([
          'view',
          candidate,
          '--json'
        ], {
          cwd: this.path
        })

        return JSON.parse(stdout)
      } catch (e) {
        appLogger.debug('Failed to inspect "%s" from remote.', candidate)
        appLogger.debug('%O', e)
      }
    }

    return null
  }

  async uninstall () {

  }

  async install (plugin: string = '') {
    this._execNpm([ 'install', plugin ])
  }

  load () {

  }
}
