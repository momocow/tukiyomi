import { serviceSync } from './ipc'

const env = <TukiyomiService.EnvResult> serviceSync('env')

export const {
  IS_DEV,
  IS_RELEASE,
  IS_WIN32,
  START_FROM_NPM,
  RUN_IN_REPO,
  RELEASE,
  ROOT_DIR,
  ASAR_PATH,
  ASSETS_DIR,
  CONFIGS_DIR,
  DATA_DIR,
  LOGS_DIR,
  MODULE_DIR,
  PLUGINS_DIR,
  STATIC_DIR
} = env