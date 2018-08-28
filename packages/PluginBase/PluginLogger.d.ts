type LevelTag = "ALL"|"DEBUG"|"INFO"|"WARN"|"ERROR"|"NONE"
type LogEntry = {name: string, time: Date, level: LogLevel, message: string}

interface LogLevel {
  readonly tag: LevelTag
  readonly value: number
  valueOf (): number
  toString (): string
}

interface Logger extends NodeJS.EventEmitter {  
  template: string
  renderer: (entry: LogEntry) => {[prop: string]: any}

  on (event: "log", listener: (txt: string, lv: LogLevel) => void): this
  
  setLevel (tag: LevelTag): void
  log (msg: string, ...formatArgs: any[]): void
  debug (msg: string, ...formatArgs: any[]): void
  info (msg: string, ...formatArgs: any[]): void
  warn (msg: string, ...formatArgs: any[]): void
  error (msg: string, ...formatArgs: any[]): void

}

declare namespace NodeJS {
  interface Global {
    readonly toolkit: {
      getLogger (name: string): Logger
    }
  }
}
