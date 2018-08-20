const { EventEmitter } = require('events')
const { format } = require('util')
const formatByTpl = require('string-template')

const LogLevel = require('./LogLevel')
const { stringify } = require('./utils')
const { Stdout, Stderr } = require('./output')

class Logger extends EventEmitter {
  constructor(name, { template = '[{time}][{name}][{level}] {message}' } = {}) {
    super()

    this.name = name
    this.renderer = e => e
    this.template = template

    this._level = LogLevel.ALL

    this.out = new Stdout()
    this.err = new Stderr()
  }

  /**
   * @param {"ALL"|"INFO"|"DEBUG"|"WARN"|"ERROR"|"NONE"} level
   */
  setLevel (level) {
    this._level = LogLevel[level] || this._level
  }

  debug (msg, ...args) {
    if (LogLevel.DEBUG >= this._level) {
      this.emit('log', this._log(LogLevel.DEBUG, msg, ...args), LogLevel.DEBUG)
    }
  }

  info (msg, ...args) {
    if (LogLevel.INFO >= this._level) {
      this.emit('log', this._log(LogLevel.INFO, msg, ...args), LogLevel.INFO)
    }
  }

  warn (msg, ...args) {
    if (LogLevel.WARN >= this._level) {
      this.emit('log', this._log(LogLevel.WARN, msg, ...args), LogLevel.WARN)
    }
  }

  error (msg, ...args) {
    if (LogLevel.ERROR >= this._level) {
      this.emit('log', this._log(LogLevel.ERROR, msg, ...args), LogLevel.ERROR)
    }
  }

  _log (level, msg, ...args) {
    const msgObj = {
      message: formatByTpl(this.template, this.renderer({
        name: this.name,
        time: new Date(),
        level,
        message: format(stringify(msg), ...args)
      }))
    }

    this.emit('before-log', msgObj)

    const out = level >= LogLevel.WARN ? this.err : this.out
    out.println(msgObj.message)
    return msgObj.message
  }
}

module.exports = Logger
