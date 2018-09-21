import sio from 'socket.io'
import { createServer, Server as HttpServer } from 'http'
import { parse as parseUrl } from 'url'
import { join as joinPath } from 'path'
import { readFile, lstatSync } from 'fs-extra'

import { streamLogger } from '../logging/loggers'

import { MODULE_DIR } from '../env'
import { AddressInfo } from 'net'

const SOCKET_IO_JS = joinPath(MODULE_DIR, 'socket.io-client', 'dist', 'socket.io.js')
const SOCKET_IO_JS_LEN = lstatSync(SOCKET_IO_JS).size

class StreamServer {
  private _http: HttpServer = createServer((req, res) => {
    // res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.url) {
      const { pathname } = parseUrl(req.url)
      switch (pathname) {
        case '/socket.io.js':
          res.writeHead(200, {
            'Content-Type': 'application/javascript',
            'Content-Length': SOCKET_IO_JS_LEN
          })
          readFile(SOCKET_IO_JS, 'utf8').then(function (content) {
            res.end(content)
          })
          break
        default:
          res.writeHead(404)
          res.end()
      }
    }
  })
  private _io = sio(this._http)

  constructor() {
    this._io.of('live').on('connection', (sock) => {
    })

    this._io.of('source').on('connection', (sock) => {
      // service proxy
      sock.on('blob', (data: ArrayBuffer, meta: { id: number }) => {
        this._io.of('live').emit('blob', data, meta)
      })
    })
  }

  port () {
    return (<AddressInfo>this._http.address()).port
  }

  isListening () {
    return this._http.listening
  }

  onListen (fn: (...args: any[]) => void) {
    this._http.once('listening', fn)
  }

  /**
   * Currently does not allow external access
   */
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
    this._http.listen(_port, '127.0.0.1', _backlog, () => {
      streamLogger.info('Stream server is listening on port %d.', this.port())
      if (typeof _onListen === 'function') _onListen()
    })
    return this
  }

  close (cb?: Function) {
    const promises = []
    promises.push(new Promise((resolve) => {
      this._http.close(() => {
        resolve()
      })
    }))

    promises.push(new Promise((resolve) => {
      this._io.close(() => {
        resolve()
      })
    }))

    Promise.all(promises).then(() => {
      if (typeof cb === 'function') cb()
    })
  }
}

export default new StreamServer()
