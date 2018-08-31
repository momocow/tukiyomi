///<reference path="./global.d.ts" />

import { EventEmitter } from 'events'
import { eventMap } from './events'

interface PluginClass<PC extends Object> {
  new (...args: any[]): PC
}

// https://github.com/vuejs/vue-class-component/blob/cdcbfe5bb1a4c9d59a4b3066477f49c9aae8e2fc/src/index.ts#L9
export function Plugin <P extends Object> (options: TukiYomi.Plugin.PluginOptions): (<PC extends PluginClass<P>> (target: PC) => PC)
export function Plugin <PC extends PluginClass<Object>> (target: PC): PC
export function Plugin (options: TukiYomi.Plugin.PluginOptions | PluginClass<Object>): any {
  if (typeof options === 'function') {
    return pluginFactory(options)
  }

  return function (Clazz: PluginClass<Object>) {
    return pluginFactory(Clazz, options)
  }
}

function pluginFactory (Clazz: PluginClass<Object>, options?: TukiYomi.Plugin.PluginOptions) {
  const evtConst = eventMap.get(Clazz)
  const evtProto = eventMap.get(Clazz.prototype)

  // mixin class with EventEmitter
  class PluginWrapper extends Clazz implements EventEmitter {
    // Placeholder Implementations
    addListener (...args: any[]): this { return this }
    on (...args: any[]): this { return this }
    once (...args: any[]): this { return this }
    prependListener (...args: any[]): this { return this }
    prependOnceListener (...args: any[]): this { return this }
    removeListener (...args: any[]): this { return this }
    off (...args: any[]): this { return this }
    removeAllListeners (...args: any[]): this { return this }
    setMaxListeners (...args: any[]): this { return this }
    getMaxListeners (...args: any[]): number { return NaN }
    listeners (...args: any[]): Function[] { return [] }
    rawListeners (...args: any[]): Function[] { return [] }
    emit (...args: any[]): boolean { return false }
    eventNames () { return [] }
    listenerCount () { return 0 }

    // TODO deep clone?
    public meta: TukiYomi.Plugin.PluginOptions = options || {}

    constructor () {
      super()
      EventEmitter.call(this)

      if (evtConst) {
        for (const [ evt, listeners ] of evtConst.entries()) {
          listeners.forEach((listener) => {
            this.on(evt, listener)
          })
        }

        // clean up
        evtConst.clear()
      }

      if (evtProto) {
        for (const [ evt, listeners ] of evtProto.entries()) {
          listeners.forEach((listener) => {
            this.on(evt, listener)
          })
        }

        // clean up
        evtProto.clear()
      }

      // clean up
      eventMap.delete(Clazz)
      eventMap.delete(Clazz.prototype)
    }
  }

  applyMixins(PluginWrapper, EventEmitter)
  return PluginWrapper
}

function applyMixins(derivedCtor: any, ...baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
          derivedCtor.prototype[name] = baseCtor.prototype[name]
      })
  })
}
