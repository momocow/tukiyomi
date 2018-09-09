# TukiYomi Plugin SDK
A SDK for [TukiYomi Browser](https://github.com/momocow/tukiyomi) plugins, yet another Scalable KanColle Browser, written in Typescript, powered by Electron and Vue.

> WIP

> Undocumented

> You may want to see some WIP core plugins, like the [Recorder plugin](https://github.com/momocow/tukiyomi/tree/v0.1.0/packages/plugin-recorder).

## Example
```ts
import {
  Plugin,
  on,
  getConfig,
  NetworkEvent
} from '@tukiyomi/plugin-sdk'

@Plugin({
  // default configs
  default: {
    demo: true
  }
})
export class MyPlugin {
  @start
  onStart () {
    const isDemo = getConfig('demo') // true
  }

  @on('network')
  @on('kcsapi')
  onNetwork (evt: NetworkEvent) {
    console.log(evt)
  }

  @stop
  onStop () {
    console.log('Bye')
  }
}
```
