import Logger from '@grass/grass-logger'

export const rendererLogger = new Logger('core:renderer')
export const mainLogger = new Logger('core:renderer')

mainLogger.template = rendererLogger.template = '[{time}][{level}][{name}] {message}'
mainLogger.renderer = rendererLogger.renderer = function (entry) {
  return {
    ...entry,
    level: ' ' + entry.level.toString().padEnd(5)
  }
}