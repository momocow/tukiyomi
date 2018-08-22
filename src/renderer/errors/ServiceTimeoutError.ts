export default class ServiceTimeoutError extends Error {
  constructor (public svc: string, public timeout: number) {
    super(`The IPC request to service, "${svc}", has been timeout. Timeout: ${timeout} ms`)
    this.name = 'ServiceTimeoutError'
  }
}
