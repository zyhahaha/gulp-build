var gulp = require('gulp'); // gulp主组件
var htmlmin = require('gulp-htmlmin'); // html压缩组件
var jshint = require('gulp-jshint'); // js语法检查
var concat = require('gulp-concat'); // 多个文件合并为一个
var minifyCss = require('gulp-minify-css'); // 压缩CSS为一行；
var uglify = require('gulp-uglify'); // js文件压缩
var rev = require('gulp-rev'); // 对文件名加MD5后缀
var revCollector = require('gulp-rev-collector'); // 路径替换
var gulpRemoveHtml = require('gulp-remove-html'); // 标签清除，参考：https://www.npmjs.com/package/gulp-remove-html
var removeEmptyLines = require('gulp-remove-empty-lines'); // 清除空白行，参考：https://www.npmjs.com/package/gulp-remove-empty-lines
var replace = require('gulp-replace'); // 文件名替换，参考：https://www.npmjs.com/package/gulp-replace
var gulpSequence = require('gulp-sequence'); // 同步执行，参考：https://github.com/teambition/gulp-sequence
var clean = require('gulp-clean'); // 清除文件插件，参考：https://github.com/teambition/gulp-clean

var buildBasePath = 'build/'; // 构建输出的目录

// 删除Build文件
gulp.task('clean:Build', function(cb) {
  return gulp.src(buildBasePath, { read: false }).pipe(clean());
});

// 复制文件夹
gulp.task('copy', function() {
  return gulp.src('plugins/**/*').pipe(gulp.dest(buildBasePath + 'plugins'));
});

// 合并js,css文件之后压缩代码
//jsmd5，压缩后并用md5进行命名，下面使用revCollector进行路径替换
gulp.task('minifyjsmd5', function() {
  return gulp
    .src('src/js/**/*.js')
    //  .pipe(concat('build.min.js')) // 压缩后的js -- flag 合并js
    .pipe(uglify()) // 压缩js到一行
    .pipe(rev()) // 文件名加MD5后缀
    .pipe(gulp.dest(buildBasePath + 'js')) // 输出到js目录
    .pipe(rev.manifest('rev-js-manifest.json')) // //生成一个rev-manifest.json
    .pipe(gulp.dest('rev')); // 将 rev-manifest.json 保存到 rev 目录内
});
//cssmd5，压缩后并用md5进行命名，下面使用revCollector进行路径替换
gulp.task('minifycssmd5', function() {
  return gulp
    .src('src/css/**/*.css')
    // .pipe(concat('build.min.css')) // 压缩后的css --flag 合并css
    .pipe(minifyCss()) // 压缩css到一样
    .pipe(rev()) // 文件名加MD5后缀
    .pipe(gulp.dest(buildBasePath + 'css')) // 输出到css目录
    .pipe(rev.manifest('rev-css-manifest.json')) // 生成一个rev-manifest.json
    .pipe(gulp.dest('rev')); // 将 rev-manifest.json 保存到 rev 目录内
});
//imgmd5，压缩后并用md5进行命名，下面使用revCollector进行路径替换
gulp.task('minifyimgmd5', function() {
  return gulp
    .src(['src/img/**/*.jpg', 'src/img/**/*.png', 'src/img/**/*.gif', 'img/**/*.png', 'img/**/*.gif'])
    .pipe(rev()) // 文件名加MD5后缀
    .pipe(gulp.dest(buildBasePath + 'img')) // 输出到css目录
    .pipe(rev.manifest('rev-img-manifest.json')) // 生成一个rev-manifest.json
    .pipe(gulp.dest('rev')); // 将 rev-manifest.json 保存到 rev 目录内
});

//html压缩
gulp.task('html', function() {
  var options = {
    removeComments: true, // 清除HTML注释
    collapseWhitespace: false, // 压缩HTML
    collapseBooleanAttributes: true, // 省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, // 删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
    minifyJS: true, // 压缩页面JS
    minifyCSS: true // 压缩页面CSS
  };
  return gulp
    .src(['src/**/*.html'])
    .pipe(gulpRemoveHtml()) // 清除特定标签
    .pipe(removeEmptyLines({ removeComments: true })) // 清除空白行
    .pipe(htmlmin(options))
    .pipe(gulp.dest(buildBasePath));
});

// 使用rev替换成md5文件名，这里包括html和css的资源文件也一起
gulp.task('rev', function() {
  // html，针对js,css,img
  return gulp
    .src(['rev/**/*.json', buildBasePath + '**/*.html'])
    .pipe(revCollector({ replaceReved: true }))
    .pipe(gulp.dest(buildBasePath));
});
gulp.task('revimg', function() {
  // css，主要是针对img替换
  return gulp
    .src(['rev/**/rev-img-manifest.json', buildBasePath + 'css/*.css'])
    .pipe(revCollector({ replaceReved: true }))
    .pipe(gulp.dest(buildBasePath + 'css'));
});

// 监视文件的变化，有修改时，自动调用default缺省默认任务
gulp.task('watch', function() {
  gulp.watch('**/*.html', ['default']);
});

gulp.task('default', function(cb) {
  gulpSequence(
    'clean:Build',
    'copy',
    'minifyjsmd5',
    'minifycssmd5',
    'minifyimgmd5',
    'html',
    // 'replacejs',
    // 'replacecss',
    'rev',
    'revimg'
  )(cb);
});
