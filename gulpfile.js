const gulp = require('gulp')
const mri = require('mri')

global.ROOT_DIR = __dirname

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
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
  composeEssentials,
  compileScripts,
  compileViews
} = require('./build/scripts/compile')
const {
  watchSrcAndCompile,
  watchViewsAndCompile
} = require('./build/scripts/watch')

gulp.task('compile:view', compileViews)
gulp.task('compile:script', compileScripts)

gulp.task('compile',
  gulp.series(
    initCompile,
    gulp.parallel(
      syncPkgJson,
      composeEssentials,
      'compile:view',
      'compile:script'
    )
  )
)

gulp.task('build', function initBuild () {
  return build(ARGS, process.env.TRAVIS)
})

gulp.task('watch', function initWatch () {
  watchViewsAndCompile(gulp.series('compile:view'))
  return watchSrcAndCompile(gulp.parallel('compile:script', composeEssentials))
})
