declare module "@grass/grass-rolling-array" {

  class RollingArray<T> extends Array<T> {
    constructor (maxLen?: number, bufLen?: number, ...args: any[])
    on: (event: "overflow", listener: (victims: any[], survivors: RollingArray<T>) => void) => this
    off: (event: "overflow", listener?: (victims: any[], survivors: RollingArray<T>) => void) => this
  }

  export default RollingArray
}