import Logger from '@grass/grass-logger'

import { IS_DEV } from '../env'
import { APP_LOGGER_NAME, PROXY_LOGGER_NAME, LOG_ENTRY_TPL, STREAM_LOGGER_NAME } from '../../common/config'

// TODO
// import { normalizePluginName } from 'common'

import LogPool from './LogPool'

export const poolMap: LogPool[] = []

export const appPool = new LogPool('app.log')
export const gamePool = new LogPool('game.log')

export const loggerMap: Map<string, Logger> = new Map()

poolMap.push(appPool)
poolMap.push(gamePool)

export const gameLogger = new Logger('game')
gameLogger.setLevel('ALL')
gameLogger.template = '[{time}] {message}'
gameLogger.renderer = function (entry) {
  return {
    ...entry,
    time: entry.time.toISOString(),
  }
}
gamePool.associate(gameLogger)

export function getLogger (name: string): Logger {
  let logger = loggerMap.get(name)
  if (!logger) {
    logger = new Logger(name)
    loggerMap.set(name, logger)
    logger.setLevel(IS_DEV ? 'ALL' : 'INFO')
    logger.template = LOG_ENTRY_TPL
    logger.renderer = function (entry) {
      return {
        ...entry,
        time: entry.time.toISOString(),
        level: entry.level.toString().padEnd(5),
        process: 'MAIN  '
      }
    }
    appPool.associate(logger)
  }
  return logger
}

export function getPluginLogger (plugin: string): Logger {
  const name = 'Plugin/' + normalizePluginName(plugin)
  let logger = loggerMap.get(name)
  if (!logger) {
    logger = new Logger(name)
    loggerMap.set(name, logger)
    logger.setLevel(IS_DEV ? 'ALL' : 'INFO')
    logger.template = LOG_ENTRY_TPL
    logger.renderer = function (entry) {
      return {
        ...entry,
        time: entry.time.toISOString(),
        level: entry.level.toString().padEnd(5),
        process: 'MAIN  '
      }
    }
    const pluginLogPool = new LogPool(`./plugins/${plugin}.log`)
    pluginLogPool.associate(logger)
    poolMap.push(pluginLogPool)
    pluginLogPool.timestamp('START')
  }
  return logger
}

export const appLogger = getLogger(APP_LOGGER_NAME)
export const proxyLogger = getLogger(PROXY_LOGGER_NAME)
export const streamLogger = getLogger(STREAM_LOGGER_NAME)
