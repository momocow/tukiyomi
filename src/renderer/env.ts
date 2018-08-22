import { serviceSync } from './ipc'

const { isDev, isRelease, release } = <TukiyomiService.EnvResult> serviceSync('env')

export const IS_DEV = isDev
export const IS_RELEASE = isRelease
export const RELEASE = release
