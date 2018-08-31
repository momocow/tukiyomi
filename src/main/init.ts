/************************
 * Initialization
 ************************/
import { app } from 'electron'
import { VMError } from 'vm2'
import * as Sentry from '@sentry/electron'

import { SENTRY_DSN } from '../common/config'
import { poolMap, appLogger, appPool, loggerMap } from './logging/loggers'
import { IS_RELEASE, RELEASE, IS_DEV, ASSETS_DIR } from './env'
import { registerService, registerCommand, publish } from './ipc'
import { configMap, appConfig } from './configuring/configs'
import pluginLoader from './plugin/loader'

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

  registerService('config', async function (namespace: string, key?: string, defVal?: any) {
    appLogger.debug('Config "%s": fetching', namespace)
    const confObj = configMap.get(namespace)
    if (confObj) {
      appLogger.debug('Config "%s": instance found', namespace)
      return typeof key === 'string' ? confObj.get(key, defVal) : confObj.toJSON()
    }
  })

  publish('config.ready')

  // apply configs
  pluginLoader.registry = appConfig.get('plugin.registry', pluginLoader.registry)
  pluginLoader.load()
}

// error report to Sentry
if (IS_RELEASE) {
  Sentry.init({
    dsn: SENTRY_DSN,
    release: RELEASE
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
