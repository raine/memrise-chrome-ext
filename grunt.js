module.exports = function(grunt) {
	grunt.registerTask('server', 'Start a custom web server', function() {
		grunt.log.writeln('Started web server on port 8080');
		require('./server.js').listen(8080);
	});

	grunt.initConfig({
		watch: {
			files: ['test/**/*.js', 'options/**/*.js'],
			tasks: 'exec'
		},

		exec: {
			mocha: {
				command: 'mocha-phantomjs http://localhost:8080/test/index.html',
				stdout: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-exec');
	grunt.registerTask('default', 'server exec watch');
}
