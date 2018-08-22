/* global DMM */

const { remote } = require('electron')

window.addEventListener('load', function () {
  DMM && DMM.netgame && (DMM.netgame.reloadDialog = function () {})

  const sess = remote.getCurrentWebContents().session
  const userAgent = sess.getUserAgent()
  sess.setUserAgent(userAgent, 'ja-JP')
})
