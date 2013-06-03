var fs      = require('fs');
var _       = require('underscore');
var connect = require('connect');
var http    = require('http');
var app;

var requests = 0;
var learningObj = JSON.parse(fs.readFileSync('assets/learning.json','utf8'));
var getLearningJSON = function(req, res) {
	learningObj.categories.forEach(function(category) {
		var params = require('url').parse(req.url, true).query;
		if (params.nologin === 'true') {
			res.writeHead(403);
			return res.end();
		}

		if (params.wilting) {
			category.num_ready_to_water = +params.wilting;
		} else {
			if (requests % 2 === 0) {
				category.num_ready_to_water = 0;
			} else {
				category.num_ready_to_water = 20;
			}
		}
	});

	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(learningObj));
	requests += 1;
};

app = connect()
	.use('/node_modules', connect.static('node_modules'))
	.use('/test', connect.static('test/'))
	.use('/lib', connect.static('lib/'))
	.use('/options', connect.static('options/'))
	.use('/learning.json', getLearningJSON)
	.use(connect.static(__dirname));

module.exports = http.createServer(app);

if (_.include(process.argv, __filename)) {
	console.log('Started web server on port 8080');
	app.listen(8080);
}
