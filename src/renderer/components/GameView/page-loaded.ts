import { parse as parseURL } from 'url'

import addDimmer from '../../assets/guest/add-dimmer'
import setDMMCookie from '../../assets/guest/dmm-cookie'
import Guest from '../../utils/guest'

import { KANCOLLE_URL, DMM_HOSTNAME } from '../../../common/config'

const CSS_GAME_LAYOUT = require('!!raw-loader!../../assets/guest/game-layout.css')
const CSS_LOGIN_FORM = require('!!raw-loader!../../assets/guest/login-form.css')

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
          // gameview.executeJavaScript(SCRIPT_GAME_LAYOUT)
        }
      }
}
