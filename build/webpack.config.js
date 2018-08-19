const nodeExt = require('webpack-node-externals')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const { resolve, relative } = require('path')

const VIEW_DIR = resolve(__dirname, '../src/view')

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  target: 'electron-renderer',
  devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : undefined,
  entry: [
    './src/view/index',
    './src/view/bootstrap.ts'
  ],
  externals: [
    nodeExt(),
    // chroot to view directory
    function (context, request, callback) {
      if (request.startsWith('.')) {
        const rel = relative(VIEW_DIR, resolve(context, request))
        if (rel.startsWith('..')) {
          return callback(null, 'commonjs ' + request)
        }
      }
      callback()
    }
  ],
  output: {
    path: resolve(__dirname, '../compiled/view'),
    filename: 'main.js'
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }, {
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.(png|jpg|gif)$/i,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }
      ]
    }, {
      test: /\.(html)$/,
      use: {
        loader: 'html-loader',
        options: {
          attrs: [':data-src']
        }
      }
    }]
  },
  resolve: {
    extensions: [
      '.ts',
      '.js'
    ]
  }
}
