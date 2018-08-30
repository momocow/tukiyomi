///<reference path="./global.d.ts" />

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
  class PluginWrapper extends Clazz {
    public meta: TukiYomi.Plugin.PluginOptions = options || {}
    private eventMap: Map<string, Function[]> = new Map()

    constructor (dir: string) {
      super(dir)

      if (evtConst) {
        for (const [ evt, listeners ] of evtConst.entries()) {
          this.eventMap.set(evt, listeners)
        }

        // clean up
        evtConst.clear()
      }

      if (evtProto) {
        for (const [ evt, listeners ] of evtProto.entries()) {
          this.eventMap.set(evt, listeners)
        }

        // clean up
        evtProto.clear()
      }

      // clean up
      eventMap.delete(Clazz)
      eventMap.delete(Clazz.prototype)
    }

    emit (event: string, ...args: any[]): this {
      const listeners = this.eventMap.get(event)
      if (!listeners) return this
      
      if (listeners.length === 0) {
        this.eventMap.delete(event)
        return this
      }

      listeners.forEach((listener) => {
        listener.call(this, ...args)
      })
      return this
    }
  }
  return PluginWrapper
}
