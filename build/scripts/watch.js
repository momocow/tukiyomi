const gulp = require('gulp')
// const { join, relative } = require('path')

function watchAndCompile (onChange) {
  return gulp.watch([
    'src/**/*'
  ], onChange)
}

module.exports = {
  watchAndCompile
}
