import { app, BrowserWindow } from 'electron'
import * as path from 'path'

import { VIEWS_ENTRY } from './constants'

function createWindow () {
  const window = new BrowserWindow({
    width: 800,
    height: 600
  })
  window.loadFile(VIEWS_ENTRY)
  window.webContents.openDevTools({
    mode: "undocked"
  })
}

app.on('ready', createWindow)
