import { NetworkEvent } from '../NetworkEvent'
import { parse as parseURL } from 'url'

export class KCSAPIEvent extends NetworkEvent {
  private _lazyJson: any

  get api () {
    const urlObj = parseURL(this.request.url)
    return urlObj.pathname ? urlObj.pathname.substr(7) : ''
  }

  get responseJSON () {
    if (this._lazyJson === undefined) {
      const body = this.response.body.startsWith('svdata=')
        ? this.response.body.substr(7) : this.response.body
      try {
        this._lazyJson = JSON.parse(body)
      } catch (e) {
        this._lazyJson = {}
      }
    }
    return this._lazyJson
  }

  get resultCode () {
    return this.responseJSON.api_result
  }

  get resultMsg () {
    return this.responseJSON.api_result_msg
  }

  toString () {
    return this.api
  }
}
