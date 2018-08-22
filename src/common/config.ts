export const MAIN_LOGGER_NAME     = 'core:main'
export const RENDERER_LOGGER_NAME = 'core:renderer'

export const LOG_ENTRY_TPL = '[{time}][{process}][{level}][{name}] {message}'

/**
 * Max number of log entries to keep in the memory
 */
export const MAX_LOGGING_BUF_LEN = 500
export const MAX_LOGFILE_SIZE = 1000000 // bytes

export const SENTRY_DSN =   'https://546035bef60748d3840cbe99b7fb955f@sentry.io/1265800'
export const KANCOLLE_URL = 'https://www.dmm.com/my/-/login/=/path=Sg9VTQFXDFdnFh5TUlgFWA0JUxk_'

export const LOG_TRANSITION_START = '================ Start { stage: %s } ================'
export const LOG_TRANSITION_END =   '================ End   { stage: %s } ================'