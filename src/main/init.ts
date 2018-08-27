/************************
 * Initialization
 ************************/
import { app } from 'electron'
import { appPool, gamePool, appLogger } from './logging/loggers'
appPool.timestamp('START')
gamePool.timestamp('START')

process.on('SIGINT', function () {
  app.quit()
})

process.on('SIGTERM', function () {
  app.quit()
})

app.on('will-quit', function (e) {
  appPool.timestamp('END')
  appPool.flushSync()
  gamePool.timestamp('END')
  gamePool.flushSync()
})

import sentry from '@sentry/electron'
import { SENTRY_DSN } from '../common/config'
// error report to Sentry
if (IS_RELEASE) {
  sentry.init({
    dsn: SENTRY_DSN,
    release: RELEASE
  })
}

import { IS_RELEASE, RELEASE, IS_DEV, ASSETS_DIR } from './env'
import { registerService, registerCommand } from './ipc'

import { configMap } from './configuring/configs'

registerService('config', async function (namespace: string, key?: string, defVal?: any) {
  appLogger.debug('Config "%s": fetching', namespace)
  const confObj = configMap.get(namespace)
  if (confObj) {
    appLogger.debug('Config "%s": instance found', namespace)
    if (!confObj.hasInit) {
      appLogger.debug('Config "%s": waiting for loading', namespace)
      await new Promise(function (resolve, reject) {
        const onLoad = function () {
          appLogger.debug('Config "%s": loaded', namespace)
          confObj.removeListener('error', onError)
          resolve()
        }
        const onError = function (err: Error) {
          appLogger.debug('Config "%s": error', namespace)
          appLogger.error('%O', err)
          sentry.captureException(err)
          confObj.removeListener('load', onLoad)
          reject(new Error('Failed to load config'))
        }
        confObj
          .once('load', onLoad)
          .once('error', onError)
      })
    }

    appLogger.debug('Config "%s": sending through IPC', namespace)
    return typeof key === 'string' ? confObj.get(key, defVal) : confObj.toJSON()
  }
})

// IPC services/commands registration
registerService('env', function () {
  return {
    IS_DEV,
    IS_RELEASE,
    RELEASE,
    ASSETS_DIR
  }
})

registerCommand('logger', function (txt: string) {
  appPool.push(txt)
})
