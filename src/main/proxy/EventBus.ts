import { parse as parseURL } from 'url'

import pluginLoader from '../plugin/loader'

interface RequestId {
  seed: number,
  url: string,
  method: string
}

interface Request {
  body: string
}

class EventBus {
  private _requestMap: WeakMap<RequestId, Request> = new WeakMap()

  handleRequest (rid: RequestId, body: string = '') {
    const { url, method } = rid
    const { pathname } = parseURL(url)
    this._requestMap.set(rid, { body })
    isKanColleGameAPI(pathname)
    pluginLoader.broadcast('network.raw.req', { method, url, body }, new Date())
  }

  handleResponse (rid: RequestId, body?: string) {
    const { url, method } = rid
    const { pathname } = parseURL(url)
    isKanColleGameAPI(pathname)

    const resObj = { method, url, body }
    pluginLoader.broadcast('network.raw.res', resObj, new Date())

    const { body: reqBody } = this._requestMap.get(rid) || { body: '' }
    pluginLoader.broadcast('network.raw', { method, url, body: reqBody }, resObj, new Date())
  }

  createRequestId (method: string, url: string): RequestId {
    return {
      seed: Math.random(),
      method, url
    }
  }
}

export default new EventBus()

function isKanColleGameAPI (pathname?: string) {
  return typeof pathname === 'string' ? pathname.startsWith('/kcsapi') : false
}