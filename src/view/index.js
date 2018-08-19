import Vue from 'vue'
import MainApp from './MainApp.vue'

window.onload = function () {
  const app = new Vue({
    el: '#app',
    render: (h) => h(MainApp)
  })
}
