import WindowKeeper from 'electron-window-state'
import { BrowserWindow, shell } from 'electron'

import { GUEST_URL_WHITELIST, KANCOLLE_URL } from '../../common/config'

import { appLogger } from '../logging/loggers'
import { appConfig } from '../configuring/configs'
import pluginLoader from '../plugin/loader'

import proxy from '../proxy/proxies'

import { IS_DEV } from '../env'
import { publish } from '../ipc'

const HOST_URL_WHITELIST = [
  `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
]

export let mainWindow: BrowserWindow | null = null

export function createMainWindow () {
  if (mainWindow) return

  const winState = WindowKeeper({
    defaultWidth: 1000,
    defaultHeight: 624
  })

  const { x, y, width, height } = winState

  mainWindow = new BrowserWindow({
    x, y,
    width,
    height,
    minWidth: 500,
    minHeight: 300
  })

  winState.manage(mainWindow)
  mainWindow.setMenu(null)

  proxy.listen(function () {
    if (!mainWindow) return

    if (process.env.ELECTRON_WEBPACK_WDS_PORT) {
      mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    } else {
      mainWindow.loadFile(IS_DEV ? 'dist/renderer/index.html' : 'index.html')
    }
  })

  if (IS_DEV) {
    mainWindow.webContents.openDevTools({
      mode: "undocked"
    })
  }

  mainWindow.on('resize', function () {
    if (mainWindow) {
      const [ width, height ] = mainWindow.getSize()
      publish('window-resize', width, height)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (HOST_URL_WHITELIST.filter((rule) => new RegExp(rule).test(url)).length > 0) {
      appLogger.debug('Whitelist validated: ', url)
      return
    }

    // disable main UI to be redirect
    e.preventDefault()
    appLogger.debug('Navigation has been prevented: %s', url)
    shell.openExternal(url)
  })

  mainWindow.webContents.on('did-attach-webview', function (e, _gameview) {
    _gameview.on('will-navigate', function (e, url) {
      if (
        GUEST_URL_WHITELIST.concat([
          _gameview.getURL()
        ]).filter((rule) => new RegExp(rule).test(url)).length > 0
      ) {
        appLogger.debug('Gameview: Whitelist validated: ', url)
        return
      }

      // disable main UI to be redirect
      e.preventDefault()
      appLogger.debug('Gameview: Navigation has been prevented: %s', url)
      shell.openExternal(url)
    })

    _gameview.session.setProxy({
      proxyRules: `127.0.0.1:${proxy.port()}`,
      proxyBypassRules: '<local>,*.google-analytics.com,*.doubleclick.net',
      pacScript: ''
    }, function () {
      const entranceURL = appConfig.get('misc.entranceURL', KANCOLLE_URL)
      _gameview.loadURL(entranceURL, {
        userAgent: _gameview.getUserAgent()
          .replace(/tukiyomi\/\d+\.\d+\.\d+/, '')
          .replace(/Electron\/\d+\.\d+\.\d+/, '')
          .replace(/ +/g, ' ')
      })
      _gameview.session.setUserAgent(_gameview.session.getUserAgent(), 'ja-JP')
    })
  })
  pluginLoader.startAll()
}
