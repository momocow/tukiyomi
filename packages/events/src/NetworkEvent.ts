import { Event } from './Event'

import { parse as parseURL } from 'url'
import { parse as parseQuery } from 'querystring'
import { IncomingHttpHeaders } from 'http'

export class NetworkEvent extends Event {
  constructor (
    public readonly request: NetworkRequestEvent,
    public readonly response: NetworkResponseEvent
  ) {
    super()
  }

  get method () {
    return this.request.method
  }

  get url () {
    return this.request.url
  }

  get query () {
    return parseURL(this.request.url, true).query
  }

  get params () {
    return parseQuery(this.request.body)
  }

  get responseText () {
    return this.response.body
  }
}

export class NetworkResponseEvent extends Event {
  public readonly headers: IncomingHttpHeaders
  constructor (
    public readonly status: number,
    headers: IncomingHttpHeaders,
    public readonly body: string
  ) {
    super()
    this.headers = Object.freeze(headers)
  }
}

export class NetworkRequestEvent extends Event {
  public readonly headers: IncomingHttpHeaders
  constructor (
    public readonly method: string,
    public readonly url: string,
    headers: IncomingHttpHeaders,
    public readonly body: string
  ) {
    super()
    this.headers = Object.freeze(headers)
  }
}
