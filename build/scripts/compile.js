const gulp = require('gulp')
const fs = require('fs-extra')
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')
const webpack = require('webpack')
const WEBPACK_MAIN_CONF = require('electron-webpack/webpack.main.config')
const WEBPACK_RENDERER_CONF = require('electron-webpack/webpack.renderer.config')

const TARGET_DIR = path.join(global.ROOT_DIR, 'dist')

const SHOULD_SYNC = {
  dependencies: function (val) {
    if (typeof val === 'object') {
      Object.keys(val)
        .forEach(k => {
          if (val[k].startsWith('file:')) {
            const abs = path.resolve(global.ROOT_DIR, val[k].substr(5))
            val[k] = 'file:' + path.relative(TARGET_DIR, abs)
          }
        })
    }
    return val
  }
}

const RESOURCES = [
  'assets/icons/*'
]

// default to clean up all compiled
// Use --no-clean to disable clean up
function initCompile () {
  if (!process.argv.includes('--no-clean')) {
    fs.removeSync(TARGET_DIR)
  }
  return fs.ensureDir(TARGET_DIR)
}

function syncPkgJson () {
  const DEV_PKG = require(path.join(global.ROOT_DIR, 'package.json'))
  const PROD_PKG = require(path.join(global.ROOT_DIR, 'assets', 'prod-package.json'))
  Object.keys(SHOULD_SYNC)
    .forEach(p => (PROD_PKG[p] = typeof SHOULD_SYNC[p] === 'function' ? SHOULD_SYNC[p](DEV_PKG[p]) : DEV_PKG[p]))

  return fs.outputJSON(path.join(TARGET_DIR, 'package.json'), PROD_PKG, {
    spaces: 2
  })
}

function installDeps () {
  return exec(`npm ${(process.env.TRAVIS ? 'ci' : 'i')} --production`)
}

function dedupe () {
  return exec(`npm dedupe --no-package-lock`)
}

function composeEssentials () {
  return gulp.src(RESOURCES, { base: '.' })
    .pipe(gulp.dest(TARGET_DIR))
}

/**
 * @param {webpack.Configuration} conf
 * @return {Promise<void>}
 */
function _runCompiler (conf) {
  const compiler = webpack(conf)
  return promisify(compiler.run).call(compiler)
    .catch(function (err) {
      console.error(err.stack || err)
      if (err.details) {
        console.error(err.details)
      }
    })
    .then(function (stats) {
      console.info(stats.toString({
        chunks: false,
        colors: true
      }))

      if (stats.hasErrors()) {
        throw new Error('Error occured during Webpack compilation.')
      }

      if (
        (process.argv.includes('--strict') || process.env.NODE_ENV === 'production') &&
        stats.hasWarnings()) {
        throw new Error('There are still Webpack compilation warnings.')
      }
    })
}

async function compileMain () {
  const mainConf = await WEBPACK_MAIN_CONF(process.env)
  return _runCompiler(mainConf)
}

async function compileRenderer () {
  const rendererConf = await WEBPACK_RENDERER_CONF(process.env)
  return _runCompiler(rendererConf)
}

module.exports = {
  initCompile,
  installDeps,
  dedupe,
  composeEssentials,
  compileMain,
  compileRenderer,
  syncPkgJson
}
