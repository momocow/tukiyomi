<template>
  <div class="gameview">
    <webview ref="gameview" src='about:blank' disablewebsecurity></webview>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { mainLogger } from '../../logging/loggers'
import { IS_DEV } from '../../env'

import { KANCOLLE_URL } from '../../../common/config'

@Component({
  name: 'GameView'
})
export default class GameView extends Vue {
  mounted () {
    mainLogger.debug('Gameview: mounted.')

    const gameview = <Electron.WebviewTag> this.$refs.gameview
    let startLoadingTime: number

    gameview.addEventListener('did-start-loading', function () {
      mainLogger.debug('Gameview: start loading')
      startLoadingTime = Date.now()
    })

    gameview.addEventListener('did-stop-loading', function () {
      const url = gameview.getURL()
      const elapsed = Date.now() - startLoadingTime
      mainLogger.debug('Gameview: stop loading')
      mainLogger.debug('Gameview: has been navigated to "%s"', url)
      mainLogger.debug('Gameview: elapsed = %d ms', elapsed)
    })

    gameview.addEventListener('dom-ready', function loadGame () {
      mainLogger.debug('Gameview: ready.')

      if(IS_DEV){
        gameview.openDevTools()
      }
      gameview.loadURL(KANCOLLE_URL)
      gameview.removeEventListener('dom-ready', loadGame)
    })
  }
}
</script>

<style>
  .gameview, .gameview>webview {
    width: 100%;
    height: 100%;
  }
</style>

