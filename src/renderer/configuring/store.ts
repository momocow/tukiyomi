import Vue from 'vue'
import Vuex, { Store, Module } from 'vuex'
import set from 'lodash/set'

import { appConfig } from './configs'

Vue.use(Vuex)

interface ConfigStore {
  app: TukiYomi.AppConfig
}

const config: Module<ConfigStore, object> = {
  namespaced: true,
  state: {
    app: appConfig.toJSON()
  },
  mutations: {
    change (state, { namespace, key, value }: { namespace: string, key: string, value: any }) {
      set(state, `${namespace}.${key}`, value)
    }
  }
}

const i18n: Module<object, object> = {

}

interface GlobalStore {
  config: ConfigStore
}

const store = new Store<GlobalStore>({
  modules: {
    config,
    i18n
  }
})

appConfig.on('change', (key, value) => {
  store.commit('config/change', {
    namespace: 'app', key, value
  })
})

export default store
