import _get from 'lodash/get'
import _set from 'lodash/set'
import { EventEmitter } from 'events'

import { service, subscribe } from '../ipc'
import store from '../store'

import { appLogger } from '../logging/loggers'

import IService from './IService'

export default class Config<T extends object> extends EventEmitter implements IService {
  public readonly service: string = 'config'
  
  private _data: T | undefined
  
  /**
   * Automatically sync with main process and Vuex store
   */
  constructor (public namespace: string) {
    super()

    service<T>('config', [ namespace ])
      .then((result) => {
        appLogger.debug('Config "%s" is loaded.', namespace)
        this._data = result

        this.emit('load')
        store.commit('config/load', {
          namespace,
          config: this._data
        })
      })
    
    subscribe(`config.change[${namespace}]`, (k: string, n: any) => {
      this.set(k, n)
    })
  }

  get (key: string, defaultVal?: any): any {
    return _get(this._data, key, defaultVal)
  }

  set (key: string, value: any): void {
    if (!this._data) return
    
    const oldVal = this.get(key)
    if (typeof key === 'string' && oldVal !== value) {
      _set(this._data, key, value)
      this.emit('change', key, value, oldVal)
      store.commit('config/change', {
        namespace: this.namespace,
        key,
        value
      })
    }
  }

  toJSON () {
    return this._data
  }
}
