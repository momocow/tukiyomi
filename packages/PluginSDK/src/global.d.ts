///<reference path="../../../types/Plugin.d.ts" />

declare namespace NodeJS {
  interface Global {
    eventBus: NodeJS.EventEmitter
  }
}
