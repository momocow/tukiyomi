import IService from './IService'

import { EventEmitter } from 'events'

export default class I18n extends EventEmitter implements IService {
  public readonly service: string = 'i18n'

  private _dict: Map<string, string> = new Map()
  private _ipc: Electron.IpcRenderer

  constructor (public lang: string) {
    super()
  }

  init (ipc: Electron.IpcRenderer) {
    this._ipc = ipc
    this._ipc.on(this.service, (lang: string, entries: [string, string][]) => {
      // reset
      this._dict.clear()

      this.lang = lang
      this._dict = new Map(entries)

      this.emit('load')
    })

    this.setLang(this.lang)
  }

  get (key: string): string {
    return this._dict.get(key)
  }

  setLang (lang: string) {
    this._ipc.send(this.service, lang)
  }
}
