var _       = require('underscore')
var connect = require('connect');
var http    = require('http');
var app;

app = connect()
	.use('/node_modules', connect.static('node_modules'))
	.use('/test', connect.static('test/'))
	.use('/lib', connect.static('lib/'))
	.use('/options', connect.static('options/'))
	.use(connect.static(__dirname));

module.exports = http.createServer(app);

if (_.include(process.argv, __filename)) {
	console.log('Started web server on port 8080');
	app.listen(8080);
}
