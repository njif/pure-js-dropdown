'use strict';

/********************************
*********************************
			VARS
*********************************
*********************************/

var gulp = require('gulp'),
	header = require('gulp-header'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	processhtml = require('gulp-processhtml'),
	path = require('path'),
	autoprefixer = require('gulp-autoprefixer'),
	concatCss = require("gulp-concat-css"),
	minifyCss = require("gulp-minify-css"),
	less = require('gulp-less'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require("gulp-rename"),
	notify = require("gulp-notify"),
	plumber = require('gulp-plumber'),
	
	gulpif = require('gulp-if'),

	connect = require('gulp-connect'),

	pkg = require('./package.json'),

	banner = ['/**',
	' * <%= pkg.author %>',
	' * <%= pkg.name %> v<%= pkg.version %>',
	' */',
	''].join('\n');

var config = {

	css: {
		minify: true
	},
	// config.js
	js: {
		// config.js.bundles
		bundles: {
			// config.js.bundles.development
			development: {
				// config.js.bundles.development.filesArr
				filesArr: [
					'src/js/jsdropdown.js',
					'src/js/app.js',
					'src/js/main.js'
				],
				// config.js.bundles.development.dest
				dest: 'assets/js',
				// config.js.bundles.development.bundleName
				bundleName: 'app.min.js'
			}		
		}
	}
};


/********************************
*********************************
			TASKS
*********************************
*********************************/

gulp.task('connectToDevServer', connectToDevServer);

gulp.task('default', ['build', 'watch']);

gulp.task('build', ['processStyles', 'processScripts', 'processHtml']);

gulp.task('processHtml', processHtml);

gulp.task('processScripts', processJs);
gulp.task('processStyles', ['buildLess', 'processCss']); // async: first, build LESS files then process css
gulp.task('buildLess', buildLess);
gulp.task('processCss', ['buildLess'], processCss);

gulp.task('watch', watch);
gulp.task('watchHtml', watchHtml);
gulp.task('watchCss', watchCss);
gulp.task('watchLess', watchLess);
gulp.task('watchJs', watchJs);

/********************************
*********************************
			FUNCTIONS
*********************************
*********************************/

/* Helpers */

function getNotifySettings(message) {
	var date = new Date(),
		time = date.toTimeString().split(' ')[0];
	return {
		message: message +  " @ <%= options.time %>",
		onLast: true,
		templateOptions: {
			time: time
		}
	}
}

function getNotifyDetailedSettings(message) {
	var date = new Date(),
		time = date.toTimeString().split(' ')[0];
	return {
		message: message +  ": <%= file.relative %> @ <%= options.time %>",
		templateOptions: {
			time: time
		}
	}
}

/* Process something */

function processHtml() {
	gulp.src('src/index.html')
		.pipe(plumber())
		.pipe(processhtml('index.html'))
		.pipe(gulp.dest('./'))
		.pipe(notify(getNotifySettings('Processed html')))
		.pipe(connect.reload());
}

function buildLess() {
	return gulp.src('src/assets/css/main.less')
		.pipe(less())
		.pipe(gulp.dest('src/assets/css'))
		.pipe(notify(getNotifyDetailedSettings('Builded LESS')))
		.pipe(connect.reload());
}

function processCss() {
	gulp.src([
			'src/css/normalize.css',
			'src/css/jsdropdown.css',
			'src/css/common.css'
		]).pipe(plumber())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(concatCss("bundle.css"))
		.pipe(gulpif(config.css.minify, minifyCss()))
		.pipe(rename('bundle.min.css'))
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(gulp.dest('assets/css'))
		.pipe(notify(getNotifyDetailedSettings('Processed css')))
		.pipe(connect.reload());
}

function processJs() {

	// jshint for development files

	var bundles = config.js.bundles;

	gulp.src(bundles.development.filesArr).pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));

	// concat dependency and development javascript files into one bundle than
	// copy it to the destination folder and to the local server if needed.

	gulp.src(bundles.development.filesArr)
		.pipe(plumber())
		.pipe(uglify())
		.pipe(concat(bundles.development.bundleName))
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(gulp.dest(bundles.development.dest))
		.pipe(notify(getNotifyDetailedSettings('Processed js')))
		.pipe(connect.reload());

}

/* Watch tasks */

function watchHtml() {
	gulp.watch('src/assets/*.html', ['processHtml']);
}

function watchLess() {
	gulp.watch(['src/assets/css/*.less', 'src/assets/css/**/*.less', 'src/assets/css/**/**/*.less'], ['buildLess']);
}

function watchCss() {
	gulp.watch('src/assets/css/*.css', ['processCss']);
}

function watchJs() {
	gulp.watch('src/assets/js/*.js', ['processScripts']);
}

function watch() {
	gulp.run(['watchHtml', 'watchCss', 'watchJs', 'watchLess']);
}

function notifyChanges(event){
	notify(event.path+' -> '+event.type);
}

function connectToDevServer() {
	connect.server({
		root: './src',
		livereload: true
	});
};