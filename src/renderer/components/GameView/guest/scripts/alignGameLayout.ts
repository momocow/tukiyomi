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
      console.debug('I got you, SpacingTop!')
    }
    if (!document.querySelector('#game_frame')) {
      return
    }
    function t (count: number) {
      try {
        if (count > 20) {
          return
        }
        const gameFrame = document.querySelector<HTMLIFrameElement>('#game_frame')
        if (gameFrame && gameFrame.contentWindow && gameFrame.contentWindow.document) {
          spacingTop = gameFrame.contentWindow.document.querySelector<HTMLElement>('#spacing_top')
          if (spacingTop) spacingTop.style.display = status
          console.debug('I got you, SpacingTop!')
        }
      } catch (e) {
        setTimeout(() => t(count + 1), 1000)
      }
    }
    t(0)
  }
}
