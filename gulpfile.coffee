gulp= require 'gulp'
order= require 'gulp-order'
concat= require 'gulp-concat'

filter= require 'gulp-filter'
uglify= require 'gulp-uglify'
uglifycss= require 'gulp-uglifycss'
wrap_link= require 'gulp-wrap-link'

#require unzipped dir
jasmine= 'bower_components/jasmine/dist/jasmine-standalone-2.1.3/lib/jasmine-2.1.3'
jasmine_order= [
  "jasmine.js"
  "jasmine-html.js"
  "boot.js"
  "jasmine.css.js"
]
jasmine_all= 'jasmine-standalone.js'
jasmine_all_regexp= /jasmine\.min(\.css)?\.js$/

gulp.task 'default',['ugilify'],->
  gulp.src "*.*"
    .pipe filter((file)->
      jasmine_all_regexp.test(file.path)
    )
    .pipe concat jasmine_all
    .pipe gulp.dest __dirname

gulp.task 'ugilify',->
  bower_js= filter "**/*.js"
  bower_css= filter "**/*.css"
  gulp.src "#{jasmine}/*.*"
    .pipe bower_js
    .pipe order jasmine_order
    .pipe concat 'jasmine.min.js'
    .pipe uglify()
    .pipe gulp.dest __dirname
    .pipe bower_js.restore()
    .pipe bower_css
    .pipe uglifycss()
    .pipe concat 'jasmine.min.css'
    .pipe wrap_link "jasmine.min.css.js"
    .pipe gulp.dest __dirname