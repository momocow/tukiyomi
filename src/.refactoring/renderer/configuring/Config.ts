import _get from 'lodash/get'
import _set from 'lodash/set'
import { EventEmitter } from 'events'

import { subscribe, serviceSync } from '../ipc'

import { appLogger } from '../logging/loggers'

import IService from '../services/IService'

export default interface Config<T extends object> {
  on: (event: "change", listener: (key: string, val: any, oldVal: any) => void) => this
}

export default class Config<T extends object> extends EventEmitter implements IService {
  public readonly service: string = 'config'
  
  private _data: T
  
  /**
   * Automatically sync with main process and Vuex store
   */
  constructor (public namespace: string) {
    super()
    
    subscribe(`config.change[${namespace}]`, (k: string, n: any) => {
      this.set(k, n)
    })

    const result = serviceSync<T>(this.service, this.namespace)
    appLogger.debug('Config "%s" is loaded.', this.namespace)
    this._data = result
  }

  get (key: string, defaultVal?: any): any {
    return _get(this._data, key, defaultVal)
  }

  set (key: string, value: any): void {
    // TODO sync back to main process
    const oldVal = this.get(key)
    if (typeof key === 'string' && oldVal !== value) {
      _set(this._data, key, value)
      this.emit('change', key, value, oldVal)
    }
  }

  toJSON () {
    return <T>JSON.parse(JSON.stringify(this._data))
  }
}
