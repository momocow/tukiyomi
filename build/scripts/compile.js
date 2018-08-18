const gulp = require('gulp')
const fs = require('fs-extra')
const path = require('path')
const srcmap = require('gulp-sourcemaps')
const ts = require('gulp-typescript')
const minify = require('gulp-uglify')
const { exec } = require('child_process')
const Bundler = require('parcel-bundler')

const COMPILE_DIR = path.join(global.ROOT_DIR, 'compiled')
const SRC_DIR = path.join(global.ROOT_DIR, 'src')
const COMPILED_VIEWS_DIR = path.join(COMPILE_DIR, 'views')
const VIEWS_ENTRY = path.join(global.ROOT_DIR, 'views', 'index.html')

const SHOULD_SYNC = [
  'dependencies'
]

const RESOURCES = [
  'assets/icons'
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
  return gulp.src([`${SRC_DIR}/**/*.ts`], { base: SRC_DIR })
    .pipe(srcmap.init())
    .pipe(ts(opt))
    .pipe(minify())
    .pipe(srcmap.write())
    .pipe(gulp.dest(COMPILE_DIR))
}

function composeEssentials () {
  const promises = RESOURCES
    .map(p => {
      return fs.copy(path.resolve(global.ROOT_DIR, p), path.resolve(COMPILE_DIR, p))
    })
  return Promise.all(promises)
}

function compileViews () {
  const bundler = new Bundler(VIEWS_ENTRY, {
    outDir: COMPILED_VIEWS_DIR,
    watch: false,
    minify: true,
    sourceMaps: true,
    target: 'electron',
    publicUrl: './'
  })

  return bundler.bundle()
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
