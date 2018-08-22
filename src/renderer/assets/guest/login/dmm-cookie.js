function getCookie (cname) {
  var name = cname + '='
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

const expiresDate = new Date(Date.now() + 86400000 * 365).toUTCString()
const cklg = getCookie('cklg')
const ckcy = getCookie('ckcy')

if (cklg !== 'welcome') {
  document.cookie = `cklg=welcome;expires=${expiresDate};domain=.dmm.com;path=/`
  document.cookie = `cklg=welcome;expires=${expiresDate};domain=.dmm.com;path=/netgame_s/`
  document.cookie = `cklg=welcome;expires=${expiresDate};domain=.dmm.com;path=/netgame/`
}

if (ckcy !== '1') {
  document.cookie = `ckcy=1;expires=${expiresDate};domain=.dmm.com;path=/`
  document.cookie = `ckcy=1;expires=${expiresDate};domain=.dmm.com;path=/netgame_s/`
  document.cookie = `ckcy=1;expires=${expiresDate};domain=.dmm.com;path=/netgame/`
}
