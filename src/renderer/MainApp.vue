<template>
  <game-view></game-view>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import GameView from './components/GameView'

@Component({
  components: {
    GameView
  }
})
export default class MainApp extends Vue {
}
</script>