import fs from 'fs'

import safeCall from '../common/safe'

export const IS_DEV = process.env.START_FROM_NPM ||
  process.argv.includes('--dev') ||
  process.env.NODE_ENV === 'development'

export const RELEASE: string = safeCall<string>(fs.readFileSync, [ 'RELEASE', 'utf8' ], '')
export const IS_RELEASE: boolean = RELEASE.length > 0
