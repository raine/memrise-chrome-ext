var connect = require('connect');
var http = require('http');
var app;

app = connect()
  .use('/node_modules', connect.static('node_modules'))
  .use('/test', connect.static('test/'))
  .use('/lib', connect.static('lib/'))
  .use('/options', connect.static('options/'))

module.exports = http.createServer(app);
