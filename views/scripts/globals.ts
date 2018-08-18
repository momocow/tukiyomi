import Logger from './services/Logger'
import Config from './services/Config'

export const logger = new Logger('TukiYomi:view')
export const coreConf = new Config('TukiYomi:core')
export const viewConf = new Config('TukiYomi:view')
