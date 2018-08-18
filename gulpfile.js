const gulp = require('gulp')
const mri = require('mri')

global.ROOT_DIR = __dirname

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

gulp.task('compile:views', compileViews)
gulp.task('compile:script', compileScripts)

gulp.task('compile',
  gulp.series(
    initCompile,
    // for not breaking Parcel's pretty console output ;)
    'compile:views',
    gulp.parallel(
      syncPkgJson,
      composeEssentials,
      'compile:script'
    )
  )
)

gulp.task('build', function initBuild () {
  return build(ARGS, process.env.TRAVIS)
})

gulp.task('watch', function initWatch () {
  watchViewsAndCompile(gulp.series('compile:views'))
  return watchSrcAndCompile(gulp.parallel('compile:script', composeEssentials))
})
