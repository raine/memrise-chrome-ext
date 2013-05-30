require 'shelljs/global'
_ = require 'underscore'

module.exports = (grunt) ->
	grunt.registerTask 'server', 'Start a custom web server', ->
		grunt.log.writeln 'Started web server on port 8080'
		require('./server.js').listen 8080

	grunt.initConfig
		watch:
			coffee:
				files: 'test/**/*.coffee'
				tasks: 'coffee'

		tests:
			files: ['test/**/*.js', 'options/**/*.js']
			tasks: 'exec'

		concat: require './grunt/config/concat'
		uglify: require './grunt/config/uglify'
		coffee: require './grunt/config/coffee'

		targethtml:
			dist:
				files:
					'dist/index.html': 'options/index.html'
					'dist/main.html': 'main.html'

		exec:
			mocha:
				command: 'mocha-phantomjs http://localhost:8080/test/index.html'
				stdout: true

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

	markdown = ->
		exec 'marked -o CHANGES.html CHANGES.md'

	clean = ->
		exec 'rm -rf build/'
		exec 'rm -rf memrise-button*'

	clone = ->
		exec 'git clone .git build/'
		rm '-rf', 'build/.git'

	writeVersion = ->
		filepath = 'manifest.json'
		manifest = grunt.file.readJSON filepath
		manifest.version = env.VERSION
		grunt.file.write filepath, JSON.stringify(manifest, null, 4)

		for file in grunt.file.expand '**/*.{html,js}'
			sed '-i', '%VERSION%', env.VERSION, file

	manifest = ->
		manifestFiles = _.initial grunt.file.read('MANIFEST').split("\n")
		files = grunt.file.expand '{**,.*}'

		extra   = _.difference files, manifestFiles
		missing = _.difference manifestFiles, files

		unless _.isEmpty missing
			grunt.fail.warn "Files missing: #{grunt.log.wordlist missing}"

		for file in extra
			unless grunt.file.isDir file
				grunt.file.delete file

		for file in extra
			if grunt.file.isDir(file) and grunt.file.expand("#{file}/**").length is 1
				grunt.file.delete file

	publish = ->
		unless env.VERSION
			grunt.fatal 'Version not specified.'

		clone()
		exec 'grunt minify' # minify before changing directory
		cd 'build/'
		writeVersion()
		markdown()
		manifest()

	grunt.registerTask 'publish', [ 'clean', 'package' ]
	grunt.registerTask 'write_version', writeVersion
	grunt.registerTask 'clean', clean
	grunt.registerTask 'package', publish
	grunt.registerTask 'manifest', manifest
	grunt.registerTask 'markdown', markdown
