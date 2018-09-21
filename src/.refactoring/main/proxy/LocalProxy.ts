import {
  Server,
  createServer,
  IncomingMessage
} from 'http'
import net, { Socket, AddressInfo } from 'net'
import url from 'url'
import request, { Response } from 'request'
import { gunzip, inflate } from 'zlib'

import { proxyLogger } from '../logging/loggers'

import { EventProxy } from './EventProxy'
import { appConfig } from '../configuring/configs'

const caseNormalizer = require('header-case-normalizer')

export class LocalProxy {
  private _server: Server = createServer(async (req, res) => {
    delete req.headers['proxy-connection']
    req.headers['connection'] = 'close'

    const { method, url, headers } = req
    
    if (method && url && headers) {
      const evtProxy = new EventProxy()
      const bodyBuf = await parseBody(req)
      const body = bodyBuf.toString()

      evtProxy.emitRequest(method, url, headers, body)

      const reqOptions: any = {
        method, url, headers,
        encoding: null, // response body is a buffer
        followRedirect: false
      }

      if (bodyBuf.length > 0) {
        reqOptions.body = bodyBuf
      }

      switch (appConfig.get<string>('proxy.use', '')) {
        case 'http': {
          const host = appConfig.get('proxy.host', '127.0.0.1')
          const port = appConfig.get('proxy.port', NaN)
          const usr = appConfig.get('proxy.username', '')
          const pwd = appConfig.get('proxy.passwd', '')
          const portStr = port ? `:${port}` : ''
          const authStr = usr && pwd ? `${usr}:${pwd}@` : ''
          reqOptions.proxy = `http://${authStr}${host}${portStr}`
          break
        }
        default:
      }

      const remoteReq = request(reqOptions, (err: Error, response: Response, resBody: Buffer) => {
        if (err) {
          proxyLogger.error('Error occured when sending request %O', reqOptions)
          proxyLogger.error('%O', err)
          return
        }

        const onComplete = (decodedBody: string) => {
          evtProxy.emitResponse(response.statusCode, response.headers, decodedBody)
          evtProxy.emitNetwork()
        }

        switch (response.headers["content-encoding"]) {
          case 'gzip':
            gunzip(resBody, function (gunzipError, decoded) {
              if (gunzipError) {
                proxyLogger.error('Failed to gunzip the response. (%s "%s")', method, url)
                proxyLogger.error('%O', gunzipError)
                return
              }
              onComplete(decoded.toString())
            })
            break
          case 'deflate':
            inflate(resBody, function (inflateError, decoded) {
              if (inflateError) {
                proxyLogger.error('Failed to inflate the response. (%s "%s")', method, url)
                proxyLogger.error('%O', inflateError)
                return
              }
              onComplete(decoded.toString())
            })
            break;
          default:
            onComplete(resBody.toString())
        }
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
      let remoteSock: Socket
      switch (appConfig.get<string>('proxy.use', '')) {
        case 'http': {
          const host = appConfig.get('proxy.host', '')
          const port = appConfig.get('proxy.port', NaN)
          let msg = `CONNECT ${remoteUrl.hostname}:${remoteUrl.port} HTTP/${req.httpVersion}\r\n`
          for (const k in req.headers) {
            msg += `${caseNormalizer(k)}: ${req.headers[k]}\r\n`
          }
          msg += "\r\n"
          remoteSock = net.connect(port, host, () => {
            remoteSock.write(msg)
            remoteSock.write(head)
            clientSock.pipe(remoteSock)
            remoteSock.pipe(clientSock)
          })
          break
        }

        default: {
          remoteSock = net.connect(parseInt(remoteUrl.port || '443'), remoteUrl.hostname, () => {
            clientSock.write("HTTP/1.1 200 Connection Established\r\nConnection: close\r\n\r\n")
            remoteSock.write(head)
            clientSock.pipe(remoteSock)
            remoteSock.pipe(clientSock)
          })
        }
      }

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
