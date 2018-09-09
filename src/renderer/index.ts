///<reference path="../../types/index.d.ts" />

import './assets/styles/index.css'

import { appLogger } from './logging/loggers'
appLogger.info('Start initailization')

import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

import store from './configuring/store'
import MainApp from './MainApp.vue'

window.onload = function () {
  appLogger.debug('Client window is loaded.')

  new Vue({
    store,
    el: '#app',
    render: (h) => h(MainApp)
  })
}
