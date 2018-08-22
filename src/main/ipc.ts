import { ipcMain } from 'electron'

/**
 * A service should come with a response
 */
export function registerService (eventname: string, listener: Function): void {
  ipcMain
    .on(eventname + ':sync', (evt: any, ...args: any[]) => {
      evt.returnValue = listener(...args)
    })
    .on(eventname + ':async', (evt: any, ...args: any[]) => {
      evt.sender.send(eventname + ':response', listener(...args))
    })
}

/**
 * A command won't have any responses
 */
export function registerCommand (eventname: string, listener: Function): void {
  ipcMain.on(eventname, (...args: any[]) => {
    listener(...args)
  })
}

