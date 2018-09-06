///<reference path="../../../types/Plugin.d.ts" />

declare module NodeJS {
  interface Global {
    config: NodeJS.EventEmitter & {
      get<T> (key: string, defaultVal?: T): T
      set (key: string, value: any): void
    }

    i18n: NodeJS.EventEmitter & {
      get<T> (key: string, defaultVal?: T): T
    }

    env: TukiYomi.Env

    canvas: HTMLCanvasElement
  }
}
