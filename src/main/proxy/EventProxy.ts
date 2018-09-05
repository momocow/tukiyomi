import { parse as parseURL } from 'url'
import {
  NetworkEvent,
  KCSAPIEvent,
  NetworkRequestEvent,
  NetworkResponseEvent
} from '@tukiyomi/events'

import pluginLoader from '../plugin/loader'
import { IncomingHttpHeaders } from 'http'

export class EventProxy {
  private _isKCSAPI: boolean = false
  private _request: NetworkRequestEvent | undefined
  private _response: NetworkResponseEvent | undefined

  emitRequest (method: string, url: string, headers: IncomingHttpHeaders, body: string = '') {
    this._isKCSAPI = isKanColleGameAPI(parseURL(url).pathname)
    this._request = new NetworkRequestEvent(method, url, headers, body)
    pluginLoader.broadcast('network.req', this._request)
  }

  emitResponse (status: number, headers: IncomingHttpHeaders, body: string = '') {
    this._response = new NetworkResponseEvent(status, headers, body)
    pluginLoader.broadcast('network.res', this._response)
  }

  emit () {
    if (this._request && this._response) {
      if (this._isKCSAPI) {
        pluginLoader.broadcast('kcsapi', new KCSAPIEvent(this._request, this._response))
      }
      pluginLoader.broadcast('network', new NetworkEvent(this._request, this._response))
    }
  }
}

function isKanColleGameAPI (pathname?: string) {
  return typeof pathname === 'string' ? pathname.startsWith('/kcsapi') : false
}