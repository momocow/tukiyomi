class GuestContent {
  constructor (public webContent: Electron.WebviewTag | Electron.webContents) {

  }

  /**
   * `fn` will be stringified and execute in the guest page.
   */
  run (fn: Function, useGesture?: boolean, options: { timeout: number } = { timeout: Infinity }) {
    return new Promise((resolve, reject) => {
      let timer: NodeJS.Timer | undefined

      this.webContent.executeJavaScript(`(${fn.toString()})();`, useGesture, (result: any) => {
        resolve(result)
        if (timer) {
          clearTimeout(timer)
        }
      })

      if (options && options.timeout < Infinity) {
        timer = setTimeout(() => {
          reject(new Error('Guest javascript execution timeout'))
        }, options.timeout)
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
