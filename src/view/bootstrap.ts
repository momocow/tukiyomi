import { ipcRenderer } from 'electron'

import IService from './services/IService'

import refs from '../common/references'

import Logger from './services/Logger'
import Config from './services/Config'

const services: IService[] = []

const logger = new Logger('TukiYomi:view')
services.push(logger)
console.log(refs)
refs
  .set('logger', logger, { readonly: true })
  .namespace('config')
    .set('core', new Config('core'), { readonly: true })
    .set('', new Config('TukiYomi:view'), { readonly: true })

// Register services
services.forEach(svc => {
  svc.init(ipcRenderer)
})
