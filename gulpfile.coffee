# Dependencies
gulp= require 'gulp'
order= require 'gulp-order'
concat= require 'gulp-concat'
jsfy= require 'gulp-jsfy'

# Environment
jasmine= 'bower_components/jasmine/lib/jasmine-core'
jasmine_order= [
  "jasmine.js"
  "jasmine-html.js"
  "boot.js"
  "jasmine.css"
]

gulp.task 'default',->
  gulp.src ["#{jasmine}/*.*","!**/node_boot.js"]
    .pipe order jasmine_order
    .pipe jsfy()
    .pipe concat 'jasmine-standalone.js'
    .pipe gulp.dest __dirname
