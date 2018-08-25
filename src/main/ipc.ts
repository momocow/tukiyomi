import { ipcMain, webContents } from 'electron'

import { appLogger } from './logging/loggers'

/**
 * A service should come with a response
 * Default to async service if response modifier (":sync", ":async") is omitted
 */
export function registerService (svc: string, listener: Function): void {
  const asyncService = async (evt: any, { meta, args }: TukiyomiService.AsyncServiceRequestPacket) => {
    appLogger.debug('Service "%s" [async]: Args = %O, Meta = ', svc, args, meta)
    const data = await listener(...args)
    evt.sender.send(`svc:response`, { meta, data })
    appLogger.debug('Service "%s" [async]: Return = %O', svc, data)
  }

  ipcMain
    .on(`svc:${svc}:sync`, async (evt: any, { args }: TukiyomiService.ServiceRequestPacket) => {
      appLogger.debug('Service "%s" [sync]: Args = %O', svc, args)
      const data = await listener(...args)
      evt.returnValue = { data }
      appLogger.debug('Service "%s" [sync]: Return = %O', svc, data)
    })
    .on(`svc:${svc}:async`, asyncService)
    .on(`svc:${svc}`, asyncService)
}

/**
 * A command won't have any responses
 */
export function registerCommand (eventname: string, listener: Function): void {
  ipcMain.on(`cmd:${eventname}`, (evt: any, ...args: any[]) => {
    listener(...args)
  })
}

export function publish (topic: string, ...args: any[]) {
  webContents.getAllWebContents().forEach((wc: Electron.webContents) => {
    wc.send(`evt:${topic}`, ...args)
  })
}
