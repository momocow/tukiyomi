import { app } from 'electron'
import { join, resolve, parse } from 'path'
import { EventEmitter } from 'events'
import { findAndReadConfig } from 'read-config-file'

export class Config<T> extends EventEmitter {
  private _data: T

  /**
   * @param {string} filename Resolve under `${userData}/Configs`
   */
  constructor (public filename: string) {
    super()

    const configRoot = join(app.getPath('userData'), 'Configs')
    const { dir, name } = parse(resolve(configRoot, filename))
    findAndReadConfig<T>({
      configFilename: name,
      projectDir: dir,
      packageKey: '',
      packageMetadata: null
    }).then((confObj) => {
      if (confObj) {
        this._data = confObj.result
        this.emit('load')
      } else {
        this.emit('error')
      }
    })
  }
}
