// Websocket server setup
var ws = require('nodejs-websocket')
var server = ws.createServer(function (conn) {
  conn.on('text', function (message) {
    messageObj = JSON.parse(message);
    switch (messageObj.type) {
      case 'playerJoinedGame':
        game = findGame(messageObj.token);
        game.players.push({ name: messageObj.playerName, socket: conn })
        _.each(game.players, (player) => {
          obj = { type: 'playersInGame', players: _.map(game.players, (player) => _.pick(player, ['name'])) }
          console.log(JSON.stringify(obj));
          player.socket.sendText(JSON.stringify(obj));
        })
    }
  })
  conn.on('close', function (code, reason) {
    console.log('Connection closed')
  })
}).listen(8001)

// Variables start
var games = [];

// Webserver setup
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/assets'));
app.use(bodyParser.json())
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Router setup
app.get('/', function(request, response) {
  response.render('pages/index');
});
app.post('/api/games', function(request, response) {
  game = createGame(request.body.creatorName);
  games.push(game);
  response.send(JSON.stringify(game));
});
app.post('/api/connections', function(request, response) {
  var token = request.body.token
  game = findGame(token)
  response.send(JSON.stringify(_.pick(game, ['token', 'creatorName'])));
});

// Application initializer
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});

// Methods
var _ = require('lodash');

var broadcast = (server, msg) => {
  server.connections.forEach(function (conn) {
    conn.sendText(msg)
  })
}

var createGame = (creatorName) => {
  var game = {
    creatorName: creatorName,
    token: generateToken(3),
    adminToken: generateToken(10),
    players: []
  };
  return game;
}

var generateToken = (length) => {
  var token = '';
  for (var i = 0; i < length; i++) {
    token += Math.floor(Math.random() * 10);
  }
  return token;
}

var findGame = (token) => {
  return _.find(games, (game) => game.token == token)
}
