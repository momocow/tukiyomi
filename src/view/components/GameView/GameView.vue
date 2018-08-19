<template>
  <div class="gameview">
    <webview ref="gameview" src='about:blank' disablewebsecurity></webview>
  </div>
</template>

<script lang="ts">
import { remote } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'

import ref from '../../../common/references'

interface GameViewLoadingOption {
  wait?: boolean
}

@Component({
  name: 'GameView'
})
export default class GameView extends Vue {
  $refs: { gameview: Electron.WebviewTag }

  mounted () {
    // register the webview reference
    ref.namespace('dom')
      .set('gameview', this.$refs.gameview, { readonly: true })
  }
}
</script>
