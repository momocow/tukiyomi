import { app } from 'electron'
import { stringify } from '@iarna/toml'
import { outputFile } from 'fs-extra'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _merge from 'lodash/merge'
import { join, resolve, dirname } from 'path'
import { EventEmitter } from 'events'
import { findAndReadConfig } from 'read-config-file'

import { appLogger } from '../logging/loggers'

export default class Config<T extends Object> extends EventEmitter {
  private _data: T
  public hasInit: boolean = false

  /**
   * @param {string} filename Resolve under `${userData}/Configs`
   */
  constructor (public filename: string, defaultData: T) {
    super()

    this._data = defaultData
  }

  async load () {
    const configRoot = join(app.getPath('userData'), 'Configs')
    const absPath = resolve(configRoot, this.filename)
    const dir = dirname(absPath)

    appLogger.debug('Config: using file "%s" in directory, "%s"', this.filename, dir)

    try {
      const confObj = await findAndReadConfig<T>({
        configFilename: this.filename,
        projectDir: dir,
        packageKey: '',
        packageMetadata: null
      })

      if (confObj) {
        this._data = _merge({}, this._data, confObj.result)
        this.emit('load')
      } else {
        // config not found
        outputFile(join(dir, 'app.config.toml'), stringify(this._data))
      }
    } catch (err) {
      this.emit('error', err)
    } finally {
      this.hasInit = true
    }
  }

  get<R> (key: string): R | undefined
  get<R> (key: string, defVal: R): R
  get<R> (key: string, defVal?: R): R | undefined {
    return _get(this._data, key, defVal)
  }

  set (key: string, value: any): void {
    const oldVal = _get(this._data, key)
    if (typeof this._data === 'object' && oldVal !== value) {
      _set(this._data, key, value)
      this.emit('change', key, value, oldVal)
    }
  }

  toJSON () {
    return this._data
  }
}
