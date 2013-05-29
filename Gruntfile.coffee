require 'shelljs/global'
_ = require 'underscore'

prependPath = (obj, path) ->
	return _.reduce obj, (obj, v, k) ->
		obj[path + k] = v.map (e) -> path + e
		obj
	, {}

concatFiles =
	# Things only used by options
	'dist/options.concat.js': [
		'lib/backbone.js'
		'lib/backbone.marionette.js'
		'lib/rivets.min.js'
		'options/js/rivets.cfg.js'
		'options/js/router.js'
		'options/js/controller.js'
		'options/js/topics.js'
		'options/js/settings.js'
		'options/js/changes.view.js'
		'options/js/settings.view.js'
		'options/js/navigation.view.js'
		'options/js/app.js'
	],

	# Libs shared by main and options
	'dist/common.concat.js': [
		'shared.js'
		'lib/localstore.js'
		'lib/jquery-1.9.1.min.js'
		'lib/underscore.min.js'
	]

	# Things only used by main
	'dist/main.concat.js': [
		'lib/animation.js'
		'lib/mixpanel.js'
		'main.js'
	]

uglifyFiles =
	'options/js/options.min.js' : ['dist/options.concat.js']
	'lib/common.min.js'         : ['dist/common.concat.js']
	'lib/main.min.js'           : ['dist/main.concat.js']

concatFiles = prependPath concatFiles, "build/"
uglifyFiles = prependPath uglifyFiles, "build/"

module.exports = (grunt) ->
	grunt.registerTask 'server', 'Start a custom web server', ->
		grunt.log.writeln 'Started web server on port 8080'
		require('./server.js').listen 8080

	grunt.initConfig
		coffee:
			glob_to_multiple:
				expand: true
				flatten: true
				cwd: 'test/'
				src: ['*.coffee']
				dest: 'test/'
				ext: '.test.js'

		watch:
			coffee:
				files: 'test/**/*.coffee'
				tasks: 'coffee'

		tests:
			files: ['test/**/*.js', 'options/**/*.js']
			tasks: 'exec'

		concat:
			dist:
				files:
					concatFiles

		uglify:
			options:
				mangle: {}

			my_target:
				files: uglifyFiles

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

	publish = ->
		unless env.VERSION
			grunt.fatal 'Version not specified.'

		clone()
		exec 'grunt minify' # minify before changing directory
		cd 'build/'
		writeVersion()

	grunt.registerTask 'publish', [ 'clean', 'package' ]
	grunt.registerTask 'write_version', writeVersion
	grunt.registerTask 'clean', clean
	grunt.registerTask 'package', publish
