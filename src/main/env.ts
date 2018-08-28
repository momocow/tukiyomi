/****************************************
 * Environment Detection,
 * data that never change during runtime
 ****************************************/

import fs from 'fs'
import { app } from 'electron'
import { join, dirname } from 'path'
import { platform } from 'os'

import safeCall from '../common/safe'

export const IS_DEV = process.env.NODE_ENV === 'development'
export const RUN_IN_REPO = process.env.START_FROM_NPM ||
  Object.keys(process.env).filter(k => k.startsWith('ELECTRON_WEBPACK_')).length > 0
export const IS_WIN32 = platform() === 'win32'

export const RELEASE: string = safeCall<string>(fs.readFileSync, [ 'RELEASE', 'utf8' ], '')
export const IS_RELEASE: boolean = RELEASE.length > 0

/**
 * For a packaged bin, it is right inside the app.asar
 * For project development app, it is the root where package.json is.
 */
export const APP_DIR = app.getAppPath()

/**
 * It is out-most directory
 */
export const ROOT_DIR = RUN_IN_REPO ? APP_DIR : dirname(app.getPath('exe'))
export const ASSETS_DIR = join(APP_DIR, 'assets')
export const PLUGINS_DIR = join(ROOT_DIR, 'plugins')
