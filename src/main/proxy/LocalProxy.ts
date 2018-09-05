import {
  Server,
  createServer,
  IncomingMessage,
  IncomingHttpHeaders
} from 'http'
import net, { Socket, AddressInfo } from 'net'
import url from 'url'
import request, { Response } from 'request'
import { proxyLogger } from '../logging/loggers'

import bus from './EventBus'

export class LocalProxy {
  private _server: Server = createServer(async (req, res) => {
    delete req.headers['proxy-connection']
    req.headers['connection'] = 'close'

    const { method, url, headers } = req
    const bodyBuf = await parseBody(req)

    
    if (method && url && headers) {
      const rid = bus.createRequestId(method, url)
      bus.handleRequest(rid, bodyBuf.length > 0 ? bodyBuf.toString() : '')

      const reqOptions: any = {
        method, url, headers,
        encoding: null,
        followRedirect: false
      }

      if (bodyBuf.length > 0) {
        reqOptions.body = bodyBuf
      }

      const remoteReq = request(reqOptions, (err: Error, response: Response, resBody: any) => {
        if (err) {
          proxyLogger.error('Error occured when sending request %O', reqOptions)
          proxyLogger.error('%O', err)
          return
        }

        if (response.statusCode !== 200) {
          proxyLogger.warn('Status code is not 200. (%s "%s")', response.method, response.url)
          return
        }

        bus.handleResponse(rid, `${resBody}`)
      })

      remoteReq.pipe(res)
    }
  })

  constructor () {
    this._server.on('error', (err) => {
      proxyLogger.error('HTTP server error.')
      proxyLogger.error('%O', err)
    })

    this._server.on('connect', (req: IncomingMessage, clientSock: Socket, head: Buffer) => {
      delete req.headers['proxy-connection']
      req.headers['connection'] = 'close'
      const remoteUrl = url.parse(`https://${req.url}`)
      let remoteSock = net.connect(parseInt(remoteUrl.port || '443'), remoteUrl.hostname, () => {
        clientSock.write("HTTP/1.1 200 Connection Established\r\nConnection: close\r\n\r\n")
        remoteSock.write(head)
        clientSock.pipe(remoteSock)
        remoteSock.pipe(clientSock)
      })

      clientSock.on('end', () => {
        remoteSock.end()
      })
      remoteSock.on('end', () => {
        clientSock.end()
      })
      clientSock.on('error', (e) => {
        proxyLogger.error('Client socket error.')
        proxyLogger.error('%O', e)
        remoteSock.destroy()
      })
      remoteSock.on('error', (e) => {
        proxyLogger.error('Remote socket error.')
        proxyLogger.error('%O', e)
        clientSock.destroy()
      })
      clientSock.on('timeout', () => {
        clientSock.destroy()
        remoteSock.destroy()
      })
      remoteSock.on('timeout', () => {
        clientSock.destroy()
        remoteSock.destroy()
      })
    })
  }

  port () {
    return (<AddressInfo>this._server.address()).port
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
    this._server.listen(_port, '127.0.0.1', _backlog, () => {
      proxyLogger.info('Proxy server is listening on port %d.', this.port())
      if (typeof _onListen === 'function') _onListen()
    })
    return this
  }

  // private async _handleRequest (req: IncomingMessage) {
  //   const body = await parseBody(req)
  //   const bodyStr = body.toString()
  //   this.emit('request.raw', <MessageMeta>{
  //     url: req.url,
  //     headers: req.headers
  //   }, bodyStr)
  // }

  // private async _handleResponse (proxyRes: IncomingMessage) {
  //   const body = await parseBody(proxyRes)
  //   const bodyStr = body.toString()
  //   this.emit('request.raw', <MessageMeta>{
  //     url: proxyRes.url,
  //     headers: proxyRes.headers
  //   }, bodyStr)
  // }
}

export interface MessageMeta {
  url: string,
  headers: IncomingHttpHeaders
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
