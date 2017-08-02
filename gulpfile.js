var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var eslint = require('gulp-eslint');
var gulp = require('gulp');
var header = require('gulp-header');
// var path = require('path');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gulpConcat = require('gulp-concat');
var runSequence = require('run-sequence');
var argv = require('yargs').argv;
var git = require('gulp-git');

var buildSources = ['lib/**/*.js'];
var lintSources = buildSources.concat([
    'gulpfile.js',
    '/**/*.js',
    'dist/**/abMain-0.2.js',
    'dist/**/selectorQuery.js',
]);

var bundler = browserify({
    entries: ['./lib/index.js'],
    standalone: '_nv_op',
    debug: true,
});

gulp.task('default', ['build']);

gulp.task('build', function() {
    runSequence('lint', 'init', 'concat', 'copy');
});

gulp.task('copy', function() {
    gulp.src('./temp/nvAbTest.js.map').pipe(gulp.dest('./dist/'));
});

gulp.task('init', function() {
    var license = `/*!
* UPDATES AND DOCS AT: https://www.notifyvisitors.com/brand/documentation/webJsIntegrationCode
*
* @license Copyright (c), NotifyVisitors. All rights reserved.
* This work is subject to the terms at https://www.notifyvisitors.com/site/terms 
*/`;
    return bundler
        .bundle()
        .pipe(source('nvAbTest.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: false,
        }))
        .pipe(uglify({
            compress: false,
        }))
        .pipe(header(license))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./temp/'));
});

gulp.task('concat', function() {
    return gulp.src(['./temp/nvAbTest.js', './temp/call.js'])
        .pipe(gulpConcat('nvAbTest.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('lint', function() {
    return gulp.src(lintSources)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('add', function() {
    console.log('adding...');
    return gulp.src('.')
        .pipe(git.add());
});

gulp.task('commit', function() {
    console.log('commiting');
    if (argv.m) {
        return gulp.src('.')
            .pipe(git.commit(argv.m));
    }
});

gulp.task('push', function() {
    console.log('pushing...');
    if (argv.o) {
        git.push(argv.o, 'master', function(err) {
            if (err) throw err;
        });
    }
});

gulp.task('deploy', function() {
    runSequence('build', 'add', 'commit', 'push');
});
