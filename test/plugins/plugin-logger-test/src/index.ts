import { Plugin, start, stop, on, toolkit } from '@tukiyomi/plugin-sdk'

// https://github.com/patriksimek/vm2/issues/152
// console.debug('[debug] outside')
console.info('[info] outside')
console.log('[log] outside')
console.warn('[warn] outside')
console.error('[error] outside')

@Plugin({
  default: {
    test: true
  }
})
export default class LoggerTestPlugin {
  constructor () {
    // console.debug('[debug] outside')
    console.info('[info] outside')
    console.log('[log] outside')
    console.warn('[warn] outside')
    console.error('[error] outside')
  }

  @start
  onStart () {
    console.log('starting')
    console.log('Config available: test=%O', toolkit.config.get('test'))
  }

  @stop
  onStop () {
    console.log('stopping')
  }
}
