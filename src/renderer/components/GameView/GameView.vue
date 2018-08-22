<template>
  <div class="gameview">
    <webview ref="gameview" :src="src" :preload="preload" disablewebsecurity></webview>
  </div>
</template>

<script lang="ts">
///<reference path="../../../types/index.d.ts" />

import Vue from 'vue'
import Component from 'vue-class-component'
import { parse as parseURL } from 'url'
import { join } from 'path'

import { mainLogger } from '../../logging/loggers'
import { IS_DEV } from '../../env'

const CSS_LOGIN_FORM = require('!!raw-loader!../../assets/guest/login/login-form.css')
const SCRIPT_ADD_DIMMER = require('!!raw-loader!../../assets/guest/login/add-dimmer.js')
const SCRIPT_DMM_COOKIE = require('!!raw-loader!../../assets/guest/login/dmm-cookie.js')
const CSS_GAME_LAYOUT = require('!!raw-loader!../../assets/guest/game/game-layout.css')
const SCRIPT_GAME_LAYOUT = require('!!raw-loader!../../assets/guest/game/game-layout.js')

import { KANCOLLE_URL, DMM_HOSTNAME } from '../../../common/config'

@Component({
  name: 'GameView'
})
export default class GameView extends Vue {
  public src: string = KANCOLLE_URL
  public preload: string = join(__static, 'dmm-init.js')

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
      gameview.removeEventListener('dom-ready', loadGame)

      if (IS_DEV) gameview.openDevTools()

      const { hostname, pathname } = parseURL(gameview.getURL())
      const { pathname: gamePath } = parseURL(KANCOLLE_URL)

      if (hostname === DMM_HOSTNAME && pathname) {
        if (pathname.startsWith('/my/-/login')) {
          gameview.executeJavaScript(SCRIPT_ADD_DIMMER)
          gameview.executeJavaScript(SCRIPT_DMM_COOKIE)
          gameview.insertCSS(CSS_LOGIN_FORM)
        } else if (gamePath && pathname.startsWith(gamePath)) {
          gameview.insertCSS(CSS_GAME_LAYOUT)
          gameview.executeJavaScript(SCRIPT_GAME_LAYOUT)
        }
      }
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

