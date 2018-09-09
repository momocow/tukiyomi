/* global DMM */

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
