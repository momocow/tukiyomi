// import { exec } from 'child_process'
import { EventEmitter } from 'events'

export default class PluginLoader extends EventEmitter {
  constructor(public path: string) {
    super()
  }
}
