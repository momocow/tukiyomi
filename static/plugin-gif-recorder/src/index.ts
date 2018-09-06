import {
  Plugin,
  on,
  canvas
} from '@tukiyomi/plugin-sdk'


@Plugin
export default class GIFRecorder {
  @on('kcsapi')
  readCanvas () {
    console.log(canvas.width)
  }
}
