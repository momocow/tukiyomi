/************************
 * Initialization
 ************************/
import { app } from 'electron'
import { appPool, gamePool } from './logging/loggers'
appPool.timestamp('START')
gamePool.timestamp('START')

app.on('will-quit', function (e) {
  appPool.timestamp('END')
  appPool.flushSync()
  gamePool.timestamp('END')
  gamePool.flushSync()
})

import sentry from '@sentry/electron'

import { IS_RELEASE, RELEASE, IS_DEV } from './env'
import { registerService, registerCommand } from './ipc'

import { SENTRY_DSN } from '../common/config'

// error report to Sentry
if (IS_RELEASE) {
  sentry.init({
    dsn: SENTRY_DSN,
    release: RELEASE
  })
}

// IPC services/commands registration
registerService('env', function () {
  return {
    isDev: IS_DEV,
    isRelease: IS_RELEASE,
    release: RELEASE
  }
})

registerCommand('logger', function (txt: string) {
  appPool.push(txt)
})
