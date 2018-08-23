import { ipcMain, webContents } from 'electron'

/**
 * A service should come with a response
 * Default to async service if response modifier (":sync", ":async") is omitted
 */
export function registerService (svc: string, listener: Function): void {
  ipcMain
    .on(`svc:${svc}:sync`, (evt: any, { args }: TukiyomiService.ServiceRequestPacket) => {
      evt.returnValue = { data: listener(...args) }
    })
    .on(`svc:${svc}:async`, (evt: any, { meta, args }: TukiyomiService.AsyncServiceRequestPacket) => {
      evt.sender.send(`svc:response`, { meta, data: listener(...args) })
    })
    .on(`svc:${svc}`, (evt: any, { meta, args }: TukiyomiService.AsyncServiceRequestPacket) => {
      evt.sender.send(`svc:response`, { meta, data: listener(...args) })
    })
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
