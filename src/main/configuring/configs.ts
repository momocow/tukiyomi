import Config from './Config'

const DEFAULT_APP_CONFIG: TukiYomi.AppConfig = require('./defaults/default-app.config.json')

export const configMap: Map<string, Config<any>> = new Map()

export const appConfig = new Config<TukiYomi.AppConfig>('app.config', DEFAULT_APP_CONFIG)
configMap.set('app', appConfig)
