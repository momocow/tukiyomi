<template>
  <v-app dark>
    <v-content>
      <v-container fluid fill-height>
        <game-view></game-view>
      </v-container>
    </v-content>
    <v-system-bar app fixed color="blue-grey darken-3" dark id="status-bar">
      <span>{{statusMsg}}</span>
      <v-spacer></v-spacer>
      <span>{{time.toLocaleString()}}</span>
    </v-system-bar>
  </v-app>
</template>

<style scoped>
/* TODO Maybe reducing important keywords */
.v-system-bar {
  bottom: 0 !important;
  top: auto !important;
  user-select: none !important;
  cursor: default !important;
}
.v-content {
  padding: 0 !important;
}
.v-content>.v-content__wrap>.container {
  padding: 0 !important;
}
</style>


<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import GameView from './components/GameView'

import { subscribe } from './ipc'
import { Event } from 'electron'

@Component({
  name: 'MainApp',
  components: {
    GameView
  }
})
export default class MainApp extends Vue {
  public statusMsg: string = ''
  public time: Date = new Date()
  private timer: any

  mounted () {
    (<HTMLDivElement>document.getElementById('status-bar')).style.height = '32px'

    let statusTimer: any
    subscribe('status-msg', (evt: Event, msg: string) => {
      if (statusTimer) {
        clearTimeout(statusTimer)
      }
      this.statusMsg = msg
      statusTimer = setTimeout(() => {
        this.statusMsg = ''
        statusTimer = undefined
      }, 10000)
    })

    this.timer = setInterval(() => {
      this.time = new Date()
    }, 1000)
  }

  destroy () {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>