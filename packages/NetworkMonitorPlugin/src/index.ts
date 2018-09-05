import { Plugin, on, Message } from '@tukiyomi/plugin-sdk'

@Plugin
export default class NetworkMonitorPlugin {
  @on('network.raw')
  onNetwork (req: Message, res: Message, timestamp: Date) {
    console.log('> %s', timestamp)
    // console.log('[REQ] %s "%s"', req.method, req.url)
    // console.log('[RES] %s "%s"', res.method, res.url)
  }
}
