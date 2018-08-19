import * as path from 'path'

export const IS_DEV = process.env.NODE_ENV === 'development'
if (!IS_DEV) {
  process.env.NODE_ENV === 'production'
}

export const ROOT_DIR = path.dirname(__dirname)
export const VIEW_DIR = path.join(ROOT_DIR, 'view')
export const VIEW_ENTRY = path.join(VIEW_DIR, 'index.html')
