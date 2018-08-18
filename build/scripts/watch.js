const gulp = require('gulp')

function watchAndCompile (onChange) {
  return gulp.watch([
    'src/**/*'
  ], onChange)
}

module.exports = {
  watchAndCompile
}
