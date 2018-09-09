// register an event listener according to the Plugin constructor or its prototype
function register (target: Object, event: string, listener: Function) {
  let map = eventMap.get(target)
  if (!map) {
    map = new Map()
    eventMap.set(target, map)
  }
  let evtQueue = map.get(event)
  if (!evtQueue) {
    evtQueue = []
    map.set(event, evtQueue)
  }
  evtQueue.push(listener)
}

export function start (target: any, prop: string, descriptor: PropertyDescriptor) {
  if (typeof descriptor.value === 'function') {
    register(target, 'app.start', descriptor.value)
  }
}

export function ready (target: any, prop: string, descriptor: PropertyDescriptor) {
  if (typeof descriptor.value === 'function') {
    register(target, 'app.ready', descriptor.value)
  }
}

export function stop (target: any, prop: string, descriptor: PropertyDescriptor) {
  if (typeof descriptor.value === 'function') {
    register(target, 'app.stop', descriptor.value)
  }
}

interface methodDecorator {
  (target: any, key: string, descriptor: PropertyDescriptor): void
}

export function on (event: "network.reload"): methodDecorator
export function on (event: "network.res"): methodDecorator
export function on (event: "network.req"): methodDecorator
export function on (event: "network"): methodDecorator
export function on (event: "kcsapi"): methodDecorator
export function on (event: "kcsapi.port"): methodDecorator
export function on (event: "kcsapi.map.start"): methodDecorator
// https://www.typescriptlang.org/docs/handbook/decorators.html#method-decorators
export function on (event: string): methodDecorator {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    if (typeof descriptor.value === 'function') {
      register(target, event, descriptor.value)
    }
  }
}

export const eventMap: WeakMap<Object, Map<string, Function[]>> = new WeakMap()
