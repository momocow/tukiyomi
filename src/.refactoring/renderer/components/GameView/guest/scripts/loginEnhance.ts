export default function applyLoginEnhance () {
  const ct = document.querySelector<HTMLElement>('#main-my.page-login .area-login>.sect')
  if (ct) {
    ct.classList.add('tukiyomi-login-enhance')
  }

  document.body.appendChild(document.createElement('div'))
    .classList.add('tukiyomi-dimmer')
}
