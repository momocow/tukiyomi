import { appendFile, appendFileSync } from 'fs-extra'
import { app } from 'electron'
import { join } from 'path'
import RollingArray from '@grass/grass-rolling-array'
import Logger from '@grass/grass-logger'

import { MAX_LOGGING_BUF_LEN } from '../../common/config'

export default class LogPool {
  private _pool: RollingArray<string> = new RollingArray<string>(MAX_LOGGING_BUF_LEN, MAX_LOGGING_BUF_LEN)
  private _onLog: (txt: string) => void = (txt) => {
    this._pool.push(txt)
  }

  constructor (public logfile: string) {
    this._pool.on('overflow', (victims) => {
      appendFile(
        join(app.getPath('logs'), this.logfile),
        victims.join('\n')
      )
    })
  }

  async flush () {
    if (this._pool.length > 0) {
      await appendFile(
        join(app.getPath('logs'), this.logfile),
        this._pool.splice(0, this._pool.length).join('\n')
      )
    }
  }

  flushSync () {
    if (this._pool.length > 0) {
      appendFileSync(
        join(app.getPath('logs'), this.logfile),
        this._pool.splice(0, this._pool.length).join('\n')
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
}
