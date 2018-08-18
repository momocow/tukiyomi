import * as path from 'path'

export const IS_DEV = process.env.NODE_ENV === 'development'
export const ROOT = __dirname
export const VIEWS_ENTRY = path.join(ROOT, 'views', 'index.html')
