var gulp = require('gulp');

gulp.task('build-test', function() {

    gulp.src('node_modules/qunitjs/qunit/qunit.js')
    .pipe(gulp.dest('test/js/'));

    gulp.src('node_modules/qunitjs/qunit/qunit.css')
        .pipe(gulp.dest('test/css/'));
});