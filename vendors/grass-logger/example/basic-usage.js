const Logger = require('..')
const logger = new Logger('logger-name')

logger.template = '{time}/{name}/{level}> {message} {custom}'
logger.renderer = function ({ time, level, message, name }) {
  return {
    time: time.toLocaleString('zh-hant-tw', { timeZone: 'asia/Taipei' }),
    level: level.tag.toUpperCase(),
    message,
    name,
    custom: ':)'
  }
}

let num = 0
logger.setLevel('WARN')
logger.debug('Message #%d', num++)
logger.info('Message #%d', num++)
logger.warn('Message #%d', num++) 
logger.error('Message #%d', num++)

/**
 * Console (stderr)
 * "2018-7-31 15:12:39/logger-name/WARN> Message #2 :)"
 * "2018-7-31 15:12:39/logger-name/ERROR> Message #3 :)"
 */
