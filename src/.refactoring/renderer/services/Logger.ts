import IService from './IService'
import { format } from 'util'

import { command } from '../ipc'

import { LOG_ENTRY_TPL } from '../../common/config'

// pre-compile
const template = LOG_ENTRY_TPL
  .replace('{process}', 'RENDER')

class LogLevel {
  public name: string
  public value: number

  constructor (name: string, value: number) {
    this.name = name
    this.value = value
  }

  valueOf (): number {
    return this.value
  }

  toString (): string {
    return this.name
  }
}

const LEVELS = {
  VERBOSE: new LogLevel('VERBOSE', 0),
  DEBUG: new LogLevel('DEBUG', 10),
  INFO: new LogLevel('INFO', 20),
  WARN: new LogLevel('WARN', 30),
  ERROR: new LogLevel('ERROR', 40),
  SILENT: new LogLevel('SILENT', 50)
}

declare type LogLevelLabel = 'VERBOSE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SILENT'

export default class Logger implements IService {
  public readonly service: string = 'logger'

  public name: string
  public level: LogLevel = LEVELS.WARN

  constructor (name: string) {
    this.name = name
  }

  setLevel (label: LogLevelLabel) {
    if (!LEVELS[label]) {
      throw new Error(`Invalid log level: "${label}"`)
    }

    this.level = LEVELS[label]
  }

  private _log (level: LogLevel, msg: string, ...args: any[]) {
    if (level < this.level) return

    msg = template
      .replace('{time}', new Date().toISOString())
      .replace('{level}', level.toString().padEnd(5))
      .replace('{name}', this.name)
      .replace('{message}', msg)

    let out: (msg: string, ...args: any[])=>void
    switch (level) {
      case LEVELS.DEBUG:
        out = console.debug
        break
      case LEVELS.INFO:
        out = console.info
        break
      case LEVELS.WARN:
        out = console.warn
        break
      case LEVELS.ERROR:
        out = console.error
        break
      default:
        out = console.log
    }
    out(msg, ...args)
    command(this.service, format(msg, ...args))
  }

  debug (msg: string, ...args: any[]) {
    this._log(LEVELS.DEBUG, msg, ...args)
  }

  info (msg: string, ...args: any[]) {
    this._log(LEVELS.INFO, msg, ...args)
  }

  warn (msg: string, ...args: any[]) {
    this._log(LEVELS.WARN, msg, ...args)
  }

  error (msg: string, ...args: any[]) {
    this._log(LEVELS.ERROR, msg, ...args)
  }
}
