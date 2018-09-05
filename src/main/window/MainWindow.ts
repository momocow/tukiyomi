import WindowKeeper from 'electron-window-state'
import { BrowserWindow, shell } from 'electron'

import { GUEST_URL_WHITELIST, KANCOLLE_URL } from '../../common/config'

import { appLogger } from '../logging/loggers'
import { appConfig } from '../configuring/configs'

import proxy from '../proxy/proxies'

import { IS_DEV } from '../env'
import { publish } from '../ipc'

const HOST_URL_WHITELIST = [
  `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
]

export function createMainWindow () {
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

  proxy.listen(function () {
    if (!window) return

    if (process.env.ELECTRON_WEBPACK_WDS_PORT) {
      window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    } else {
      window.loadFile(IS_DEV ? 'dist/renderer/index.html' : 'index.html')
    }
  })

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

    gameview.session.setProxy({
      proxyRules: `127.0.0.1:${proxy.port()}`,
      proxyBypassRules: '<local>,*.google-analytics.com,*.doubleclick.net',
      pacScript: ''
    }, function () {
      const entranceURL = appConfig.get('misc.entranceURL', KANCOLLE_URL)
      gameview.loadURL(entranceURL, {
        userAgent: gameview.getUserAgent()
          .replace(/tukiyomi\/\d+\.\d+\.\d+/, '')
          .replace(/Electron\/\d+\.\d+\.\d+/, '')
          .replace(/ +/g, ' ')
      })
      gameview.session.setUserAgent(gameview.session.getUserAgent(), 'ja-JP')
    })
  })

}
