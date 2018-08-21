export const IS_DEV = process.env.START_FROM_NPM ||
  process.argv.includes('--dev') ||
  process.env.NODE_ENV === 'development'

import fs from 'fs'

import sentry from '@sentry/electron'
import safeCall from '../common/safe'

export const RELEASE: string = safeCall<string>(fs.readFileSync, [ 'RELEASE', 'utf8' ], '')
export const IS_RELEASE: boolean = RELEASE.length > 0

if (IS_RELEASE) {
  sentry.init({
    dsn: 'https://546035bef60748d3840cbe99b7fb955f@sentry.io/1265800',
    release: RELEASE
  })
}
