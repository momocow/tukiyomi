import Config from '../utils/Config'
import I18n from '../utils/I18n'

import ref from '../../common/refdb'

export const config = new Config('core:renderer')

config.on('load', function () {
  // TODO: I18n
  const lang = config.get('i18n.lang', 'zh-TW')
  const i18n = new I18n(lang)
  ref.set('i18n', i18n, { readonly: true })
})

ref.set('config', config, { readonly: true })
