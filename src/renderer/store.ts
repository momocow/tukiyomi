import Vue from 'vue'
import Vuex, { Store, Module } from 'vuex'
import set from 'lodash/set'

Vue.use(Vuex)

const config: Module<object, object> = {
  namespaced: true,
  state: {
    app: {
      general: {
        setDMMCookie: true,
        disableDMMDialog: true
      }
    }
  },
  mutations: {
    load (state, { namespace, config }: { namespace: string, config: any }) {
      set(state, namespace, config)
    },
    change (state, { namespace, key, value }: { namespace: string, key: string, value: any }) {
      set(state, `${namespace}.${key}`, value)
    }
  }
}

const i18n: Module<object, object> = {

}

export default new Store({
  modules: {
    config,
    i18n
  }
})
