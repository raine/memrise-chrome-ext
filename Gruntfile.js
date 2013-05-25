module.exports = function(grunt) {
	grunt.registerTask('server', 'Start a custom web server', function() {
		grunt.log.writeln('Started web server on port 8080');
		require('./server.js').listen(8080);
	});

	grunt.initConfig({
		coffee: {
			glob_to_multiple: {
				expand: true,
				flatten: true,
				cwd: 'test/',
				src: ['*.coffee'],
				dest: 'test/',
				ext: '.test.js'
			}
		},

		watch: {
			coffee: {
				files: 'test/**/*.coffee',
				tasks: 'coffee'
			},

			tests: {
				files: ['test/**/*.js', 'options/**/*.js'],
				tasks: 'exec'
			}
		},

		exec: {
			mocha: {
				command: 'mocha-phantomjs http://localhost:8080/test/index.html',
				stdout: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', function() {
		var tasks = ['server', 'coffee', 'exec', 'watch'];
		grunt.option('force', true);
		grunt.task.run(tasks);
	});
};
