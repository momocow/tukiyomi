/************************
 * Initialization
 ************************/
import { app, webContents } from 'electron'
import { VMError } from 'vm2'
import * as Sentry from '@sentry/electron'

import { SENTRY_DSN } from '../common/config'
import Guest from '../common/Guest'
import { injectCanvasRecorder } from '../common/guest/canvasRecorder'
import { poolMap, appLogger, appPool, loggerMap, streamLogger } from './logging/loggers'
import * as env from './env'
import { registerService, registerCommand, publish } from './ipc'
import { configMap, appConfig } from './configuring/configs'
import pluginLoader from './plugin/loader'
import { createMainWindow } from './window/MainWindow'

import streamServer from './streaming/StreamServer'

async function main () {
  const loading: Promise<void>[] = []
  // load configs
  for (const [nsp, config] of configMap.entries()) {
    config
      .on('change', function (key: string, newVal: any, oldVal: any) {
        publish(`config.change[${nsp}]`, key, newVal, oldVal)
      })
      .on('error', function (err) {
        appLogger.warn('Failed to load the config "%s".', nsp)
        appLogger.warn(err)
      })
    loading.push(config.load())
  }

  await Promise.all(loading)

  // All configs are ready after this line

  registerService('config', function (namespace: string, key?: string, defVal?: any) {
    appLogger.debug('Config "%s": fetching', namespace)
    const confObj = configMap.get(namespace)
    if (confObj) {
      appLogger.debug('Config "%s": instance found', namespace)
      return typeof key === 'string' ? confObj.get(key, defVal) : confObj.toJSON()
    }
  })

  publish('config.ready')

  streamServer.listen()

  // apply configs
  pluginLoader.registry = appConfig.get('plugin.registry', pluginLoader.registry)
  await pluginLoader.load()

  if (!app.isReady()) {
    app.once('ready', createMainWindow)
  } else {
    createMainWindow()
  }
}

// error report to Sentry
if (env.IS_RELEASE) {
  Sentry.init({
    dsn: SENTRY_DSN,
    release: env.RELEASE
  })
}

process
  .on('uncaughtException', e => {
    if (e instanceof VMError) return
    appLogger.error('Uncaught Exception:')
    appLogger.error('%O', e)
    Sentry.captureException(e)
    app.quit()
  })
  .on('unhandledRejection', e => {
    appLogger.error('Unhandled Rejection:')
    appLogger.error('%O', e)
    Sentry.captureException(e)
    app.quit()
  })

poolMap.forEach(pool => {
  pool.timestamp('START')
})

process.on('SIGINT', function () {
  app.quit()
})

process.on('SIGTERM', function () {
  app.quit()
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('will-quit', function (e) {
  console.info('Has quit! Cleaning up soon...')

  pluginLoader.stopAll()
  pluginLoader.clear()

  loggerMap.clear()

  configMap.forEach((config) => {
    config.reset(true)
  })
  configMap.clear()

  poolMap.forEach(pool => {
    pool.timestamp('END')
    pool.flushSync()
  })
})

main()

// IPC services/commands registration
registerService('env', function () {
  return { ...env }
})

// registerService('stream.port', async function () {
//   if (streamServer.isListening()) {
//     return streamServer.port()
//   }
  
//   return new Promise(function (resolve) {
//     streamServer.onListen(function () {
//       resolve(streamServer.port())
//     })
//   })
// })

registerCommand('logger', function (txt: string) {
  appPool.push(txt)
})

registerCommand('gameview.id', async function (id: number) {
  const gameWebContent = webContents.fromId(id)
  const guest = Guest(gameWebContent)

  if (streamServer.isListening()) {
    await guest.run(injectCanvasRecorder, [ streamServer.port() ])
  } else {
    await new Promise(function (resolve) {
      streamServer.onListen(() => {
        guest.run(injectCanvasRecorder, [ streamServer.port() ])
          .then(function () {
            resolve()
          })
      })
    })
  }
  streamLogger.info('Canvas Recorder injected')
  setImmediate(function () {
    pluginLoader.broadcast('app.ready')
  })
})

registerCommand('reload', function () {
  pluginLoader.broadcast('network.reload')
})

// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36