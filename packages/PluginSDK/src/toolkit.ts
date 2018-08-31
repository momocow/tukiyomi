export const toolkit = {
  config: <typeof global.config>new Proxy({}, {
    get: function (target, prop) {
      if (typeof prop === 'string' &&
        typeof global.config === 'object' &&
        typeof (<{[k: string]: any}>global.config)[prop] === 'function'
      ) {
        return (<{[k: string]: any}>global.config)[prop].bind(global.config)
      }
      return undefined
    },

    set: function () {
      return false
    }
  }),

  i18n: <typeof global.i18n>new Proxy({}, {
    get: function (target, prop) {
      if (typeof prop === 'string' &&
        typeof global.config === 'object' &&
        typeof (<{[k: string]: any}>global.config)[prop] === 'function'
      ) {
        return (<{[k: string]: any}>global.config)[prop].bind(global.config)
      }
      return undefined
    },

    set: function () {
      return false
    }
  })
}
