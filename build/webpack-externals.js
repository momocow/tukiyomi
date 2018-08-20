const { resolve, relative } = require('path')

const SRC_DIR = resolve(__dirname, '../src')

module.exports = function (context, request, callback) {
  if (request.startsWith('.')) {
    const rel2Src = relative(SRC_DIR, resolve(context, request))
    if (rel2Src.startsWith('..')) {
      // it is an external dependency
      return callback(null, 'commonjs ' + request)
    }
  }
  callback()
}
