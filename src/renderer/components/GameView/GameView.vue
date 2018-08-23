<template>
  <div class="gameview">
    <webview ref="gameview" :src="src" :preload="preload" disablewebsecurity></webview>
  </div>
</template>

<script lang="ts">
///<reference path="../../../types/index.d.ts" />

import Vue from 'vue'
import Component from 'vue-class-component'
import { join } from 'path'

import { mainLogger } from '../../logging/loggers'
import { IS_DEV } from '../../env'

import onPageLoaded from './page-loaded'

// const SCRIPT_ADD_DIMMER = require('!!raw-loader!../../assets/guest/login/add-dimmer.js')
// const SCRIPT_DMM_COOKIE = require('!!raw-loader!../../assets/guest/login/dmm-cookie.js')
// const SCRIPT_GAME_LAYOUT = require('!!raw-loader!../../assets/guest/game/game-layout.js')

import { KANCOLLE_URL } from '../../../common/config'

@Component({
  name: 'GameView'
})
export default class GameView extends Vue {
  public src: string = KANCOLLE_URL
  public preload: string = join(__static, 'webview-preload.js')

  mounted () {
    mainLogger.debug('Gameview: mounted.')

    const gameview = <Electron.WebviewTag> this.$refs.gameview
    let startLoadingTime: number

    gameview.addEventListener('did-start-loading', function () {
      mainLogger.debug('Gameview: start loading')
      startLoadingTime = Date.now()
    })

    gameview.addEventListener('did-finish-load', function loadGame () {
      const url = gameview.getURL()
      const elapsed = Date.now() - startLoadingTime
      mainLogger.debug('Gameview: finish loading')
      mainLogger.debug('Gameview: has been navigated to "%s"', url)
      mainLogger.debug('Gameview: elapsed = %d ms', elapsed)

      if (IS_DEV && !gameview.isDevToolsOpened()) gameview.openDevTools()

      onPageLoaded(gameview)
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

