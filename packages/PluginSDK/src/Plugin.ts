///<reference path="./global.d.ts" />

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
  return class extends Clazz {
    public options: TukiYomi.Plugin.PluginOptions = options || {}
    constructor (dir: string) {
      super(dir)
    }
  }
}
