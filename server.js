var connect = require('connect');
var http = require('http');
var app;

app = connect()
  .use('/node_modules', connect.static('node_modules'))
  .use('/test', connect.static('test/'))
  .use('/js', connect.static('js/'))
  .use('/lib', connect.static('lib/'))
  // .use(connect.static('app'))
  // .use('/js/lib/', connect.static('node_modules/requirejs/'))

http.createServer(app).listen(8080, function() {
  console.log('Running on http://localhost:8080');
});
