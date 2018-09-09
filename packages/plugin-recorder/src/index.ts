///<reference path="../dom.d.ts" />
import {
  Plugin,
  env,
  on,
  getGuestUtils,
  ipc,
  getConfig
} from '@tukiyomi/plugin-sdk'

import {
  MapStartEvent
} from '@tukiyomi/events'

import { connect } from 'socket.io-client'
import { createWriteStream, WriteStream, existsSync } from 'fs'
import { join } from 'path'
import * as dateformat from 'dateformat'

@Plugin({
  default: {
    media_type: 'webm',
    video_bps: 4000000,
    audio_bps: 64000,
    filename: '[{timestamp:yyyymmdd-HHMMss}][{map}] Record'
  }
})
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

    const fileExt = getConfig('media_type', 'webm').replace(/^video\//, '')
    const filenameTpl = getConfig('filename', '[{timestamp:yyyymmdd-HHMMss}][{map}] Record')
    let filename = filenameTpl
      .replace('{map}', evt.mapReadable)
    
    const matched = filename.match(/{timestamp(:(yyyymmdd-HHMMss))?}/)
    if (matched) {
      filename = filename.replace(
        matched[0], matched[2] ? dateformat(matched[2]) : new Date().toISOString())
    }

    let recordFile = join(env.DATA_DIR, filename)

    let suffix = 1
    while (existsSync(recordFile + '.' + fileExt)) {
      recordFile = recordFile.replace(/(\.\d+)?$/, '.' + suffix)
      suffix++
    }

    this._ostream = createWriteStream(recordFile + '.' + fileExt)
    console.info('Outputing to "%s"', recordFile)

    this._live = connect(`ws://127.0.0.1:${port}/live`)
    this._live.on('blob', (data: ArrayBuffer, meta: { id: number }) => {
      if (this._ostream) {
        this._ostream.write(Buffer.from(data))
      }
    })

    const recorderOptions: MediaRecorderOptions = {
      mimeType: 'video/' + fileExt,
      audioBitsPerSecond: getConfig('audio_bps', 64000),
      videoBitsPerSecond: getConfig('video_bps', 4000000)
    }
    console.log('Recorder optioins = %O', recorderOptions)

    await guest.run(function (options: any) {
      window.TUKIYOMI_START_RECORD(500, options)
      console.log('start recording')
    }, [ recorderOptions ])
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
