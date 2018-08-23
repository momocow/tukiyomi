export default function alignGameLayout () {
  const gameFrame = document.querySelector<HTMLIFrameElement>('#game_frame')
  if (gameFrame) {
    gameFrame.addEventListener('load', function () {
      const gameDoc = gameFrame.contentWindow.document
      const wrapper = gameDoc.querySelector<HTMLDivElement>('#flashWrap')
      if (wrapper) {
        wrapper.style.position = 'absolute'
        wrapper.style.top = '0'
        wrapper.style.zIndex = '100'
      }
  
      handleSpacingTop(false)
    })
  }

  /**
   * Thanks to Poi
   * @see https://github.com/poooi/poi/blob/396a06174f464837ce89011e92ef9d1dbb5c5b1e/assets/js/webview-preload.js#L42
   */
  function handleSpacingTop (show: boolean) {
    const status = show ? 'block' : 'none'
    if (document.querySelector('#spacing_top')) {
      document.querySelector('#spacing_top').style.display = status
    }
    if (!document.querySelector('#game_frame')) {
      return
    }
    function t (count) {
      try {
        if (count > 20) {
          return
        }
        document.querySelector('#game_frame').contentWindow.document.querySelector('#spacing_top').style.display = status
      } catch (e) {
        setTimeout(() => t(count + 1), 1000)
      }
    }
    t(0)
  }
}
