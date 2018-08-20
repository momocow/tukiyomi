import './index.css'

import Vue from 'vue'

import MainApp from './MainApp.vue'

import ref from '../common/references'

import Logger from './services/Logger'
import Config from './services/Config'
import I18n from './services/I18n'

import { KANCOLLE_URL } from '../common/constants'
import { remote } from 'electron'

window.onload = function () {
  const root = new Vue({
    el: '#app',
    render: (h) => h(MainApp)
  })

  ref.namespace('vue')
    .set('root', root, { readonly: true })
}

const config = new Config('core:renderer')

config.on('load', function () {
  // [TODO] User config may not be valid!!!
  const loglevel = config.get('log.level', 'WARN')
  const lang = config.get('i18n.lang', 'zh-TW')

  const logger = new Logger('core:renderer')
  logger.setLevel(loglevel)
  ref.set('logger', logger, { readonly: true })

  const i18n = new I18n(lang)
  ref.set('i18n', i18n, { readonly: true })
})

ref.set('config', config, { readonly: true })

remote.getCurrentWebContents().on('dom-ready', async function () {
  const gameview: Electron.WebviewTag = await ref.namespace('dom').ensure('gameview')
  gameview.addEventListener('dom-ready', function loadGame () {
    gameview.loadURL(KANCOLLE_URL)
    // once
    gameview.removeEventListener('dom-ready', loadGame)
  })
})
