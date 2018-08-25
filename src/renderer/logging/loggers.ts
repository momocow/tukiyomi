import Logger from '../services/Logger'

import { IS_DEV } from '../env'

import { RENDERER_LOGGER_NAME } from '../../common/config'

export const appLogger = new Logger(RENDERER_LOGGER_NAME)
appLogger.setLevel(IS_DEV ? 'VERBOSE' : 'WARN')
