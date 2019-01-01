const gulp = require('gulp');
const eslint = require('gulp-eslint');
const teamcityFormater = require('eslint-teamcity');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babel = require('babelify');

const IS_PRODUCTION = process.env.TEAMCITY_VERSION || process.env.PRODUCTION;

gulp.task('lint', function () {
    return gulp.src(['src/**/*.js', 'spec/**/*.js'])
        .pipe(eslint())
        .pipe(process.env.TEAMCITY_VERSION != null ? eslint.format(teamcityFormater) : eslint.format())
        .pipe(eslint.failAfterError());
});

function compile(isWatching) {
    const bundler = watchify(browserify('./index.js', { debug: true, standalone: 'FetchcoreSDK' }).transform(babel));
    function rebundle() {
        bundler.bundle()
            .on('error', function (err) {
                console.error(err);
                this.emit('end');
            })
            .pipe(source('dist.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(IS_PRODUCTION ? uglify() : gutil.noop())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist'));
    }

    if (isWatching) {
        bundler.on('update', function () {
            console.log('---> Bundling...');
            rebundle();
        });
    }

    rebundle();
}

function watch() {
    return compile(true);
}

gulp.task('build', function () { return compile(); });
gulp.task('watch', function () { return watch(); });
gulp.task('default', ['watch']);
