// Variables initialize
var express = require('express')
var app = express()
var server = app.listen(5000, () => { console.log('Running on port 5000') } )
var io = require('socket.io').listen(server)

// Socket.io server setup
io.on('connection', function (socket) {
  // socket.on('playerJoinedGame', function (data) {
  //   game = findGame(data.token);
  //   game.players.push({ name: data.playerName, socket: socket })
  //   _.each(game.players, (player) => {
  //     obj = { players: _.map(game.players, (player) => _.pick(player, ['name'])) }
  //     player.socket.emit('playersInGame', obj);
  //   })
  // });

  // socket.on('adminGameStart', function(data) {
  //   var spyName = _.sample(game.players).name;
  //   var placeName = randomPlaceName();
  //   _.each(game.players, (player) => {
  //     playerIsSpy = player.name == spyName;
  //     obj = createStartGameMessage(playerIsSpy, placeName);
  //     player.socket.sendText(JSON.stringify(obj));
  //   })
  // })

  socket.on('chatMessage', (data) => {
    socket.emit('chatMessage', data)
    socket.broadcast.emit('chatMessage', data)
  })

  socket.on('chatJoined', (data) => {
    socket.broadcast.emit('chatJoined', data)
  })

  socket.on('echo', (data) => {
    socket.emit('echo', data)
  })
});

// Websocket server setup
// var ws = require('nodejs-websocket')
// var server = ws.createServer(function (conn) {
//   conn.on('text', function (message) {
//     messageObj = JSON.parse(message);
//     switch (messageObj.type) {
//       case 'playerJoinedGame':
//         game = findGame(messageObj.token);
//         game.players.push({ name: messageObj.playerName, socket: conn })
//         _.each(game.players, (player) => {
//           obj = { type: 'playersInGame', players: _.map(game.players, (player) => _.pick(player, ['name'])) }
//           player.socket.sendText(JSON.stringify(obj));
//         })
//         break;
//       case 'adminGameStart':
//         var spyName = _.sample(game.players).name;
//         var placeName = randomPlaceName();
//         _.each(game.players, (player) => {
//           playerIsSpy = player.name == spyName;
//           obj = createStartGameMessage(playerIsSpy, placeName);
//           player.socket.sendText(JSON.stringify(obj));
//           console.log(JSON.stringify(obj));
//         })
//         break;
//     }
//   })
//   conn.on('close', function (code, reason) {
//     console.log('Connection closed')
//   })
// }).listen(8001)

// Variables start
var games = [];

// Webserver setup
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/assets'));
app.use(require('body-parser').json())
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

var randomPlaceName = () => {
  return _.sample(PLACES);
}

var createStartGameMessage = (isSpy, placeName) => {
  var result = { type: 'gameHasStarted' }
  if (isSpy) {
    result.isSpy = true;
  } else {
    result.placeName = placeName;
  }
  return result;
}

const PLACES = [
  'Paris',
  'New York'
]
