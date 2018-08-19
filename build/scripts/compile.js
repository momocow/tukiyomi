const gulp = require('gulp')
const fs = require('fs-extra')
const path = require('path')
const srcmap = require('gulp-sourcemaps')
const ts = require('gulp-typescript')
const minify = require('gulp-uglify-es').default
const { exec } = require('child_process')
const { promisify } = require('util')
const webpack = require('webpack')

const COMPILE_DIR = path.join(global.ROOT_DIR, 'compiled')
const SRC_DIR = path.join(global.ROOT_DIR, 'src')
const MAIN_DIR = path.join(SRC_DIR, 'main')
const COMMON_DIR = path.join(SRC_DIR, 'common')

const WEBPACK_CONF = require('../webpack.config')

const SHOULD_SYNC = [
  'dependencies'
]

const RESOURCES = [
  'assets/icons',
  {
    // resolved from {ROOT_DIR}
    from: 'src/view/index.html',
    // resolved from {COMPILE_DIR}
    to: 'view/index.html'
  }
]

// default to clean up all compiled
// Use --no-clean to disable clean up
function initCompile () {
  if (!process.argv.includes('--no-clean')) {
    fs.removeSync(COMPILE_DIR)
  }
  return fs.ensureDir(COMPILE_DIR)
}

function syncPkgJson () {
  const DEV_PKG = require(path.join(global.ROOT_DIR, 'package.json'))
  const PROD_PKG = require(path.join(global.ROOT_DIR, 'assets', 'prod-package.json'))
  SHOULD_SYNC.forEach(p => (PROD_PKG[p] = DEV_PKG[p]))
  return fs.outputJSON(path.join(COMPILE_DIR, 'package.json'), PROD_PKG, {
    spaces: 2
  })
}

function installDeps () {
  return exec(`npm ${(process.env.TRAVIS ? 'ci' : 'i')} --production`)
}

function dedupe () {
  return exec(`npm dedupe --no-package-lock`)
}

function compileScripts () {
  let opt = fs.readJSONSync('./tsconfig.json').compilerOptions
  const pipeline = gulp.src(
    [
      `${MAIN_DIR}/**/*.ts`,
      `${COMMON_DIR}/**/*.ts`
    ],
    { base: SRC_DIR }
  )
    .pipe(srcmap.init())
    .pipe(ts(opt))

  if (process.env.NODE_ENV !== 'development') {
    pipeline.pipe(minify())
  }

  return pipeline
    .pipe(srcmap.write())
    .pipe(gulp.dest(COMPILE_DIR, {
      overwrite: true
    }))
}

function composeEssentials () {
  const promises = RESOURCES
    .map(p => {
      const src = typeof p === 'string' ? p : p.from
      const dest = typeof p === 'string' ? p : p.to

      return fs.copy(path.resolve(global.ROOT_DIR, src), path.resolve(COMPILE_DIR, dest))
    })
  return Promise.all(promises)
}

function compileViews () {
  const compiler = webpack(WEBPACK_CONF)
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

module.exports = {
  initCompile,
  installDeps,
  dedupe,
  composeEssentials,
  compileScripts,
  syncPkgJson,
  compileViews
}
