# Reference Registry / Reference Database
In order to avoid using global variables like `window` and `global`, use reference registries to perform variable management, including life time and access control, based on namespaces. 

## Reference Table
### Main Process
#### Namespace `__GLOBAL__`
### Renderer Process
#### Namespace `__GLOBAL__`
- `i18n` I18n

#### Namespace `dom`
- `gameview` [Electron.WebviewTag](https://electronjs.org/docs/api/webview-tag)

## API
```ts
import ref from '<rel-path>/common/references'
```

### `ref`
- Type: [GlobalRefRegistry](#class-globalrefregistry)

### class GlobalRefRegistry
- Extends: [RefRegistry](#class-refregistry)
- Methods:
  - `namespace`(`nsp`: string) => [LazyRefRegistry](#class-lazyrefregistry)

### class RefRegistry
Each namespace in the GlobalRefRegistry instace is corresponding to a RefRegistry instance. A RefRegistry instance is a storage of variables.
- Extends: [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)
- Events:
  - `set` (`key`: string, `value`: any)
  - `change` (`key`: string, `newVal`: any, `oldVal`: any)
- Methods
  - `get`(`key`: string) => any
  - `set`(`key`: string, `value`: any, `options?`: [RefDescriptor](#interface-refdescriptor)) => this

If calling `RefRegistry#set()` to a readonly key-value pair, a [ReadonlyReferenceError](#interface-readonlyreferenceerror) error will be thrown.

### class LazyRefRegistry
A lightweight, phantom class for [RefRegistry](#class-refregistry), it is intends to stands for a RefRegistry instance without any side effects.

The actual RefRegistry instance will not be created until any method with side effects is called, for example, `RefRegistry#on()` and `RefRegistry#set()`. These methods are usually fluent API methods and the returned value will be the actual RefRegistry instance.

- Methods:
  - `on`(`event`: string | symbol, `listener`: Listener) => [RefRegistry](#class-refregistry)
    - Listener: (`...args`: any[]) => void
  - `get`(`key`: string) => any
  - `set`(`key`: string, `value`: any, `options?`: [RefDescriptor](#interface-refdescriptor)) => [RefRegistry](#class-refregistry)

### interface RefDescriptor
```ts
interface RefDescriptor {
  readonly?: boolean
}
```

### interface ReadonlyReferenceError
```ts
interface ReadonlyReferenceError {
  namespace: string,
  key: string
}
```

## Examples
```ts
import ref from '<rel-path>/common/references'

ref
  .set('logger', new Logger('core:view'), { readonly: true })
  .namespace('logger')
    .set('plugin-a', new Logger('plugin:plugin-a'))

ref.get('logger')
  .info('Global logger')

ref.namespace('logger').get('plugin-a')
  .debug('Local logger')

ref.set('logger', new Logger('another'))
// throw ReadonlyReferenceError
```
