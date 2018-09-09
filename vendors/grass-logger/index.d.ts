declare module "@grass/grass-logger" {
  type LevelTag = "ALL"|"DEBUG"|"INFO"|"WARN"|"ERROR"|"NONE"
  type LogEntry = {name: string, time: Date, level: LogLevel, message: string}

  interface LogLevel {
    readonly tag: LevelTag
    readonly value: number
    valueOf (): number
    toString (): string
  }

  export default class Logger extends NodeJS.EventEmitter {
    template: string
    renderer: (entry: LogEntry) => {[prop: string]: any}

    constructor (name: string)
    on (event: "log", listener: (txt: string, lv: LogLevel) => void): this
    
    setLevel (tag: LevelTag): void
    log (msg: string, ...formatArgs: any[]): void
    debug (msg: string, ...formatArgs: any[]): void
    info (msg: string, ...formatArgs: any[]): void
    warn (msg: string, ...formatArgs: any[]): void
    error (msg: string, ...formatArgs: any[]): void

  }
}
