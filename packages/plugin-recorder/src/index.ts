///<reference path="../dom.d.ts" />
import {
  Plugin,
  env,
  on,
  getGuestUtils,
  ipc
} from '@tukiyomi/plugin-sdk'

import {
  MapStartEvent
} from '@tukiyomi/events'

import { connect } from 'socket.io-client'
import { createWriteStream, WriteStream, existsSync } from 'fs'
import { join } from 'path'
import * as dateformat from 'dateformat'

@Plugin
export default class Recorder {
  private _live?: SocketIOClient.Socket
  private _ostream?: WriteStream

  @on('kcsapi.map.start')
  async onMapStart (evt: MapStartEvent) {
    console.log('Map start')

    const guest = getGuestUtils()
    // TODO this should be provided by Core
    const port = await guest.run(function () {
      return window.TUKIYOMI_STREAM_PORT
    })

    let recordFile = join(
      env.DATA_DIR, dateformat('[yyyymmdd-HHMMss]') +
        `[${evt.mapReadable}] Record`)
    
    let suffix = 1
    while (existsSync(recordFile + '.webm')) {
      recordFile = recordFile.replace(/(\.\d+)?$/, '.' + suffix)
      suffix++
    }

    this._ostream = createWriteStream(recordFile + '.webm')
    console.log('Outputing to "%s"', recordFile)

    this._live = connect(`ws://127.0.0.1:${port}/live`)
    this._live.on('blob', (data: ArrayBuffer, meta: { id: number }) => {
      if (this._ostream) {
        this._ostream.write(Buffer.from(data))
      }
    })
    
    await guest.run(function () {
      window.TUKIYOMI_START_RECORD(500, {
        mimeType: 'video/webm',
        audioBitsPerSecond: 64000,
        videoBitsPerSecond: 4000000 // 4Mbps
      })
      console.log('start recording')
    })
    ipc.publish('status-msg', 'Start recording.')
  }

  @on('network.reload')
  @on('kcsapi.port')
  onMapEnd () {
    setTimeout(() => {
      if (this._ostream || this._live) {
        const guest = getGuestUtils()
        guest.run(function () {
          window.TUKIYOMI_STOP_RECORD()
        })
        console.log('stop recording')
        ipc.publish('status-msg', 'Stop recording.')
      }
      if (this._ostream) {
        this._ostream.end()
        this._ostream = undefined
        console.log('stop file stream')
      }
      if (this._live) {
        this._live.close()
        this._live = undefined
        console.log('stop socket.io connection')
      }
    }, 1000)
  }
}
