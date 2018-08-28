///<reference path="./PluginLogger.d.ts" />

function normalizePluginName (name: string): string {
  if (name.startsWith('@tukiyomi/plugin-')) {
    return name.substr(17)
  } else if (name.startsWith('tukiyomi-plugin-')) {
    return name.substr(16)
  }
  return name
}

export default abstract class PluginBase {
  public readonly name: string
  private readonly logger: Logger

  constructor (name: string) {
    this.name = normalizePluginName(name)
    this.logger = global.toolkit.getLogger(this.name)
  }

  abstract init (): void
}
