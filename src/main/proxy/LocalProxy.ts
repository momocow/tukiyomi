import { Server } from 'net'
import proxy from 'http-proxy'
import { EventEmitter } from 'events'
import { createServer, IncomingMessage } from 'http'
// import { appConfig } from '../configuring/configs'
// import { proxyLogger } from '../logging/loggers'

enum Router {
  PROXY
}

class LocalProxy extends EventEmitter {
  private _server: Server

  constructor () {
    super()

    this._server = createServer((req, res) => {
      switch (this.route(req)) {
        case Router.PROXY:
          generalProxy.web(req, res, {
            target: req.url
          })
          break;
        default:
      }
    })
  }

  route (req: IncomingMessage): Router {
    return Router.PROXY
  }

  async handleRequest (req: IncomingMessage) {
    const body = await parseBody(req)
    const bodyStr = body.toString()
    this.emit('request.raw', bodyStr)
  }

  async handleResponse (proxyRes: IncomingMessage) {
    const body = await parseBody(proxyRes)
    const bodyStr = body.toString()
    this.emit('response.raw', bodyStr)
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

function parseBody (readable: IncomingMessage): Promise<Buffer> {
  return new Promise(function (resolve, reject) {
    let body = Buffer.alloc(0)
    readable
      .on('data', (chunk) => {
        body = Buffer.concat([ body, chunk ])
      })
      .on('error', (err) => {
        reject(err)
      })
      .on('end', () => {
        resolve(body)
      })
  })
}

const localProxy = new LocalProxy()
const generalProxy = proxy.createServer({})
generalProxy.on('proxyReq', function (clientReq, req) {
  clientReq.setHeader('Connection', 'close')
  localProxy.handleRequest(req)
})

generalProxy.on('proxyRes', function (proxyRes, req, res) {
  res.setHeader('Connection', 'close')
  localProxy.handleResponse(proxyRes)
})

export default localProxy
