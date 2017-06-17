
const gulp = require('gulp');

const config = {
  dest: "lib",
  src: "src"
};

require('./gulp/clean')(gulp, config.dest);
require('./gulp/build')(gulp, config.src, config.dest);

gulp.task('default', ['clean', 'build']);
