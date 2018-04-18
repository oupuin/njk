(function () {
    'use strict';

    var gulp = require('gulp');
    var args = require('yargs').argv;
    var config = require('./gulp.config')();
    var inputTemplates = './app/templates/*.html';
    var browserSync = require('browser-sync').create();
    var nunjucksRender = require('gulp-nunjucks-render');
    var del = require('del');
    var runSequence = require('run-sequence');
    var $ = require('gulp-load-plugins')({
        lazy: true
    });

    gulp.task('help', $.taskListing);

    gulp.task('vet:js', function () {
        log('Analyzing JavaScript with JSHint and JSCS...');

        return gulp
            .src(config.allDevJS)
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jscs())
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {
                verbose: true
            }))
            .pipe($.jshint.reporter('fail'));
    });

    gulp.task('sass-lint', function () {
        return gulp
            .src(config.allDevSass)
            .pipe($.sassLint())
            .pipe($.sassLint.format())
            .pipe($.sassLint.failOnError());
    });

    gulp.task('sass', ['sass-lint'], function () {
        log('Compiling SASS...');

        return gulp
            .src(config.masterSass)
            .pipe($.sass())
            .pipe(gulp.dest(config.sassCssDest))
            .pipe(browserSync.reload({
                stream: true
            }));
    });

    gulp.task('watch', ['browserSync', 'sass'], function () {
        log('Watch for file changes...');

        gulp.watch(config.allDevSass, ['sass']);
        gulp.watch(config.allDevHtml, browserSync.reload);
        gulp.watch(config.allDevJS, browserSync.reload);
    });

    gulp.task('browserSync', function () {
        log('Starting BrowserSync...');

        browserSync.init({
            server: {
                baseDir: 'app'
            }
        });
    });

    // -----------------------------------------------------------------------------
    // Templating
    // -----------------------------------------------------------------------------

    gulp.task('nunjucks', function () {
        nunjucksRender.nunjucks.configure(['./app/templates/']);
        // Gets .html and .nunjucks files in pages
        return gulp.src(inputTemplates)
            // Renders template with nunjucks
            .pipe(nunjucksRender())
            // output files in dist folder
            .pipe(gulp.dest('./app/'));
    });


    gulp.task('optimize', ['sass'], function () {
        return gulp
            .src(config.allDevHtml)
            .pipe($.useref())
            .pipe($.if('*.js', $.uglify()))
            .pipe($.if('*.css', $.cssnano()))
            .pipe(gulp.dest('dist'));
    });

    gulp.task('images', function () {
        return gulp
            .src(config.allDevImages)
            .pipe($.cache($.imagemin([
                $.imagemin.gifsicle({
                    interlaced: true
                }),
                $.imagemin.jpegtran({
                    progressive: true
                }),
                $.imagemin.optipng({
                    optimizationLevel: 5
                }),
                $.imagemin.svgo({
                    plugins: [{
                        removeViewBox: true
                    }]
                })
            ])))
            .pipe(gulp.dest(config.buildImagesDest));
    });

    gulp.task('fonts', function () {
        return gulp
            .src(config.allDevFonts)
            .pipe(gulp.dest(config.buildFontsDest));
    });

    gulp.task('clean:dist', function () {
        // return del.sync('dist');
    });

    gulp.task('cache:clear', function (callback) {
        return $.cache.clearAll(callback);
    });

    gulp.task('build', function (callback) {
        log("Building project...");

        runSequence('vet:js', 'clean:dist', 'nunjucks', ['optimize', 'images', 'fonts'], callback);
    });

    gulp.task('default', function (callback) {
        runSequence(['sass', 'nunjucks', 'browserSync', 'watch'], callback);
    });

    /////////

    function log(msg) {
        if (typeof (msg) === 'object') {
            for (var item in msg) {
                if (msg.hasOwnProperty(item)) {
                    $.util.log($.util.colors.blue(msg[item]));
                }
            }
        } else {
            $.util.log($.util.colors.blue(msg));
        }
    }

})();