import { NetworkEvent } from '../NetworkEvent'
import { parse as parseURL } from 'url'

export class KCSAPIEvent extends NetworkEvent {
  get api () {
    const urlObj = parseURL(this.request.url)
    return urlObj.pathname ? urlObj.pathname.substr(7) : ''
  }

  get responseJSON () {
    const body = this.response.body.startsWith('svdata=')
      ? this.response.body.substr(7) : this.response.body
    return JSON.parse(body)
  }
}
