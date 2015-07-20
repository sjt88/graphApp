var gulp = require('gulp'),
  connect = require('gulp-connect'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish');

var paths = {
  html: ['./src/*.html', './src/components/*.html'],
  js: ['./*.js', './src/*.js', './src/components/*.js']
};

gulp.task('connect', function() {
  connect.server({
    root: './src/',
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src(paths.html)
    .pipe(connect.reload());
});
 
gulp.task('watch', function () {
  gulp.watch(paths.js, ['lint']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('lint', function() {
  gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(connect.reload());
});

gulp.task('default', ['lint', 'connect', 'watch']);