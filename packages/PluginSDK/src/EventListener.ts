// https://www.typescriptlang.org/docs/handbook/decorators.html#method-decorators
export function on (event: string) {
  return function (target: any, key: string) {
    const listener = target[key]
    if (typeof listener === 'function') {
      global.eventBus.on(event, listener.bind(target))
    }
  }
}
