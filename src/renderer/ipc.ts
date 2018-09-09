import { ipcRenderer } from 'electron'
import uuidv4 from 'uuid/v4'

import ServiceTimeoutError from './errors/ServiceTimeoutError'

interface ServiceOptions {
  timeout?: number
}

const responseHandlerMap: Map<string, ((data: any) => void)> = new Map()

// global response handler
ipcRenderer.on('svc:response', function (evt: Electron.Event, { meta, data }: TukiyomiService.AsyncServiceResponsePacket) {
  const handler: ((data: any) => void) | undefined = responseHandlerMap.get(meta.guid)
  if (typeof handler === 'function') {
    handler(data)
    responseHandlerMap.delete(meta.guid)
  }
})

/**
 * Async service call
 */
export function service<T> (svc: string, args?: any[], { timeout }: ServiceOptions = { timeout: Infinity }): Promise<T> {
  return new Promise(function (resolve, reject) {
    const guid = uuidv4()
    let timer: NodeJS.Timer | undefined
    responseHandlerMap.set(guid, function (data) {
      if (timer) {
        clearTimeout(timer)
      }
      resolve(data)
    })

    if (typeof timeout === 'number' && timeout < Infinity) {
      timer = setTimeout(function () {
        reject(new ServiceTimeoutError(svc, timeout))
      }, timeout)
    }
  
    ipcRenderer.send(`svc:${svc}:async`, <TukiyomiService.AsyncServiceRequestPacket>{
      meta: { guid },
      args
    })
  })
}

export function serviceSync<T> (svc: string, ...args: any[]) {
  const { data }: TukiyomiService.ServiceResponsePacket = ipcRenderer.sendSync(
    `svc:${svc}:sync`,
    <TukiyomiService.ServiceRequestPacket>{ args }
  )
  return <T>data
}

export function command (command: string, ...args: any[]) {
  ipcRenderer.send(`cmd:${command}`, ...args)
}

export function subscribe (topic: string, listener: Function) {
  ipcRenderer.on(`evt:${topic}`, listener)
}

export function unsubscribe (topic: string, listener?: Function) {
  if (listener) {
    ipcRenderer.removeListener(`evt:${topic}`, listener)
  } else {
    ipcRenderer.removeAllListeners(`evt:${topic}`)
  }
}
