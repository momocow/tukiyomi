/* global DMM */

const { ipcRenderer } = require('electron')

window.addEventListener('keydown', function (e) {
  if (e.code === 'F5') {
    ipcRenderer.send(`cmd:reload`)
    location.reload(e.ctrlKey)
  }
})

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
