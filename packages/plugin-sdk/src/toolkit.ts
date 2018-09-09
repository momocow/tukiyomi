export function getConfig<T> (key: string, defaultVal: T): T {
  return global.config.get(key, defaultVal)
}

export function setConfig<T> (key: string, val: T) {
  global.config.set(key, val)
}

export function getGuestUtils () {
  return global.guest
}
