export const APP_LOGGER_NAME     = 'core:main'
export const RENDERER_LOGGER_NAME = 'core:renderer'
export const PROXY_LOGGER_NAME = 'core:proxy'
export const STREAM_LOGGER_NAME = 'core:stream'

export const LOG_ENTRY_TPL = '[{time}][{process}][{level}][{name}] {message}'

/**
 * Max number of log entries to keep in the memory
 */
export const MAX_LOGGING_BUF_LEN = 500
export const MAX_LOGFILE_SIZE = 10000000 // bytes

export const SENTRY_DSN =   'https://546035bef60748d3840cbe99b7fb955f@sentry.io/1265800'
export const KANCOLLE_URL = 'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854'
export const DMM_HOSTNAME = 'www.dmm.com'
export const GUEST_URL_WHITELIST = [
  'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854',
  'https://www.dmm.com/my/-/login/=/path=Sg9VTQFXDFcXFl5bWlcKGExKUVdUXgFNEU0KSVMVR28MBQ0BUwJZBww_',
  'https://www.dmm.com/my/-/redirect/=/rurl=DRVESVwZTkVPEh9cXltIVA4IGVhVTQNYDwcYFV0GXlEJTh0WAVcFVV0RQhcOGQdHETpfUg0BUQ1aVwM_'
]
export const GAME_RESOLUTION_WIDTH = 1200
export const GAME_RESOLUTION_HEIGHT = 720

export const LOG_TRANSITION_START = '================ Start { stage: %s } ================'
export const LOG_TRANSITION_END =   '================ End   { stage: %s } ================'