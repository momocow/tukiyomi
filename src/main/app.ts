import { VIEW_ENTRY, IS_DEV } from './init'

import { app, BrowserWindow } from 'electron'
// import * as path from 'path'

import _get from 'lodash/get'
import ref from '../common/references'

function createWindow () {
  const window: BrowserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
    }
  })
  window.loadFile(VIEW_ENTRY)
  window.webContents.on('did-finish-load', function () {
    if (IS_DEV) {
      window.webContents.openDevTools({
        mode: "undocked"
      })
    }
  })
}

app.on('ready', createWindow)
