import { EventEmitter } from 'events'

interface RefDescriptor {
  readonly?: boolean
}

class ReadonlyReferenceError extends Error {
  constructor (public namespace: string, public key: string) {
    super(`Readonly reference, "${key}", in namespace, "${namespace}", cannot be assigned to another value.`)
  }
}

class RefEntry {
  constructor (
    public value: any,
    public options: RefDescriptor = { readonly: false }
  ) {}
}

class RefRegistry extends EventEmitter {
  private _storage: Map<string, RefEntry> = new Map()

  constructor (private _namespace: string) {
    super()
  }

  get (key: string): any {
    const entry = this._storage.get(key)
    return entry ? entry.value : undefined
  }

  set (key: string, val: any, options?: RefDescriptor): this {
    let entry: RefEntry | undefined = this._storage.get(key)
    if (entry && entry.options.readonly) {
      throw new ReadonlyReferenceError(this._namespace, key)
    }

    if (entry) {
      const oldVal = entry.value
      entry.value = val
      this.emit('change', key, val, oldVal)
    } else {
      this._storage.set(key, new RefEntry(val, options))
      this.emit('set', key, val)
    }

    return this
  }
}

class LazyRefRegistry {
  constructor (
    private _namespace: string
  ) {
  }

  private _getRegistry (): RefRegistry {
    if (!refs[this._namespace]) {
      refs[this._namespace] = new RefRegistry(this._namespace)
    }
    return refs[this._namespace]
  }

  on (event: string | symbol, listener: (...args: any[]) => void): RefRegistry {
    return this._getRegistry().on(event, listener)
  }

  get (key: string) {
    return refs[this._namespace] ? refs[this._namespace].get(key) : undefined
  }

  set (key: string, val: any, options?: RefDescriptor): RefRegistry {
    return this._getRegistry().set(key, val, options)
  }
}

class GlobalRefRegistry extends RefRegistry {
  constructor () {
    super('__GLOBAL__')
  }

  namespace (nsp: string): LazyRefRegistry | RefRegistry {
    return refs[nsp] || new LazyRefRegistry(nsp)
  }
}

const refs: {[namespace: string]: RefRegistry} = {}

/**
 * It's for global reference purpose.
 * Use it with memory awareness since there are Maps under the hood,
 * references should be cleaned up manually if it is no longer needed.
 */
export default new GlobalRefRegistry()