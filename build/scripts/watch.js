const gulp = require('gulp')

function watchViewsAndCompile (onChange) {
  return gulp.watch([
    'views/**/*'
  ], onChange)
}

function watchSrcAndCompile (onChange) {
  return gulp.watch([
    'src/**/*'
  ], onChange)
}

module.exports = {
  watchSrcAndCompile,
  watchViewsAndCompile
}
