import sentry from '@sentry/electron'

import { IS_RELEASE, RELEASE } from './env'
import { registerService } from './ipc'
import { SENTRY_DSN } from '../common/constants'

if (IS_RELEASE) {
  sentry.init({
    dsn: SENTRY_DSN,
    release: RELEASE
  })
}

registerService('get-release', function () {
  return RELEASE
})
