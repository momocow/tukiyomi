interface GuestRunOptions {
  timeout?: number,
  useGesture?: boolean
}

interface GuestContent {
  run (fn: Function): Promise<any>
  run (fn: Function, args: any[]): Promise<any>
  run (fn: Function, options: GuestRunOptions): Promise<any>
  run (fn: Function, args: any[], options: GuestRunOptions): Promise<any>
  decorate (cssStr: string): void
  decorate (cssSelector: string, cssObj: object): void
}

interface IPCUtils {
  registerService (svc: string, listener: Function): void
  registerCommand (eventname: string, listener: Function): void
  publish (topic: string, ...args: any[]): void
}

interface Env {
  DATA_DIR: string
}

declare namespace NodeJS {
  interface Global {
    config: EventEmitter & {
      get<T> (key: string, defaultVal?: T): T
      set (key: string, value: any): void
    }
  
    i18n: EventEmitter & {
      get<T> (key: string, defaultVal?: T): T
    }
  
    env: Env
  
    ipc: IPCUtils
  
    guest: GuestContent
  }
}
