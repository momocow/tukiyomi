import { stat, statSync, move, moveSync, existsSync } from 'fs-extra'
import { join, parse } from 'path'

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

export async function logRotate (file: string, maxSize: number = 1000000) {
  const { size } = await stat(file)
  if (size >= maxSize) {
    await unshiftRotationByPostfix(file)
  }
}

export function logRotateSync (file: string, maxSize: number = 1000000) {
  const { size } = statSync(file)
  if (size >= maxSize) {
    unshiftRotationByPostfixSync(file)
  }
}
