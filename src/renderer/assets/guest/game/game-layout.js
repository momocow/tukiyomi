const gameFrame = document.querySelector('#game_frame')
gameFrame.addEventListener('load', function () {
  const gameDoc = gameFrame.contentWindow.document
  const wrapper = gameDoc.querySelector('#flashWrap')
  wrapper.style.position = 'absolute'
  wrapper.style.top = '0'
  wrapper.style.zIndex = '100'

  const canvasFrame = gameDoc.querySelector('#htmlWrap')
  console.log(gameDoc, canvasFrame)
  // canvasFrame.addEventListener('load', function () {
  //   const canvasDoc = canvasFrame.contentWindow.document
  //   const gameCanvas = canvasDoc.querySelector('canvas')
  //   gameCanvas.style.width = '100vw'
  //   gameCanvas.style.height = '100vh'
  // })
})
