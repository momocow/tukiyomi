import IService from './IService'

import { EventEmitter } from 'events'
import { ipcRenderer } from 'electron'

export default class I18n extends EventEmitter implements IService {
  public readonly service: string = 'i18n'

  private _dict: Map<string, string> = new Map()

  constructor (public lang: string) {
    super()

    ipcRenderer.on(this.service, (lang: string, entries: [string, string][]) => {
      // reset
      this._dict.clear()

      this.lang = lang
      this._dict = new Map(entries)

      this.emit('load')
    })

    this.setLang(this.lang)
  }

  get (key: string): string | undefined {
    return this._dict.get(key)
  }

  setLang (lang: string) {
    ipcRenderer.send(this.service, lang)
  }
}
