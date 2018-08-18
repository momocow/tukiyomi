<template>
  <div class="gameview">
    <webview ref="gameview" src='about:blank' disablewebsecurity></webview>
  </div>
</template>

<script>
import { remote } from 'electron'
import { viewConf } from '../../scripts/globals'
export default {
  name: 'GameView',
  mounted () {
    /**
     * @type {{gameview: Electron.WebviewTag}}
     */
    const { gameview } = this.$refs
    remote.getCurrentWebContents().on('dom-ready', function () {
      // console.log(gameview, gameview.src)
      gameview.loadURL(viewConf.get('entry-page', 'https://www.dmm.com/my/-/login/=/path=Sg9VTQFXDFdnFh5TUlgFWA0JUxk_'))
    })
  }
}
</script>
