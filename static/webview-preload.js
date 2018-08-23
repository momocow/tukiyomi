/* global DMM */

const { remote } = require('electron')

/**
 * TODO check setCokkie config
 */
const sess = remote.getCurrentWebContents().session
const userAgent = sess.getUserAgent()
sess.setUserAgent(userAgent, 'ja-JP')

window.addEventListener('load', function () {
  if (DMM && DMM.netgame) {
    DMM.netgame.reloadDialog = function () {}
  }
})
