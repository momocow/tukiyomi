export default function captureCanvas () {
  const gameFrame = <HTMLIFrameElement>document.getElementById('game_frame')
  if (gameFrame && gameFrame.contentWindow && gameFrame.contentWindow.document) {
    const htmlWrap = <HTMLIFrameElement>gameFrame.contentWindow.document.getElementById('htmlWrap')
    if (htmlWrap && htmlWrap.contentWindow && htmlWrap.contentWindow.document) {
      const cv = htmlWrap.contentWindow.document.querySelector('canvas')
      if (cv) {
        return cv.toDataURL()
      }
    }
  }

  return ''
}