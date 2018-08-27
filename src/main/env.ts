/****************************************
 * Environment Detection,
 * data that never change during runtime
 ****************************************/

import fs from 'fs'
import { app } from 'electron'
import { join } from 'path'

import safeCall from '../common/safe'

export const START_FROM_NPM = process.env.START_FROM_NPM
export const IS_DEV = START_FROM_NPM ||
  process.argv.includes('--dev') ||
  process.env.NODE_ENV === 'development'

export const RELEASE: string = safeCall<string>(fs.readFileSync, [ 'RELEASE', 'utf8' ], '')
export const IS_RELEASE: boolean = RELEASE.length > 0

export const ROOT_DIR = app.getAppPath()
export const ASSETS_DIR = join(ROOT_DIR, 'assets')
