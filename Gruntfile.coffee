module.exports = (grunt) ->
	grunt.registerTask "server", "Start a custom web server", ->
		grunt.log.writeln "Started web server on port 8080"
		require("./server.js").listen 8080

	grunt.initConfig
		coffee:
			glob_to_multiple:
				expand: true
				flatten: true
				cwd: "test/"
				src: ["*.coffee"]
				dest: "test/"
				ext: ".test.js"

		watch:
			coffee:
				files: "test/**/*.coffee"
				tasks: "coffee"

		tests:
			files: ["test/**/*.js", "options/**/*.js"]
			tasks: "exec"

		exec:
			mocha:
				command: "mocha-phantomjs http://localhost:8080/test/index.html"
				stdout: true

		concat:
			dist:
				files:
					# Things only used by options
					"dist/options.concat.js": [
						"lib/backbone.js"
						"lib/backbone.marionette.js"
						"lib/rivets.min.js"
						"options/js/rivets.cfg.js"
						"options/js/router.js"
						"options/js/controller.js"
						"options/js/topics.js"
						"options/js/settings.js"
						"options/js/changes.view.js"
						"options/js/settings.view.js"
						"options/js/navigation.view.js"
						"options/js/app.js"
					],
          
					# Libs shared by main and options
					"dist/common.concat.js": [
						"shared.js"
						"lib/localstore.js"
						"lib/jquery-1.9.1.min.js"
						"lib/underscore.min.js"
					]
          
					# Things only used by main
					"dist/main.concat.js": [
						"lib/animation.js"
						"lib/mixpanel.js"
						"main.js"
					]

		uglify:
			options:
				mangle: {}

		my_target:
			files:
				"dist/options.min.js": ["dist/options.concat.js"]
				"dist/common.min.js": ["dist/common.concat.js"]
				"dist/main.min.js": ["dist/main.concat.js"]

		targethtml:
			dist:
				files:
					"dist/index.html": "options/index.html"
					"dist/main.html": "main.html"

	grunt.loadNpmTasks "grunt-exec"
	grunt.loadNpmTasks "grunt-contrib-watch"
	grunt.loadNpmTasks "grunt-contrib-coffee"
	grunt.loadNpmTasks "grunt-contrib-concat"
	grunt.loadNpmTasks "grunt-contrib-uglify"
	grunt.loadNpmTasks "grunt-targethtml"
	grunt.registerTask "build", ["concat", "uglify"]

	grunt.registerTask "default", ->
		tasks = ["server", "coffee", "exec", "watch"]
		grunt.option "force", true
		grunt.task.run tasks
