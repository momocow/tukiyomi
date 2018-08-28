function normalizePluginName (name: string): string {
  if (name.startsWith('@tukiyomi/')) {
    return name.substr(10)
  } else if (name.startsWith('tukiyomi-plugin-')) {
    return name.substr(16)
  }
  return name
}

export default class PluginBase {
  public readonly name: string
  private readonly logger: Logger

  constructor (name: string) {
    this.name = normalizePluginName(name)
    this.logger = new Logger(this.name)
  }
}

/**********************/
/* Logger definitions */
/**********************/

import { EventEmitter } from 'events'

type LevelTag = "ALL"|"DEBUG"|"INFO"|"WARN"|"ERROR"|"NONE"
type LogEntry = {name: string, time: Date, level: LogLevel, message: string}

interface LogLevel {
  readonly tag: LevelTag
  readonly value: number
  valueOf (): number
  toString (): string
}

interface Logger extends EventEmitter {  
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

declare const Logger: new (name: string) => Logger
