const builder = require('electron-builder')
const { join } = require('path')

const BUILD_KIT_ROOT = join(__dirname, '..')

module.exports = function ({ win, linux }, travis) {
  return builder.build({
    publish: travis ? 'always' : 'never',
    config: travis ? join(BUILD_KIT_ROOT, 'travis-build.toml')
      : join(BUILD_KIT_ROOT, 'local-build.toml'),
    win: win ? [] : undefined,
    linux: linux ? [] : undefined
  })
}
