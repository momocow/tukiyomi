import Logger from '@grass/grass-logger'

import { IS_DEV } from '../env'
import { MAIN_LOGGER_NAME, LOG_ENTRY_TPL } from '../../common/config'

import LogPool from './LogPool'

export const appPool = new LogPool('app.log')
export const gamePool = new LogPool('game.log')

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

export const gameLogger = getGameLogger()
export const mainLogger = getLogger(MAIN_LOGGER_NAME)
