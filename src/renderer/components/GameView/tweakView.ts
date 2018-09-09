import { parse as parseURL } from 'url'
import throttle from 'lodash/throttle'

import applyLoginEnhance from './guest/scripts/loginEnhance'
import setDMMCookie from './guest/scripts/setDMMCookie'
import alignGameLayout from './guest/scripts/alignGameLayout'
import Guest from '../../../common/Guest'

import { subscribe } from '../../ipc'
import { appLogger } from '../../logging/loggers'

import { KANCOLLE_URL, DMM_HOSTNAME, GAME_RESOLUTION_WIDTH, GAME_RESOLUTION_HEIGHT } from '../../../common/config'

const CSS_GAME_LAYOUT = require('!!raw-loader!./guest/style/game-layout.css')
const CSS_LOGIN_FORM = require('!!raw-loader!./guest/style/login-form.css')

// inline config
const RESIZE_DELAY = 100

export default function tweakView (gameview: Electron.WebviewTag) {
  const guest = Guest(gameview)
  const url = gameview.getURL()
  const { hostname, pathname } = parseURL(url)
  const { pathname: gamePath } = parseURL(KANCOLLE_URL)

  if (hostname === DMM_HOSTNAME && pathname) {
    // Guest
    if (pathname.startsWith('/my/-/login')) {
      gameview.setZoomFactor(1)
      guest.run(applyLoginEnhance)
      guest.run(setDMMCookie)
      guest.decorate(CSS_LOGIN_FORM)
    } else if (gamePath && pathname.startsWith(gamePath)) {
      guest.decorate(CSS_GAME_LAYOUT)
      guest.run(alignGameLayout)
      gameview.setZoomFactor(1.1979999796549479)
      resizeGameView(gameview)
      const throttledResize = throttle(resizeGameView, RESIZE_DELAY)
      subscribe('window-resize', function () {
        throttledResize(gameview)
      })
    }
  }
}

function resizeGameView (gameview: Electron.WebviewTag) {
  const { width, height } = gameview.getBoundingClientRect()
  const zoom = Math.min(width / GAME_RESOLUTION_WIDTH, 1)
  gameview.setZoomFactor(zoom)
  appLogger.debug('Gameview: zoom=%f (W: %d/%d, H: %d/%d)',
    zoom, width, GAME_RESOLUTION_WIDTH, height, GAME_RESOLUTION_HEIGHT)
}
