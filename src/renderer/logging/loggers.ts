import Logger from '../utils/Logger'

import { IS_DEV } from '../env'

import { RENDERER_LOGGER_NAME } from '../../common/config'

export const mainLogger = new Logger(RENDERER_LOGGER_NAME)
mainLogger.setLevel(IS_DEV ? 'VERBOSE' : 'WARN')
