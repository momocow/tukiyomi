export default function safeCall<T> (fn: (..._: any[]) => T, args: any[] = [], defaultVal?: any): T {
  try {
    return fn(...args) || defaultVal
  } catch (e) {
    return defaultVal
  }
}
