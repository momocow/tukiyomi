const Logger = require('../../')
const { INFO, ERROR } = require('../../lib/LogLevel')

const { test } = require('ava')
const format = require('string-template')
const { stub } = require('sinon')

const stubStdout = stub(process.stdout, 'write')
const stubStderr = stub(process.stderr, 'write')

const logFns = [
  'debug',
  'info',
  'warn',
  'error'
]

let num = 0

const histories = []

function record (text) {
  histories.push(text)
}

test.beforeEach(function (t) {
  stubStdout.callsFake(record)
  stubStderr.callsFake(record)
})

test.afterEach.always(function () {
  stubStdout.reset()
  stubStderr.reset()
})

test.after.always(function () {
  stubStdout.restore()
  stubStderr.restore()
  histories.forEach(text => console.log(text))
})

function macro (t, logFn, isErr) {
  t.plan(2)

  let text
  const logger = new Logger('test')
    .on('log', function (txt) {
      text = txt
    })

  logger[logFn]('Log Test #%d', num++)

  const out = isErr ? stubStderr : stubStdout
  t.true(out.calledOnce)
  t.true(out.calledWith(text + '\n'))
}

macro.title = function (title, logFn) {
  return format(title, { logFn })
}

logFns.forEach((logFn, i) => {
  test('Logger#{logFn}()', macro, logFn, i >= logFns.indexOf('warn'))
})

test('Logger#error(err): called with an Error', function (t) {
  t.plan(2)
  
  const err = new Error('Fake error')
  const logger = new Logger('test')
  const stubLog = stub(logger, '_log')
  stubLog.callThrough()
  
  logger.error(err)

  t.true(stubLog.calledOnce)
  t.true(stubLog.calledWith(ERROR, err))
})

test('Logger#info(err): called with an Object', function (t) {
  t.plan(2)
  
  const obj = {
    test: true,
    _this: 'is a fake object',
    nested: {
      properties: [
        1, 2, 3
      ]
    }
  }
  const logger = new Logger('test')
  const stubLog = stub(logger, '_log')
  stubLog.callThrough()
  
  logger.info(obj)

  t.true(stubLog.calledOnce)
  t.true(stubLog.calledWith(INFO, obj))
})
