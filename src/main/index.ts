/******************************************************************/
/**/ // Bootsrap
/**/ import './init'
/**/
/**/ import state from '../common/state'
/**/ import { appLogger } from './logging/loggers'
/**/
/**/ import { LOG_TRANSITION_START, LOG_TRANSITION_END } from '../common/config'
/**/
/**/ state
/**/   .on('stage', function (stage, prevStage) {
/**/     if (prevStage) {
/**/       appLogger.info(LOG_TRANSITION_END, stage)
/**/     }
/**/     appLogger.info(LOG_TRANSITION_START, stage)
/**/   })
/**/   .set('stage', 'init')
/**/
/******************************************************************/

import { app, BrowserWindow, shell } from 'electron'
import WindowKeeper from 'electron-window-state'

import { GUEST_URL_WHITELIST } from '../common/config'

import { IS_DEV } from './env'
import { publish } from './ipc'

export const HOST_URL_WHITELIST = [
  `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
]

function createWindow () {
  const winState = WindowKeeper({
    defaultWidth: 1000,
    defaultHeight: 600
  })

  const { x, y, width, height } = winState
  
  let window: BrowserWindow | null = new BrowserWindow({
    x, y, width, height,
    minWidth: 500,
    minHeight: 300
  })

  winState.manage(window)
  window.setMenu(null)

  if (process.env.ELECTRON_WEBPACK_WDS_PORT) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    window.loadFile(IS_DEV ? 'dist/renderer/index.html' : 'index.html')
  }

  if (IS_DEV) {
    window.webContents.openDevTools({
      mode: "undocked"
    })
  }

  window.on('resize', function () {
    if (window) {
      const [ width, height ] = window.getSize()
      publish('window-resize', width, height)
    }
  })

  window.on('closed', () => {
    window = null
  })

  window.webContents.on('will-navigate', (e, url) => {
    if (HOST_URL_WHITELIST.filter((rule) => new RegExp(rule).test(url)).length > 0) {
      appLogger.debug('Whitelist validated: ', url)
      return
    }

    // disable main UI to be redirect
    e.preventDefault()
    appLogger.debug('Navigation has been prevented: %s', url)
    shell.openExternal(url)
  })

  window.webContents.on('did-attach-webview', function (e, gameview) {
    gameview.on('will-navigate', function (e, url) {
      if (GUEST_URL_WHITELIST.filter((rule) => new RegExp(rule).test(url)).length > 0) {
        appLogger.debug('Gameview: Whitelist validated: ', url)
        return
      }

      // disable main UI to be redirect
      e.preventDefault()
      appLogger.debug('Gameview: Navigation has been prevented: %s', url)
      shell.openExternal(url)
    })

    // gameview.session.setProxy({
    //   proxyRules: ''
    // })
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  app.quit()
})
