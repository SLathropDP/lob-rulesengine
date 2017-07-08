
const gulp = require('gulp');
const path = require('path');

const config = {
  dest: "lib",
  src: "src"
};

require('./gulp/clean')(gulp, config.dest);
require('./gulp/build')(gulp, config.src, config.dest);

gulp.task('typescript', () => {
  return gulp.src(path.join(config.src, '**', '*.d.ts'))
      .pipe(gulp.dest(config.dest));
});

gulp.task('default', ['clean', 'build', 'typescript']);
