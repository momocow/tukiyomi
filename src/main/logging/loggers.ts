import Logger from '@grass/grass-logger'
import { app } from 'electron'

import { IS_DEV } from '../env'

import LogPool from './LogPool'

const appPool = new LogPool('app.log')
const gamePool = new LogPool('game.log')

app.on('will-quit', function () {
  appPool.flushSync()
  gamePool.flushSync()
})

function getGameLogger () {
  const logger = new Logger('game')
  logger.setLevel('ALL')
  logger.template = '[{time}] {message}'
  gamePool.associate(logger)
  return logger
}

export function getLogger (name: string): Logger {
  const logger = new Logger(name)
  logger.setLevel(IS_DEV ? 'ALL' : 'WARN')
  logger.template = '[{time}][{level}][{name}] {message}'
  logger.renderer = function (entry) {
    return {
      ...entry,
      level: entry.level.toString().padEnd(5)
    }
  }
  appPool.associate(logger)
  return logger
}

export const gameLogger = getGameLogger()
export const rendererLogger = getLogger('core:renderer')
export const mainLogger = getLogger('core:renderer')
