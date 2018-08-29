import { EventEmitter } from 'events'

type TukiYomiEvent = "battle.start" |
  "battle.end"

interface EventBus {
  on (event: "login", listener: () => void): this
  on (event: "start", listener: () => void): this
  on (event: "dock", listener: () => void): this
  on (event: "battle.end", listener: () => void): this
  on (event: "battle.start", listener: () => void): this
}

class EventBus extends EventEmitter {
  un (event?: TukiYomiEvent, listener?: (...args: any[]) => void): this {
    if (event && listener) {
      return super.removeListener(event, listener)
    } else {
      return super.removeAllListeners(event)
    }
  }
}

export default new EventBus()
