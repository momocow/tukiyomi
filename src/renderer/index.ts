import './assets/styles/index.css'

import { mainLogger } from './logging/loggers'
mainLogger.info('Start initailization')

import Vue from 'vue'
import MainApp from './MainApp.vue'

import ref from '../common/refdb'

import { remote } from 'electron'

window.onload = function () {
  mainLogger.debug('Client window is loaded.')

  const root = new Vue({
    el: '#app',
    render: (h) => h(MainApp)
  })

  ref.namespace('vue')
    .set('root', root, { readonly: true })
}

remote.getCurrentWebContents().on('dom-ready', async function () {
  mainLogger.debug('Client DOM is ready.')
})
