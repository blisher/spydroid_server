// Websocket server setup
var ws = require('nodejs-websocket')
var server = ws.createServer(function (conn) {
  conn.on('text', function (str) {
    conn.sendText(str.toUpperCase() + '!!!')
  })
  conn.on('close', function (code, reason) {
    console.log('Connection closed')
  })
}).listen(8001)

// Webserver setup
var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/app'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.get('/', function(request, response) {
  response.render('pages/index');
});
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
