import {
  Plugin,
  on,
  KCSAPIEvent,
  env
} from '@tukiyomi/plugin-sdk'

import { writeFile, existsSync } from 'fs'
import { parse, join } from 'path'
import { promisify } from 'util'

const writeFileAsync = promisify(writeFile)

function getPostfixPath (absPath: string, postfix: number) {
  const pathObj = parse(absPath)
  if (postfix > 1) {
    const prevPostfix = '.' + (postfix - 1)
    pathObj.name = pathObj.name.endsWith(prevPostfix)
      ? pathObj.name.substr(0, pathObj.name.length - prevPostfix.length)
        : pathObj.name
  }
  pathObj.name += '.' + postfix
  return join(pathObj.dir, pathObj.name + pathObj.ext)
}

@Plugin
export default class NetworkMonitor {
  @on('kcsapi')
  onKCSAPI (evt: KCSAPIEvent) {
    // log to file
    if (evt.url.includes('/kcsapi/api_start2/getData')) {
      let apiStart2File = join(env.DATA_DIR, 'api_start2.json')
      let suffix = 1
      while (existsSync(apiStart2File = getPostfixPath(apiStart2File, suffix++))) { }
      writeFileAsync(apiStart2File, JSON.stringify(evt.responseJSON, null, 2), 'utf8')
      return
    }
    console.log('===================================================')
    console.log('[%s]', evt.timestamp.toISOString())
    console.log('> %s "%s"', evt.method, evt.url)
    console.log('> params = %O', evt.params)
    if (evt.responseJSON) {
      console.log('> response (json) = %s', JSON.stringify(evt.responseJSON, null, 2))
    } else {
      console.log('> response (text) = %O', evt.responseText)
    }
    console.log('===================================================')
  }
}
