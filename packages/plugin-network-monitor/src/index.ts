import {
  Plugin,
  on,
  KCSAPIEvent
} from '@tukiyomi/plugin-sdk'

@Plugin
export default class NetworkMonitorPlugin {
  @on('kcsapi')
  onKCSAPI (evt: KCSAPIEvent) {
    console.log('===================================================')
    console.log('> %s', evt.timestamp.toISOString())
    console.log('> %s "%s"', evt.method, evt.url)
    console.log('> params = %O', evt.params)
    console.log('> responseObj = %O', evt.responseJSON)
  }
}
