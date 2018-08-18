import { app, BrowserWindow } from 'electron'
import * as path from 'path'

import { VIEWS_DIR } from './constants'

function createWindow () {
  const window: BrowserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
    }
  })
  window.loadFile(VIEWS_DIR)
  window.webContents.openDevTools({
    mode: "undocked"
  })
}

app.on('ready', createWindow)
