<template>
  <v-app dark>
    <v-content>
      <v-container fluid fill-height>
        <game-view></game-view>
      </v-container>
    </v-content>
    <v-system-bar app fixed status color="blue-grey darken-3" dark>
      <v-spacer></v-spacer>
      <span>{{time.toLocaleString()}}</span>
    </v-system-bar>
  </v-app>
</template>

<style scoped>
.v-system-bar {
  bottom: 0 !important;
  top: auto !important;
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

@Component({
  name: 'MainApp',
  components: {
    GameView
  }
})
export default class MainApp extends Vue {
  public time: Date = new Date()
  private timer: any

  mounted () {
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