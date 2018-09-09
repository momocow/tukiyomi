///<reference path="./Plugin.d.ts" />
declare const __static: string

declare namespace TukiYomi {
  interface AppConfig {
    misc: {
      setDMMCookie: boolean,
      disableDMMDialog: boolean
      entranceURL: string
    },
    plugin: {
      registry: string
    }
  }

  interface PluginWrapper {
    meta?: TukiYomi.Plugin.PluginOptions
    emit (event: string, ...args: any[]): this
  }
}
declare namespace TukiyomiService {
  export interface ServiceMeta {
    guid: string
  }

  export interface ServiceResponsePacket {
    data: any
  }

  export interface AsyncServiceResponsePacket extends ServiceResponsePacket {
    meta: ServiceMeta
  }

  export interface ServiceRequestPacket {
    args: any[]
  }

  export interface AsyncServiceRequestPacket extends ServiceRequestPacket {
    meta: ServiceMeta
  }

  export interface EnvResult {
    START_FROM_NPM: boolean,
    RUN_IN_REPO: boolean,
    IS_WIN32: boolean,
    IS_DEV: boolean
    IS_RELEASE: boolean
    RELEASE: string,
    ROOT_DIR: string,
    ASSETS_DIR: string,
    PLUGINS_DIR: string,
    STATIC_DIR: string,
    LOGS_DIR: string,
    CONFIGS_DIR: string,
    DATA_DIR: string,
    MODULE_DIR: string,
    ASAR_PATH: string
  }

  export interface GameViewInfo {
    id: number
  }
}
