import Vue from 'vue'
import MainApp from './MainApp.vue'

const app = new Vue({
  el: 'app',
  render: (h) => { h(MainApp) }
})
