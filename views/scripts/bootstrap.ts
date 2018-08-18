import { ipcRenderer } from 'electron'

import IService from './services/IService'
import { logger } from './globals'


const services: IService[] = []

services.push(logger)

// Register services
services.forEach(svc => {
  svc.init(ipcRenderer)
})
