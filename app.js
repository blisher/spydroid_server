// Websocket server setup
// var ws = require('nodejs-websocket')
// var server = ws.createServer(function (conn) {
//   conn.on('text', function (str) {
//     broadcast(server, str.toUpperCase() + '!!!')
//   })
//   conn.on('close', function (code, reason) {
//     console.log('Connection closed')
//   })
// }).listen(8001)
//

var WebSocket = require('ws');
var server = new WebSocket.Server({port: 8001});

server.on('text', function (str) {
  broadcast(server, str.toUpperCase() + '!!!')
});
server.on('close', function (code, reason) {
  console.log('Disconnected.')
});

function broadcast(server, msg) {
  server.connections.forEach(function (conn) {
    conn.sendText(msg)
  })
}

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
