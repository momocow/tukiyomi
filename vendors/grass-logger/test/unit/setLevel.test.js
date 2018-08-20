const Logger = require('../../')
const { ALL, ERROR } = require('../../lib/LogLevel')

const { test } = require('ava')

test('Logger#setLevel(level)', function (t) {
  t.plan(2)

  const logger = new Logger('test')
  t.is(logger._level, ALL)

  logger.setLevel('ERROR')
  t.is(logger._level, ERROR)
})

test('Logger#setLevel(level): invalid level', function (t) {
  t.plan(2)

  const logger = new Logger('test')
  t.is(logger._level, ALL)

  logger.setLevel('FAKE')
  t.is(logger._level, ALL)
})
