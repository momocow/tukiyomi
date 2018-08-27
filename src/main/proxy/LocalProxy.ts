import { Server } from 'net'
import proxy from 'http-proxy'
import { createServer, IncomingMessage, ServerResponse } from 'http'
// import { appConfig } from '../configuring/configs'
// import { proxyLogger } from '../logging/loggers'

const generalProxy = proxy.createServer({})

export default class LocalProxy {
  private _server: Server

  constructor () {
    this._server = createServer((req, res) => {
      this.handle(req, res)
      generalProxy.web(req, res, {
        target: req.url
      })
    })
  }

  handle (req: IncomingMessage, res: ServerResponse) {
    
  }

  listen (): this
  listen (port: number): this
  listen (port: number, backlog: number): this
  listen (onListen: Function): this
  listen (port: number, onListen: Function): this
  listen (port: number, backlog: number, onListen: Function): this
  listen (port?: number | Function, backlog?: number | Function, onListen?: Function): this {
    const _port: number = typeof port === 'number' ? port : 0
    const _backlog = typeof backlog ==='number' ? backlog : 511
    const _onListen: Function | undefined = typeof port === 'function' ? port
      : typeof backlog === 'function' ? backlog
        : onListen
    this._server.listen(_port, '127.0.0.1', _backlog, _onListen)
    return this
  }
}
