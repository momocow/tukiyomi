///<reference path="../../../types/dom.d.ts" />

export function injectCanvasRecorder (localPort: number) {
  function getHowler () {
    const gameFrame = <HTMLIFrameElement>document.getElementById('game_frame')
    if (gameFrame && gameFrame.contentWindow && gameFrame.contentWindow.document) {
      const htmlWrap = <HTMLIFrameElement>gameFrame.contentWindow.document.getElementById('htmlWrap')
      if (htmlWrap && htmlWrap.contentWindow) {
        return htmlWrap.contentWindow.Howler
      }
    }
  }

  window.TUKIYOMI_STREAM_PORT = localPort
  window.TUKIYOMI_CANVAS_RECORDER = class CanvasRecorder {
    public id: number = window.TUKIYOMI_CANVAS_RECORDER_INSTANCE_ID++

    private _recorder: MediaRecorder
    private _io = window.io(`ws://127.0.0.1:${localPort}/source`)

    constructor (
      private readonly _canvas: HTMLCanvasElement,
      private readonly _options?: MediaRecorderOptions
    ) {
      // Thanks to https://hacks.mozilla.org/2016/04/record-almost-everything-in-the-browser-with-mediarecorder/
      const mixedOutputStream: MediaStream = new MediaStream()
      const Howler = getHowler()

      const audioStreamDest = Howler.ctx.createMediaStreamDestination()
      Howler.masterGain.connect(audioStreamDest)
      
      const audioOutputStream: MediaStream = audioStreamDest.stream
      const videoOutputStream: MediaStream = this._canvas.captureStream()

      const streams = [
        audioOutputStream,
        videoOutputStream
      ]

      streams.forEach(s => {
        s.getTracks().forEach(track => {
          mixedOutputStream.addTrack(track)
        })
      })

      this._recorder = new MediaRecorder(mixedOutputStream, this._options)

      this._recorder.ondataavailable = (e) => {
        const reader = new FileReader()
        reader.onload = () => {
          this._io.emit('blob', reader.result, { id: this.id })
        }
        reader.readAsArrayBuffer(<Blob>e.data)
      }
    }

    start (timeslice: number) {
      if (this._io.connected) {
        this._recorder.start(timeslice)
      } else {
        this._io.on('connect', () => {
          this._recorder.start(timeslice)
        })
      }
    }

    flush () {
      this._recorder.requestData()
    }

    stop () {
      this._recorder.stop()
      this._io.close()
    }
  }

  document.head.appendChild(document.createElement('script')).src = `http://127.0.0.1:${localPort}/socket.io.js`

  window.TUKIYOMI_START_RECORD = function (timeslice?: number, options?: MediaRecorderOptions) {
    function getCanvas () {
      const gameFrame = <HTMLIFrameElement>document.getElementById('game_frame')
      if (gameFrame && gameFrame.contentWindow && gameFrame.contentWindow.document) {
        const htmlWrap = <HTMLIFrameElement>gameFrame.contentWindow.document.getElementById('htmlWrap')
        if (htmlWrap && htmlWrap.contentWindow && htmlWrap.contentWindow.document) {
          return htmlWrap.contentWindow.document.querySelector('canvas')
        }
      }
      return undefined
      // const ct = document.getElementById('container')
      // return ct ? ct.querySelector('canvas') : undefined
    }
  
    const cv = getCanvas()
  
    if (!cv) return false
  
    if (window.TUKIYOMI_CANVAS_RECORDER_INSTANCE) {
      window.TUKIYOMI_CANVAS_RECORDER_INSTANCE.stop()
    }
    window.TUKIYOMI_CANVAS_RECORDER_INSTANCE = new window.TUKIYOMI_CANVAS_RECORDER(cv, options)
    window.TUKIYOMI_CANVAS_RECORDER_INSTANCE.start(timeslice)
    return true
  }

  window.TUKIYOMI_STOP_RECORD = function () {
    if (window.TUKIYOMI_CANVAS_RECORDER_INSTANCE) {
      window.TUKIYOMI_CANVAS_RECORDER_INSTANCE.stop()
      window.TUKIYOMI_CANVAS_RECORDER_INSTANCE = undefined
    }
  }
}
