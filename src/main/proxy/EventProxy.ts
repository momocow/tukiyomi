import { parse as parseURL } from 'url'
import {
  NetworkEvent,
  KCSAPIEvent,
  NetworkRequestEvent,
  NetworkResponseEvent,
  PortEvent,
  MapStartEvent
} from '@tukiyomi/events'

import { IncomingHttpHeaders } from 'http'
import pluginLoader from '../plugin/loader'

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

  emitNetwork () {
    if (this._request && this._response) {
      if (this._isKCSAPI) {
        const { pathname } = parseURL(this._request.url)
        if (pathname) {
          // TODO dont use startsWith, DANGEROUS! ex. "/kcsapi/api_req_map/start" and "/api_req_map/start_air_base"
          if (pathname === '/kcsapi/api_req_map/start') {
            pluginLoader.broadcast('kcsapi.map.start', new MapStartEvent(this._request, this._response))
          } else if (pathname === '/kcsapi/api_port/port') {
            pluginLoader.broadcast('kcsapi.port', new PortEvent(this._request, this._response))
          }
        }
        pluginLoader.broadcast('kcsapi', new KCSAPIEvent(this._request, this._response))
      }
      pluginLoader.broadcast('network', new NetworkEvent(this._request, this._response))
    }
  }

  emitEvent (name: string) {
    pluginLoader.broadcast(name)
  }
}

function isKanColleGameAPI (pathname?: string) {
  return typeof pathname === 'string' ? pathname.startsWith('/kcsapi') : false
}