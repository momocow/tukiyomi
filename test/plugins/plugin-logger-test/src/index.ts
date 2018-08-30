import { Plugin } from '@tukiyomi/plugin-sdk'

// https://github.com/patriksimek/vm2/issues/152
// console.debug('[debug] outside')
console.info('[info] outside')
console.log('[log] outside')
console.warn('[warn] outside')
console.error('[error] outside')

@Plugin
export default class LoggerTestPlugin {
  constructor (dir: string) {
    // console.debug('[debug] outside')
    console.info('[info] outside')
    console.log('[log] outside')
    console.warn('[warn] outside')
    console.error('[error] outside')

    console.log('DIR ===> "%s"', dir)
  }
}
