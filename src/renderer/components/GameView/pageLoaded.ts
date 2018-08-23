import { parse as parseURL } from 'url'

import addDimmer from './guest/scripts/addDimmer'
import setDMMCookie from './guest/scripts/setDMMCookie'
import { alignGameLayout, resizeGameView } from './guest/scripts/alignGameLayout'
import Guest from './guest'

import { subscribe } from '../../ipc'

import { KANCOLLE_URL, DMM_HOSTNAME } from '../../../common/config'

const CSS_GAME_LAYOUT = require('!!raw-loader!./guest/style/game-layout.css')
const CSS_LOGIN_FORM = require('!!raw-loader!./guest/style/login-form.css')

export default function onPageLoaded (gameview: Electron.WebviewTag) {
  const guest = Guest(gameview)
  const url = gameview.getURL()
  const { hostname, pathname } = parseURL(url)
  const { pathname: gamePath } = parseURL(KANCOLLE_URL)

  if (hostname === DMM_HOSTNAME && pathname) {
    // Guest
    if (pathname.startsWith('/my/-/login')) {
      guest.run(addDimmer)
      guest.run(setDMMCookie)
      guest.decorate(CSS_LOGIN_FORM)
    } else if (gamePath && pathname.startsWith(gamePath)) {
      guest.decorate(CSS_GAME_LAYOUT)
      guest.run(alignGameLayout)
      const { width } = gameview.getBoundingClientRect()
      guest.run(resizeGameView, [ width ])
      subscribe('window-resize', function () {
        guest.run(resizeGameView, [ width ])
      })
    }
  }
}
