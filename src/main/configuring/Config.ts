import { stringify } from '@iarna/toml'
import { outputFile, outputFileSync, readJsonSync } from 'fs-extra'
import _cloneDeep from 'lodash/clonedeep'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _merge from 'lodash/merge'
import { join, resolve, parse } from 'path'
import { EventEmitter } from 'events'
import { findAndReadConfig } from 'read-config-file'

import { CONFIGS_DIR } from '../env'

import { getLogger } from '../logging/loggers'
import Logger from '@grass/grass-logger'

export default class Config<T extends Object> extends EventEmitter {
  private _data: T | undefined
  private _default: string | T | undefined
  private _dir: string
  private _name: string

  private logger: Logger
  public filepath: string = ''
  public hasInit: boolean = false

  /**
   * @param {string} filename Resolve under `${userData}/Configs`
   */
  constructor (filename: string, defaultJson?: string | T) {
    super()

    this._default = defaultJson

    const absPath = resolve(CONFIGS_DIR, filename)
    const { dir, name } = parse(absPath)
    this._dir = dir
    this._name = name

    this.logger = getLogger(`Config/${this._name}`)

    this.reset()
  }

  async load () {
    this.logger.debug('Config: start loading.')
    try {
      const confObj = await findAndReadConfig<T>({
        configFilename: this._name,
        projectDir: this._dir,
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
        this.filepath = join(this._dir, this._name + '.toml')
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
