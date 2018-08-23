interface GuestRunOptions {
  timeout?: number,
  useGesture?: boolean
}

class GuestContent {
  constructor (public webContent: Electron.WebviewTag | Electron.webContents) {

  }

  /**
   * `fn` will be stringified and execute in the guest page.
   */
  run (fn: Function): Promise<any>
  run (fn: Function, args: any[]): Promise<any>
  run (fn: Function, options: GuestRunOptions): Promise<any>
  run (fn: Function, args: any[], options: GuestRunOptions): Promise<any>
  run (fn: Function, args?: any[] | GuestRunOptions, options?: GuestRunOptions) {
    const _args: any[] = !Array.isArray(args) ? [] : args
    const _options: GuestRunOptions = args && !Array.isArray(args) ? args
      : { timeout: Infinity, useGesture: false }

    return new Promise((resolve, reject) => {
      let timer: NodeJS.Timer | undefined
      let paramStr: string = _args.map(e => JSON.stringify(e)).join(',')

      this.webContent.executeJavaScript(
        `(${fn.toString()})(${paramStr});`,
        _options.useGesture,
        (result: any) => {
          resolve(result)
          if (timer) {
            clearTimeout(timer)
          }
        }
      )

      if (typeof _options.timeout === 'number' && _options.timeout < Infinity) {
        timer = setTimeout(() => {
          reject(new Error('Guest javascript execution timeout'))
        }, _options.timeout)
      }
    })
  }

  decorate (cssStr: string): void
  decorate (cssSelector: string, cssObj: object): void
  decorate (str: string, obj?: object): void {
    const cssStr = typeof obj === 'object' ? cssStringify(str, obj) : str
    this.webContent.insertCSS(cssStr)
  }

  static wrap (webContent: Electron.WebviewTag | Electron.webContents) {
    return new GuestContent(webContent)
  }
}

function cssStringify (selector: string, cssObj: {[prop: string]: any}) {
  const propStr = Object.keys(cssObj)
    .map(k => {
      return `${cssPropNormalize(k)}: ${cssObj[k]};`
    })
    .join('\n  ')
  return `${selector} {\n  ${propStr}\n}`
}

function cssPropNormalize (prop: string): string {
  return prop.replace(/([A-Z])/, '-$1')
    .toLowerCase()
}

export default GuestContent.wrap
