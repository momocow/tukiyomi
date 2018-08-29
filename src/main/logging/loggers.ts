import Logger from '@grass/grass-logger'
import { join } from 'path'

import { IS_DEV } from '../env'
import { APP_LOGGER_NAME, PROXY_LOGGER_NAME, LOG_ENTRY_TPL } from '../../common/config'

import LogPool from './LogPool'

export const poolMap: LogPool[] = []

export const appPool = new LogPool('app.log')
export const gamePool = new LogPool('game.log')

poolMap.push(appPool)
poolMap.push(gamePool)

function getGameLogger () {
  const logger = new Logger('game')
  logger.setLevel('ALL')
  logger.template = '[{time}] {message}'
  logger.renderer = function (entry) {
    return {
      ...entry,
      time: entry.time.toISOString(),
    }
  }
  gamePool.associate(logger)
  return logger
}

export function getLogger (name: string): Logger {
  const logger = new Logger(name)
  logger.setLevel(IS_DEV ? 'ALL' : 'WARN')
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
  return logger
}

export function getPluginLogger (dataRoot: string, displayName: string): Logger {
  const logger = new Logger(displayName)
  logger.setLevel(IS_DEV ? 'ALL' : 'WARN')
  logger.template = LOG_ENTRY_TPL
  logger.renderer = function (entry) {
    return {
      ...entry,
      time: entry.time.toISOString(),
      level: entry.level.toString().padEnd(5),
      process: 'MAIN  '
    }
  }
  const pluginLogPool = new LogPool(join(dataRoot, 'logs', 'plugin.log'))
  pluginLogPool.associate(logger)
  poolMap.push(pluginLogPool)
  return logger
}

export const gameLogger = getGameLogger()
export const appLogger = getLogger(APP_LOGGER_NAME)
export const proxyLogger = getLogger(PROXY_LOGGER_NAME)
