import { app } from 'electron'
import { stringify } from '@iarna/toml'
import { outputFile, outputFileSync, readJsonSync } from 'fs-extra'
import _cloneDeep from 'lodash/clonedeep'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _merge from 'lodash/merge'
import { join, resolve, dirname } from 'path'
import { EventEmitter } from 'events'
import { findAndReadConfig } from 'read-config-file'

import { getLogger } from '../logging/loggers'
import Logger from '@grass/grass-logger'

export default class Config<T extends Object> extends EventEmitter {
  private _data: T | undefined
  private _default: string | T | undefined
  private logger: Logger
  public filepath: string = ''
  public hasInit: boolean = false

  /**
   * @param {string} filename Resolve under `${userData}/Configs`
   */
  constructor (public filename: string, defaultJson?: string | T) {
    super()

    this._default = defaultJson
    this.logger = getLogger(`Config/${filename}`)

    this.reset()
  }

  async load () {
    this.logger.debug('Config: start loading.')

    const configRoot = join(app.getPath('userData'), 'Configs')
    const absPath = resolve(configRoot, this.filename)
    const dir = dirname(absPath)

    try {
      const confObj = await findAndReadConfig<T>({
        configFilename: this.filename,
        projectDir: dir,
        packageKey: '',
        packageMetadata: null
      })

      if (confObj && confObj.configFile) {
        this.logger.debug('Config: using config file "%s".', confObj.configFile)
        this.filepath = confObj.configFile

        this._data = _merge({}, this._data, confObj.result)
        this.emit('load')
      } else {
        // config not found
        this.filepath = join(dir, 'app.config.toml')
        this.logger.debug('Config: init new configuration. (%s)', this.filepath)
      }
      await this.flush()
    } catch (err) {
      this.emit('error', err)
    } finally {
      this.hasInit = true
    }
  }

  get<R> (key: string): R | undefined
  get<R> (key: string, defVal: R): R
  get<R> (key: string, defVal?: R): R | undefined {
    return this.hasInit ? _get(this._data, key, defVal) : undefined
  }

  set (key: string, value: any): void {
    if (!this.hasInit) return

    const oldVal = _get(this._data, key)
    if (typeof this._data === 'object' && oldVal !== value) {
      _set(this._data, key, value)
      this.emit('change', key, value, oldVal)
    }
  }

  toJSON () {
    return this._data
  }

  async flush () {
    if (this._data) {
      await outputFile(this.filepath, stringify(this._data), 'utf8')
    }
  }

  flushSync () {
    if (this._data) {
      outputFileSync(this.filepath, stringify(this._data), 'utf8')
    }
  }

  reset (destroy: boolean = false) {
    this._data = undefined
    if (!destroy) {
      if (typeof this._default === 'string') {
        this._data = readJsonSync(this._default, {
          throws: false
        }) || undefined
      } else if (typeof this._default === 'object') {
        this._data = _cloneDeep(this._default)
      }
    }
    this.hasInit = false
  }
}
