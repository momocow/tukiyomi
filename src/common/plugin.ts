export function normalizePluginName (name: string): string {
  if (name.startsWith('@tukiyomi/plugin-')) {
    return name.substr(17)
  } else if (name.startsWith('tukiyomi-plugin-')) {
    return name.substr(16)
  }
  return name
}
