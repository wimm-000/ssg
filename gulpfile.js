var gulp = require('gulp')
var browserSync = require('browser-sync')
var sass = require('gulp-sass')
var sourcemaps = require('gulp-sourcemaps')
var cleanCSS = require('gulp-clean-css')
var concat = require('gulp-concat')
var autoprefixer = require('gulp-autoprefixer')
var source = require('vinyl-source-stream')
var reload = browserSync.reload
var imagemin = require('gulp-imagemin')
var pngquant = require('imagemin-pngquant')
var runSequence = require('run-sequence')
var pug = require('gulp-pug')
var babel = require('gulp-babel')
var browserify = require('browserify')
var babelify = require('babelify')
var uglify = require('gulp-uglify')
var replace = require('gulp-replace')
var beeper = require('beeper')
var notify = require('gulp-notify')
var plumber = require('gulp-plumber')
var log = require('fancy-log');

var urlfiles = './src/'
var deployUrl = './build/'

var main = urlfiles + 'js/main.js'
var jsMode = 'js-browserify-babel' // js-browserify-babel, js-pack, js-pack-babel

var onError = function (err) { // Custom error msg with beep sound and text color
  notify.onError({
    title: 'Gulp error in ' + err.plugin,
    message: err.toString()
  })(err)
  beeper(3)
  this.emit('end')
  log.error(err)
}

/**
 * Version sass en lugar de compass
 */
gulp.task('sass', function () {
  gulp.src(urlfiles + 'sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(deployUrl + 'css'))
    .pipe(browserSync.stream())
})

/**
 * Carga los datos del _Data.json y tranpila los templates en pug
*/
gulp.task('templates-pug', function () {
  return gulp.src(urlfiles + './*.pug')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(deployUrl))
    .on('end', function () {
      browserSync.reload()
    })
})

/**
 * Concatena todos los js
 */
gulp.task('js-pack', function () {
  return gulp.src(urlfiles + 'js/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest(deployUrl + 'js'))
})

/**
 * Junta todos los js y los transpila
 */
gulp.task('js-pack-babel', function () {
  return gulp.src(urlfiles + 'js/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(deployUrl + 'js'))
})

gulp.task('js-watch', [jsMode], reload)

/**
 * Arrancamos el proyecto con el javascript es6 y browswrify & babel
 */
gulp.task('js-browserify-babel', function () {
  browserify({ entries: main, debug: true })
    .transform(babelify, {
      presets: ['env']
    })
    .bundle()
    .on('error', function (err) { console.error(err); this.emit('end') })
    .pipe(source('main.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(deployUrl + 'js'))
    .on('end', function () {
      browserSync.reload()
    })
})

/**
 * Optimizamos las imagens
 */
gulp.task('images-optimize', function () {
  return gulp.src(urlfiles + 'images/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(deployUrl + 'images/'))
})

/**
 * Copiamos pdf si existen
 */
gulp.task('copy-static-files', function () {
  gulp.src(urlfiles + 'pdf/**/*')
    .pipe(gulp.dest(deployUrl + 'pdf'))
  gulp.src(urlfiles + 'fonts/**/*')
    .pipe(gulp.dest(deployUrl + 'fonts'))
  gulp.src(urlfiles + 'videos/**/*')
    .pipe(gulp.dest(deployUrl + 'videos'))
  gulp.src(urlfiles + 'txt/**/*')
    .pipe(gulp.dest(deployUrl + 'txt'))
})

/**
 * Comprime y minifica js
 */
gulp.task('compress', function () {
  gulp.src(deployUrl + 'js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(deployUrl + '/js/min'))
})

/**
 * Concatenado básico para js
 */
gulp.task('js-c', function () {
  gulp.src(urlfiles + 'js/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest(deployUrl + 'js'))
})

/**
 * Cambiamos el nombre de la url de js para que carge la version minificada
 */
gulp.task('rename-paths-html', function () {
  gulp.src([deployUrl + '**/*.html'])
    .pipe(replace('js/main.js', 'js/min/main.js'))
    .pipe(gulp.dest(deployUrl))
})

// TAREAS PRINCIPALES DE LA APP.

/**
 * Crea version comprimidas y optimizadas del proyecto
 */
gulp.task('deploy', function (callback) {
  runSequence(['templates-pug'], [jsMode], ['copy-static-files'], ['sass'], ['images-optimize'], ['compress'], ['rename-paths-html'], callback)
})

/* Arranca servidor y compila sass para el desarrollo */
gulp.task('default', ['templates-pug', 'images-optimize', 'sass', jsMode, 'copy-static-files'], function () {
  browserSync.init({
    server: {
      baseDir: deployUrl
    }
  })

  gulp.watch(urlfiles + 'sass/**/*.scss', ['sass'])
  gulp.watch(urlfiles + 'js/**/*.js', ['js-watch'])
  gulp.watch('**/*.pug', { cwd: urlfiles }, ['templates-pug'])
  gulp.watch('images/**/*.{png,jpg,jpeg,gif,svg}', { cwd: urlfiles }, ['images-optimize'])
})
