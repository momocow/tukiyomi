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
    IS_DEV: boolean
    IS_RELEASE: boolean
    RELEASE: string,
    ASSETS_DIR: string
  }

  export interface GameViewInfo {
    id: number
  }
}