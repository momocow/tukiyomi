import { ipcRenderer } from 'electron'
import Vue from 'vue'

import MainApp from './MainApp.vue'

import ref from '../common/references'

import Logger from './services/Logger'
import Config from './services/Config'
import I18n from './services/I18n'

window.onload = function () {
  const root = new Vue({
    el: '#app',
    render: (h) => h(MainApp)
  })

  ref.namespace('vue')
    .set('root', root, { readonly: true })
}

const config = new Config('core:view')
config.init(ipcRenderer)

config.on('load', function () {
  // [TODO] User config may not be valid!!!
  const loglevel = config.get('log.level', 'WARN')
  const lang = config.get('i18n.lang', 'zh-TW')

  const logger = new Logger('core:view')
  logger.init(ipcRenderer)
  logger.setLevel(loglevel)
  ref.set('logger', logger, { readonly: true })

  const i18n = new I18n(lang)
  i18n.init(ipcRenderer)
  ref.set('i18n', i18n, { readonly: true })
})

ref.set('config', config, { readonly: true })
