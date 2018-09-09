import { appendFile, appendFileSync, ensureFile, ensureFileSync } from 'fs-extra'
import { resolve } from 'path'
import RollingArray from '@grass/grass-rolling-array'
import Logger from '@grass/grass-logger'

import { logRotate, logRotateSync } from './log-rotate'
import { LOGS_DIR } from '../env'

import { MAX_LOGGING_BUF_LEN, MAX_LOGFILE_SIZE } from '../../common/config'

class Timestamp {
  public time: Date

  constructor (public label: string) {
    this.time = new Date()
  }

  toString () {
    return `@${this.label} ${this.time.toISOString()}`
  }
}

export default class LogPool {
  private _pool: RollingArray<string|Timestamp> = new RollingArray<string|Timestamp>(MAX_LOGGING_BUF_LEN, MAX_LOGGING_BUF_LEN)
  private _onLog: (txt: string) => void = (txt) => {
    this._pool.push(txt)
  }

  constructor (public logfile: string) {
    this._pool.on('overflow', async (victims: (string|Timestamp)[]) => {
      const absPath = resolve(LOGS_DIR, this.logfile)
      await ensureFile(absPath)
      await logRotate(absPath)
      return appendFile(
        absPath,
        victims
          .map(e => e.toString())
          .join('\n') + '\n'
      )
    })
  }

  async flush () {
    if (this._pool.length > 0) {
      const absPath = resolve(LOGS_DIR, this.logfile)
      await ensureFile(absPath)
      await logRotate(absPath, MAX_LOGFILE_SIZE)
      await appendFile(
        absPath,
        this._pool
          .splice(0, this._pool.length)
          .map(e => e.toString())
          .join('\n') + '\n'
      )
    }
  }

  flushSync () {
    if (this._pool.length > 0) {
      const absPath = resolve(LOGS_DIR, this.logfile)
      ensureFileSync(absPath)
      logRotateSync(absPath, MAX_LOGFILE_SIZE)
      appendFileSync(
        absPath,
        this._pool
          .splice(0, this._pool.length)
          .map(e => e.toString())
          .join('\n') + '\n'
      )
    }
  }

  associate (logger: Logger) {
    this.disassociate(logger)
    logger.on('log', this._onLog)
  }

  disassociate (logger: Logger) {
    logger.removeListener('log', this._onLog)
  }

  push (txt: string) {
    this._pool.push(txt)
  }

  timestamp (label: string = '') {
    this._pool.push(new Timestamp(label))
  }
}
