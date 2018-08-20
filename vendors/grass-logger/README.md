# Grass Logger
A simple logger with customizable message template and style.

[![Build Status](https://travis-ci.org/NodeGrass/grass-logger.svg?branch=master)](https://travis-ci.org/NodeGrass/grass-logger) [![Coverage Status](https://coveralls.io/repos/github/NodeGrass/grass-logger/badge.svg?branch=master)](https://coveralls.io/github/NodeGrass/grass-logger?branch=master)

## Example
```js
const Logger = require('@grass/grass-logger')
const logger = new Logger('logger-name')

logger.on('log', function backup (text, lvl) {
  // here is where back-up can be performed
  fs.writeFileSync('/backup/latest.log', text)

  // or you can simply redirect the stdout and the stderr to a backup file!
})

logger.template = '{time}/{name}/{level}> {message} {custom}'

/**
 * @param {Date} time
 * @param {LogLevel} level
 * @param {string} message
 * @param {string} name
 */
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
```