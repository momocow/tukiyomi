interface RefDescriptor {
  readonly?: boolean
}

class ReadonlyReferenceError extends Error {
  constructor (public namespace: string, public key: string) {
    super(`Readonly reference, "${key}", in namespace, "${namespace}", cannot be assigned to another value.`)
  }
}

class RefRegistry extends Map<string, any> {
  private _readonlyRefs: string[] = []

  constructor (private _namespace: string) {
    super()
  }

  set (key: string, val: any, options: RefDescriptor = { readonly: false }): this {
    if (this._readonlyRefs.includes(key)) {
      throw new ReadonlyReferenceError(this._namespace, key)
    }

    if (options.readonly) {
      this._readonlyRefs.push(key)
    }

    return super.set(key, val)
  }
}

class LazyRefRegistry {
  constructor (
    public namespace: string
  ) {
  }

  get (key: string) {
    return refs[this.namespace] ? refs[this.namespace].get(key) : undefined
  }

  set (key: string, val: any, options?: RefDescriptor): RefRegistry {
    const registry = refs[this.namespace] || (refs[this.namespace] = new RefRegistry(this.namespace))
    return registry.set(key, val, options)
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