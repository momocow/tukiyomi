import * as path from 'path'

export const IS_DEV = process.env.NODE_ENV === 'development'
if (!IS_DEV) {
  process.env.NODE_ENV === 'production'
}

export const ROOT_DIR = __dirname
export const VIEWS_DIR = path.join(ROOT_DIR, 'views', 'index.html')
