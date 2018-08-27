const gulp = require('gulp')
const mri = require('mri')

global.ROOT_DIR = __dirname

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
  process.env.production = false
} else {
  process.env.production = true
}

const ARGS = mri(process.argv.slice(2), {
  alias: {
    win: 'w',
    linux: 'l'
  }
})

const build = require('./build/scripts/build')
const {
  initCompile,
  syncPkgJson,
  compileMain,
  compileRenderer
} = require('./build/scripts/compile')
const {
  watchMainAndCompile,
  watchRendererAndCompile
} = require('./build/scripts/watch')

gulp.task('compile:main', compileMain)
gulp.task('compile:renderer', compileRenderer)

gulp.task('compile',
  gulp.series(
    initCompile,
    gulp.parallel(
      syncPkgJson,
      'compile:main',
      'compile:renderer'
    )
  )
)

gulp.task('build', function initBuild () {
  return build(ARGS, process.env.TRAVIS)
})

gulp.task('watch', function initWatch () {
  watchRendererAndCompile(gulp.series('compile:renderer'))
  return watchMainAndCompile(gulp.series('compile:script'))
})
