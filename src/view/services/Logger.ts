import IService from './IService'
import { format } from 'util'

import _padEnd from 'lodash/padend'

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

export default class Logger implements IService {
  public readonly service: string = 'logger'

  public name: string
  public level: LogLevel = LEVELS.ERROR
  private _ipc: Electron.IpcRenderer

  constructor (name: string) {
    this.name = name
  }

  init (ipc: Electron.IpcRenderer) {
    this._ipc = ipc
  }

  _log (level: LogLevel, msg: string, ...args) {
    if (level < this.level) return

    msg = `[${new Date()}][${_padEnd(level.toString(), 7)}][${this.name}] ${msg}`

    let out: (msg: string, ...args)=>void
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
    this._ipc.send(this.service, format(msg, ...args))
  }

  verbose (msg: string, ...args) {
    this._log(LEVELS.VERBOSE, msg, ...args)
  }

  debug (msg: string, ...args) {
    this._log(LEVELS.DEBUG, msg, ...args)
  }

  info (msg: string, ...args) {
    this._log(LEVELS.INFO, msg, ...args)
  }

  warn (msg: string, ...args) {
    this._log(LEVELS.WARN, msg, ...args)
  }

  error (msg: string, ...args) {
    this._log(LEVELS.ERROR, msg, ...args)
  }
}
