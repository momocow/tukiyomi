///<reference path="../../../../../../types/dom.d.ts" />

// export default function captureCanvas () {
//   const gameFrame = <HTMLIFrameElement>document.getElementById('game_frame')
//   if (gameFrame && gameFrame.contentWindow && gameFrame.contentWindow.document) {
//     const htmlWrap = <HTMLIFrameElement>gameFrame.contentWindow.document.getElementById('htmlWrap')
//     if (htmlWrap && htmlWrap.contentWindow && htmlWrap.contentWindow.document) {
//       const cv = htmlWrap.contentWindow.document.querySelector('canvas')
//       if (cv) {
//         return cv.toDataURL()
//       }
//     }
//   }

//   return ''
// }

export function initRecorder () {
  function getCanvas () {
    const gameFrame = <HTMLIFrameElement>document.getElementById('game_frame')
    if (gameFrame && gameFrame.contentWindow && gameFrame.contentWindow.document) {
      const htmlWrap = <HTMLIFrameElement>gameFrame.contentWindow.document.getElementById('htmlWrap')
      if (htmlWrap && htmlWrap.contentWindow && htmlWrap.contentWindow.document) {
        return htmlWrap.contentWindow.document.querySelector('canvas')
      }
    }
    return undefined
  }

  const cv = getCanvas()
  if (cv) {
    const stream = cv.captureStream()
    window.TUKIYOMI_CANVAS_RECORDER = new MediaRecorder(stream, { mimeType: 'video/webm' })
  }
} 

export function startCanvasStream () {
  
  
  return false
}
