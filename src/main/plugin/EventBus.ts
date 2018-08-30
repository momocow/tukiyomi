import { EventEmitter } from 'events'

interface EventBus {
  on (event: "login", listener: () => void): this
  on (event: "start", listener: () => void): this
  on (event: "dock", listener: () => void): this
  on (event: "battle.end", listener: () => void): this
  on (event: "battle.start", listener: () => void): this
}

class EventBus extends EventEmitter {
  
}

export default new EventBus()
