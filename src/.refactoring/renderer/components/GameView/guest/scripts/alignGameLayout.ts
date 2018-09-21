export default function alignGameLayout () {
  window.scrollTo(0, 0)

  handleSpacingTop(false)

  /**
   * Thanks to Poi
   * @see https://github.com/poooi/poi/blob/396a06174f464837ce89011e92ef9d1dbb5c5b1e/assets/js/webview-preload.js#L42
   */
  function handleSpacingTop (show: boolean) {
    const status = show ? 'block' : 'none'
    let spacingTop = document.querySelector<HTMLElement>('#spacing_top')
    if (spacingTop) {
      spacingTop.style.display = status
      console.debug('I got you, SpacingTop (outer)!')
    }
    if (!document.querySelector('#game_frame')) {
      return
    }

    let count = 0
    const timer = setInterval(function () {
      if (count > 20) { // max try, give up
        console.debug('Max number of try reached. Give up.')
        clearInterval(timer)
        return
      }

      count++

      const gameFrame = document.querySelector<HTMLIFrameElement>('#game_frame')
      if (gameFrame && gameFrame.contentWindow && gameFrame.contentWindow.document) {
        spacingTop = gameFrame.contentWindow.document.querySelector<HTMLElement>('#spacing_top')
        if (spacingTop) {
          spacingTop.style.display = status
          console.debug('I got you, SpacingTop (inner)!')
          clearInterval(timer)
        }
      }
    }, 1000)
  }
}
