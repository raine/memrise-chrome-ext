require 'shelljs/global'
_ = require 'underscore'

releaseTasks = require './grunt/tasks/release'

module.exports = (grunt) ->
  grunt.registerTask 'server', 'Start a custom web server', ->
    grunt.log.writeln 'Started web server on port 8080'
    require('./server.js').listen 8080

  grunt.initConfig
    watch: require './grunt/config/watch'

    exec:
      mocha:
        command: 'mocha-phantomjs http://localhost:8080/test/index.html'
        stdout: true

    concat: require './grunt/config/concat'
    uglify: require './grunt/config/uglify'
    coffee: require './grunt/config/coffee'
    targethtml: require './grunt/config/targethtml'

  grunt.loadNpmTasks 'grunt-exec'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-targethtml'
  grunt.registerTask 'minify', ['concat', 'uglify']

  grunt.registerTask 'default', ->
    tasks = ['server', 'coffee', 'exec', 'watch']
    grunt.option 'force', true
    grunt.task.run tasks

  grunt.registerTask 'release:publish',  releaseTasks.publish
  grunt.registerTask 'release:build',    releaseTasks.build
  grunt.registerTask 'release:clean',    releaseTasks.clean
  grunt.registerTask 'release:manifest', releaseTasks.manifest
  grunt.registerTask 'release', 'Prepare a zip for Chrome Store',
    ['release:clean', 'release:build', 'release:publish']
