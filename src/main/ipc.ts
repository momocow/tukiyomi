import { ipcMain } from 'electron'

import { RELEASE } from './init'

function wrap ( ) {
  
}


ipcMain.on('get:release', (evt: Electron.Event) => {
  evt.sender.
  return RELEASE
})
