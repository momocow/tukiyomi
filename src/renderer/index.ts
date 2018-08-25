import './assets/styles/index.css'

import { appLogger } from './logging/loggers'
appLogger.info('Start initailization')

import Vue from 'vue'

import MainApp from './MainApp.vue'
import store from './store'

// import ref from '../common/refdb'

import { remote } from 'electron'

window.onload = function () {
  appLogger.debug('Client window is loaded.')

  new Vue({
    store,
    el: '#app',
    render: (h) => h(MainApp)
  })

  // ref.namespace('vue')
  //   .set('root', root, { readonly: true })
}

remote.getCurrentWebContents().on('dom-ready', async function () {
  appLogger.debug('Client DOM is ready.')
})
