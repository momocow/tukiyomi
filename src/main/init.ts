import { format as formatUrl } from 'url'
import path from 'path'

export const IS_DEV = process.env.START_FROM_NPM || process.env.NODE_ENV === 'development'

export const ROOT_DIR = '..'
export const VIEW_DIR = '.'
export const VIEW_ENTRY = formatUrl({
  pathname: path.join(__dirname, '..', 'renderer', 'index.html'),
  protocol: 'file',
  slashes: true
})
