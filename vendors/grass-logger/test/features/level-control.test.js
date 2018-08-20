const Logger = require('../../')

const { test } = require('ava')
const { stub } = require('sinon')

test('NONE level should be silent', function (t) {
  t.plan(1)

  const logger = new Logger('test')
  const stubLog = stub(logger, '_log')
  logger.setLevel('NONE')

  logger.debug('test')
  logger.info('test')
  logger.warn('test')
  logger.error('test')

  t.true(stubLog.notCalled)

  stubLog.restore()
})
