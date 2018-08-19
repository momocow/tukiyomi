import IService from './IService'

import { EventEmitter } from 'events'

export default class I18n extends EventEmitter implements IService {
  public readonly service: string = 'i18n'

  private _dict: Map<string, string> = new Map()
  private _ipc: Electron.IpcRenderer

  init (ipc: Electron.IpcRenderer) {
    this._ipc = ipc
    ipc.on(this.service, (entries: [string, string][]) => {
      this._dict.clear()
      this._dict = new Map(entries)
      this.emit('load')
    })
  }

  get (key: string): string {
    return this._dict.get(key)
  }

  setLang (lang: string) {
    this._ipc.send(this.service, lang)
  }
}
