import Config from './Config'
import { appLogger } from '../logging/loggers'

import { publish } from '../ipc'

const DEFAULT_APP_CONFIG: TukiYomi.AppConfig = require('./defaults/default-app.config.json')

export const configMap: Map<string, Config<any>> = new Map()

export const appConfig = new Config<TukiYomi.AppConfig>('app.config', DEFAULT_APP_CONFIG)
configMap.set('app', appConfig)

for (const [nsp, config] of configMap.entries()) {
  config
    .on('change', function (key: string, newVal: any, oldVal: any) {
      publish(`config.change[${nsp}]`, key, newVal, oldVal)
    })
    .on('error', function (err) {
      appLogger.warn('Failed to load the config "%s".', nsp)
      appLogger.warn(err)
    })
  config.load()
}


