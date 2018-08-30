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
    
    subscribe(`config.change[${namespace}]`, (k: string, n: any) => {
      this.set(k, n)
    })

    this.init()
  }

  async init () {
    // TODO maybe use sync service if renderer is started right after config.ready is published?
    const result = await service<T>(this.service, [ this.namespace ])

    appLogger.debug('Config "%s" is loaded.', this.namespace)
    this._data = result

    this.emit('load')
    store.commit('config/load', {
      namespace: this.namespace,
      config: this._data
    })
  }

  get (key: string, defaultVal?: any): any {
    return _get(this._data, key, defaultVal)
  }

  set (key: string, value: any): void {
    if (!this._data) return

    // TODO sync back to main process
    
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
