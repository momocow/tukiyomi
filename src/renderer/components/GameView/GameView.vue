<template>
  <div class="gameview">
    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
    <webview
      ref="gameview"
      src="about:blank"
      :preload="preload"
      disablewebsecurity
      webpreferences="zoomFactor=1">
    </webview>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { join } from 'path'

import { appLogger } from '../../logging/loggers'
import { IS_DEV, ASSETS_DIR } from '../../env'

// import Guest from '../../../common/Guest'
// import captureCanvas from './guest/scripts/captureCanvas'

import store from '../../configuring/store'

import tweakView from './tweakView'
import { command } from '../../ipc'

@Component({
  name: 'GameView'
})
export default class GameView extends Vue {
  public src: string = store.state.config.app.misc.entranceURL
  public preload: string = join(ASSETS_DIR, 'scripts', 'webview-preload.js')

  async capture () {
    // return await Guest(<Electron.WebviewTag> this.$refs.gameview)
    //   .run(captureCanvas)
  }

  mounted () {
    appLogger.debug('Gameview: mounted.')

    const gameview = <Electron.WebviewTag> this.$refs.gameview
    let startLoadingTime: number

    gameview.addEventListener('did-start-loading', function () {
      appLogger.debug('Gameview: start loading')
      startLoadingTime = Date.now()
    })

    gameview.addEventListener('dom-ready', function loadGame () {
      const url = gameview.getURL()
      const elapsed = Date.now() - startLoadingTime
      appLogger.debug('Gameview: finish loading')
      appLogger.debug('Gameview: has been navigated to "%s"', url)
      appLogger.debug('Gameview: elapsed = %d ms', elapsed)

      if (store.state.config.app.misc.entranceURL === url.replace(/\/$/, '')) {
        command('gameview.id', gameview.getWebContents().id)
      }

      if (IS_DEV && !gameview.isDevToolsOpened()) gameview.openDevTools()

      tweakView(gameview)
    })

  }
}
</script>

<style scoped>
  .gameview {
    position: absolute;
    top: 0;
    display: inline-block;
    width: 100%;
    max-width: 1200px;
    max-height: 720px;
    line-height: 0 !important;
  }
  .gameview>img {
    width: 60%;
  }
  .gameview>webview {
    overflow: hidden;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>

