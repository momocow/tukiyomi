/***************************************
 * Data that may change as time goes on
 ***************************************/

import { RefRegistry } from '../common/refdb'

function forwardEvent (state: State, key: string, ...values: any[]) {
  state.emit(key, ...values)
}

class State extends RefRegistry {
  constructor () {
    super('__STATE__')

    super.on('join', (key, val) => {
      forwardEvent(this, key, val)
    })

    super.on('change', (key, newVal, oldVal) => {
      forwardEvent(this, key, newVal, oldVal)
    })
  }

  set (field: "stage", value: string) : this
  set (field: string, value: any): this {
    return super.set(field, value)
  }

  on (event: "stage", listener: (newVal: string, oldVal?: string) => void): this
  on (event: string, listener: (...args: any[]) => void) {
    return super.on(event, listener)
  }
}

export default new State()
