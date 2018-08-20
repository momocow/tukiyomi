// const nodeExt = require('webpack-node-externals')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const { resolve } = require('path')

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  target: 'electron-renderer',
  devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : undefined,
  entry: {
    index: './src/view/index.ts',
    app: './src/main/app.ts'
  },
  // externals: [
  //   nodeExt()
  // ],
  output: {
    path: resolve(__dirname, '../compiled'),
    filename: '[name].js'
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 2,
      maxAsyncRequests: 2
    }
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
      options: { appendTsSuffixTo: [/\.vue$/] }
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
