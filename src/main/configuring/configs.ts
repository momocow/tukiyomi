import { join } from 'path'

import Config from './Config'
import { ASSETS_DIR } from '../env'

export const configMap: Map<string, Config<any>> = new Map()

export const appConfig = getConfig<TukiYomi.AppConfig>(
  'app', join(ASSETS_DIR, 'configs', 'app.config.default.json'))

export function getConfig<T> (name: string, defaultJson?: string | T): Config<T> {
  let config = configMap.get(name)
  if (!config) {
    const filename: string = name.endsWith('.config') ? name : (name + '.config')
    config = new Config<T>(filename, defaultJson)
    configMap.set(name, config)
  }

  return config
}
