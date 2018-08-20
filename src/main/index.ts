import { VIEW_ENTRY, IS_DEV } from './init'

import { app, BrowserWindow } from 'electron'

function createWindow () {
  const window: BrowserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
    }
  })

  if (process.env.ELECTRON_WEBPACK_WDS_PORT) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    window.loadURL(VIEW_ENTRY)
  }

  window.webContents.on('did-finish-load', function () {
    if (IS_DEV) {
      window.webContents.openDevTools({
        mode: "undocked"
      })
    }
  })
}

app.on('ready', createWindow)
