/* global DMM */

const { remote } = require('electron')

/**
 * TODO check setCookie config
 */
const sess = remote.getCurrentWebContents().session
const userAgent = sess.getUserAgent()
sess.setUserAgent(userAgent, 'ja-JP')

window.addEventListener('load', function () {
  const ticket = setInterval(function () {
    try {
      if (DMM && DMM.netgame && typeof DMM.netgame.reloadDialog === 'function') {
        DMM.netgame.reloadDialog = function () {}
        console.debug('DMM warning dialog is disabled.')
        clearInterval(ticket)
      }
    } catch (e) { }
  }, 1000)
})
