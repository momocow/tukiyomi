const gulp = require('gulp')

function watchRendererAndCompile (onChange) {
  return gulp.watch([
    'src/renderer/**/*'
  ], onChange)
}

function watchMainAndCompile (onChange) {
  return gulp.watch([
    'src/main/**/*'
  ], onChange)
}

module.exports = {
  watchMainAndCompile,
  watchRendererAndCompile
}
