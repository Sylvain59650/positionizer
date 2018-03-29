var babel = require("gulp-babel");
var gulp = require('gulp');
var concat = require("gulp-concat");
var clean = require('gulp-clean');
var debug = require('gulp-debug');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');


gulp.task("positionizer.min.js", () => {
  return gulp.src([
      "sources/positionizer.js"
    ])
    .pipe(concat("positionizer.min.js"))
    // .pipe(uglify())
    // .on('error', function(err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(babel({
      presets: ["es2015"],
      compact: true
    }))
    .pipe(gulp.dest("distrib"))
});

gulp.task('watch:positionizer.min.js', function() {
  watch("./sources/positionizer.js", function() {
    gulp.run('positionizer.min.js');
  });
});

gulp.task('default', ['positionizer.min.js']);

gulp.task('tests', ['positionizer.min.js']);


gulp.task('all', ['default']);

gulp.task("watch", ["watch:positionizer.min.js"]);