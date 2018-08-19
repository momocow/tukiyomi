<template>
  <div class="gameview">
    <webview ref="gameview" src='about:blank' disablewebsecurity></webview>
  </div>
</template>

<script>
import { remote } from 'electron'
// import exported from '../../scripts/reference'

export default {
  name: 'GameView',
  mounted () {
    /**
     * @type {{gameview: Electron.WebviewTag}}
     */
    const { gameview } = this.$refs
    
  }
}
</script>
