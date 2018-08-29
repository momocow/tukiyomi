///<reference path="./PluginLogger.d.ts" />

function normalizePluginName (name: string): string {
  if (name.startsWith('@tukiyomi/plugin-')) {
    return name.substr(17)
  } else if (name.startsWith('tukiyomi-plugin-')) {
    return name.substr(16)
  }
  return name
}

export function Plugin (name: string): ClassDecorator {
  return function (target, propKey) {
    
  }
}

export abstract class PluginBase {
  public readonly name: string
  private readonly eventBus: NodeJS.EventEmitter = global.toolkit.getEventBus()
  private readonly logger: Logger

  constructor (name: string) {
    this.name = normalizePluginName(name)
    this.logger = global.toolkit.getLogger(this.name)
  }

  // life cycle methods
  abstract init (): void
  abstract destroy (): void
}
