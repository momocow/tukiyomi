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
    isDev: boolean
    isRelease: boolean
    release: string
  }

  export interface GameViewInfo {
    id: number
  }
}