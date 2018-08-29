export function init (target: any, prop: string) {
  const listener = target[prop]
  if (listener) {
    global.eventBus.on('init', listener)
  }
}

export function destroy (target: any, prop: string) {
  const listener = target[prop]
  if (listener) {
    global.eventBus.on('destroy', listener)
  }
}
