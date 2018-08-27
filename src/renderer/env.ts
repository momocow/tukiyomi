import { serviceSync } from './ipc'

export const {
  IS_DEV,
  IS_RELEASE,
  RELEASE,
  ASSETS_DIR
} = <TukiyomiService.EnvResult> serviceSync('env')
