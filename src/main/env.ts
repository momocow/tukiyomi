/****************************************
 * Environment Detection,
 * data that never change during runtime
 ****************************************/

import fs from 'fs'
import { app } from 'electron'
import { join, dirname } from 'path'
import { platform } from 'os'

import safeCall from '../common/safe'

export const START_FROM_NPM = process.env.START_FROM_NPM === 'true'
export const IS_DEV = process.env.NODE_ENV === 'development' || START_FROM_NPM
export const RUN_IN_REPO = START_FROM_NPM ||
  Object.keys(process.env).filter(k => k.startsWith('ELECTRON_WEBPACK_')).length > 0
export const IS_WIN32 = platform() === 'win32'

export const RELEASE: string = safeCall<string>(fs.readFileSync, [ 'RELEASE', 'utf8' ], '')
export const IS_RELEASE: boolean = RELEASE.length > 0

const ASAR_PATH: string = app.getAppPath()

/**
 * It is out-most directory
 */
export const ROOT_DIR = RUN_IN_REPO ? join(__dirname, '..', '..') : dirname(app.getPath('exe'))
export const ASSETS_DIR = RUN_IN_REPO ? join(ROOT_DIR, 'assets') : join(ASAR_PATH, 'assets')
export const PLUGINS_DIR = join(ROOT_DIR, 'plugins')
export const STATIC_DIR = RUN_IN_REPO ? join(ROOT_DIR, 'static') : __static
export const LOGS_DIR = join(app.getPath('userData'), 'logs')
export const CONFIGS_DIR = join(app.getPath('userData'), 'configs')
export const DATA_DIR = join(app.getPath('userData'), 'data')
export const MODULE_DIR = RUN_IN_REPO ? join(ROOT_DIR, 'node_modules') : join(ASAR_PATH, 'node_modules')