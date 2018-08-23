import { get as _get, set as _set } from 'lodash'
import { ipcRenderer } from 'electron'


import { EventEmitter } from 'events'

import IService from './IService'

export default class Config extends EventEmitter implements IService {
  public readonly service: string = 'config'

  private _namespace: string
  private _data = {}

  constructor (namespace: string) {
    super()

    this._namespace = namespace

    ipcRenderer.on(`${this.service}:${this._namespace}`, (key: any, value: any) => {
      this._set(key, value)
    })
    ipcRenderer.send(this.service, this._namespace)
  }

  get (key: string, defaultVal?: any): any {
    return _get(this._data, key, defaultVal)
  }

  private _set (key: object): void
  private _set (key: string, value: any): void
  private _set (key: string | object, value?: any): void {
    if (typeof key === 'string') {
      if (this.get(key) === value) return

      const oldVal = this.get(key)
      _set(this._data, key, value)
      this.emit('change', key, value, oldVal)
    } else {
      this._data = key
      this.emit('load')
    }
  }

  set (key: string, value: any): void {
    this._set(key, value)
  }
}