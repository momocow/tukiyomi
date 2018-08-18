const gulp = require('gulp')
const mri = require('mri')

global.ROOT_DIR = __dirname

const ARGS = mri(process.argv.slice(2), {
  alias: {
    win: 'w',
    linux: 'l'
  },
  boolean: [
    'win',
    'linux'
  ]
})

const build = require('./build/scripts/build')
const {
  initCompile,
  // installDeps,
  // dedupe,
  composeEssentials,
  compileScripts
} = require('./build/scripts/compile')
const {
  watchAndCompile
} = require('./build/scripts/watch')

gulp.task('compile:script', compileScripts)

gulp.task('compile',
  gulp.series(
    initCompile,
    gulp.parallel(
      // gulp.series(installDeps, dedupe),
      composeEssentials,
      'compile:script'
    )
  )
)

gulp.task('build', function initBuild () {
  return build(ARGS, process.env.TRAVIS)
})

gulp.task('watch', function initWatch () {
  return watchAndCompile(gulp.parallel('compile:script', composeEssentials))
})
