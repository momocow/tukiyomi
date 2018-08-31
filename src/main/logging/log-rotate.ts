import { resolve } from 'path'
import { app } from 'electron'
import { stat, statSync, move, moveSync, existsSync } from 'fs-extra'
import { format, parse } from 'path'

import { MAX_LOGFILE_SIZE } from '../../common/config'

function getPostfixPath (absPath: string, postfix: number) {
  const pathObj = parse(absPath)
  if (postfix > 1) {
    const prevPostfix = '.' + (postfix - 1)
    pathObj.name = pathObj.name.endsWith(prevPostfix)
      ? pathObj.name.substr(0, pathObj.name.length - prevPostfix.length)
        : pathObj.name
  }
  pathObj.name += '.' + postfix
  return format(pathObj)
}

async function unshiftRotationByPostfix (absPath: string, postfix: number = 1) {
  const newPath = getPostfixPath(absPath, postfix)
  if (existsSync(newPath)) {
    await unshiftRotationByPostfix(newPath, postfix + 1)
  }
  await move(absPath, newPath)
}

function unshiftRotationByPostfixSync (absPath: string, postfix: number = 1) {
  const newPath = getPostfixPath(absPath, postfix)
  if (existsSync(newPath)) {
    unshiftRotationByPostfixSync(newPath, postfix + 1)
  }
  moveSync(absPath, newPath)
}

export async function logRotate (file: string) {
  console.log('[%s] Log rotating: start (%s)', new Date().toISOString(), file)
  const absPath = resolve(app.getPath('logs'), file)
  const { size } = await stat(absPath)
  if (size >= MAX_LOGFILE_SIZE) {
    await unshiftRotationByPostfix(absPath)
  }
}

export function logRotateSync (file: string) {
  console.log('[%s] Log rotating: start (%s)', new Date().toISOString(), file)
  const absPath = resolve(app.getPath('logs'), file)
  const { size } = statSync(absPath)
  if (size >= MAX_LOGFILE_SIZE) {
    unshiftRotationByPostfixSync(absPath)
  }
}
