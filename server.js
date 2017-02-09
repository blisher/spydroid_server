// Variables initialize
var express = require('express')
var app = express()
var server = app.listen(5000, () => { console.log('Running on port 5000') } )
var io = require('socket.io').listen(server)
var favicon = require('serve-favicon');

// Socket.io server setup
io.on('connection', (socket) => {
  socket.on('playerJoinedGame', (data) => {
    broadcastLog('player joined game')
    game = findGame(data.token);
    game.players.push({ id: data.playerId, name: data.playerName, socket: socket })
    broadcastPlayersList(game)
  });

  socket.on('playerJoinedLobby', (data) => {
    broadcastLog('player joined lobby')
    game = findGame(data.token);
    broadcastPlayersList(game)
  });

  socket.on('playerLeftGame', (data) => {
    broadcastLog('player left game')
    game = findGame(data.token);
    removePlayerFromGame(game, data.playerId)
  })

  socket.on('playerLeftLobby', (data) => {
    broadcastLog('player left lobby')
    game = findGame(data.token)
    removePlayerFromGame(game, data.playerId)
    broadcastPlayersList(game)
  })

  socket.on('playerReady', (data) => {
    broadcastLog('player ready')
    game = findGame(data.token);
    findPlayer(game, data.playerId).ready = true
    _.each(game.players, (player) => {
      player.socket.emit('playerReady', { playerId: data.playerId });
    })
  })

  socket.on('adminGameStart', (data) => {
    broadcastLog('admin started game')
    let game = findGameByAdminToken(data.adminToken)
    game.joinable = false
    let spyName = _.sample(game.players).name;
    let placeName = randomPlaceName();
    _.each(game.players, (player) => {
      playerIsSpy = player.name == spyName;
      obj = createStartGameMessage(playerIsSpy, placeName);
      player.socket.emit('gameHasStarted', obj);
    })
  })

  socket.on('adminGameEnd', (data) => {
    broadcastLog('admin ended game')
    let game = findGameByAdminToken(data.adminToken)
    game.joinable = true
    _.each(game.players, (player) => {
      player.ready = false;
      player.socket.emit('gameHasEnded');
    })
  })

  socket.on('adminGameDelete', (data) => {
    broadcastLog('admin deleted game')
    let game = findGameByAdminToken(data.adminToken)
    let gameIndex = findIndex(games, (game2) => game2.token == game.token)
    games.splice(gameIndex, 1)
    _.each(game.players, (player) => {
      player.socket.emit('gameHasDied');
    })
  })

  socket.on('disconnect', (data) => {
    console.log('[Socket Disconnected]', data);
  })

  socket.on('echo', (data) => {
    broadcastLog('someone echoed')
    console.log('[Echo]', data);
    socket.emit('echo', data)
  })
});

let logsListenersCount = 0
let logsListeners = []
let logs = io.of('/io_logs');
logs.on('connection', function(socket){
  logsListeners.push(socket)
  changeListenersCount(1)

  socket.on('disconnect', (data) => {
    changeListenersCount(-1)
  })
});

var broadcastLog = (message) => {
  logsListeners.forEach((listener) => {
    listener.emit('log', { message: message })
  })
}

var changeListenersCount = (n) => {
  logsListenersCount += n
  logsListeners.forEach((listener) => {
    listener.emit('listenersCount', { count: logsListenersCount })
  })
}

// Variables start
var games = [];

// Webserver setup
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/assets'));
app.use(favicon(__dirname + '/assets/images/favicon.ico'));
app.use(require('body-parser').json())
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Router setup
app.get('/', (request, response) => {
  response.render('pages/index');
});
app.get('/logs', (request, response) => {
  response.render('pages/logs');
});
app.post('/api/games', (request, response) => {
  var game = createGame(request.body.creatorName);
  games.push(game);
  var user = { id: getUserId(game), name: game.creatorName }
  response.json({ game: game, user: user });
});
app.post('/api/connections', (request, response) => {
  var token = request.body.token
  game = findGame(token)
  if (game) {
    if (game.joinable) {
      var user = { id: getUserId(game), name: request.body.playerName }
      response.status(200)
      response.json({ game: _.pick(game, ['token']), user: user })
    } else {
      response.status(403)
      response.json({ error: 'You cannot join this game.' })
    }

  } else {
    response.status(404)
    response.json({ error: 'Game not found.' })
  }
});
app.get('/reset', (request, response) => {
  games.splice(0, games.length)
  if (games.length == 0) {
    response.status(200)
    response.json({ status: 'success' })
  }
})
app.get('/api/status', (request, response) => {
  response.json(true)
})
app.get('/places', (request, response) => {
  response.send(PLACES.join("\n"))
})

// Methods
var _ = require('lodash');

var broadcast = (server, msg) => {
  server.connections.forEach(function (conn) {
    conn.sendText(msg)
  })
}

var createGame = (creatorName) => {
  return {
    creatorName: creatorName,
    token: generateToken(3),
    adminToken: generateToken(10),
    players: [],
    newPlayerId: 1,
    joinable: true
  }
}

var getUserId = (game) => {
  let result = game.newPlayerId;
  game.newPlayerId += 1;
  return result;
}

var generateToken = (length) => {
  var token = '';
  for (var i = 0; i < length; i++) {
    token += Math.floor(Math.random() * 10);
  }
  return token;
}

var findGame = (token) => {
  return _.find(games, (game) => game.token.toString() == token.toString())
}

var findGameByAdminToken = (adminToken) => {
  return _.find(games, (game) => game.adminToken.toString() == adminToken.toString())
}

var findPlayer = (game, playerId) => {
  return _.find(game.players, (player) => player.id == playerId)
}

var randomPlaceName = () => {
  return _.sample(PLACES);
}

var broadcastPlayersList = (game) => {
  _.each(game.players, (player) => {
    obj = { players: _.map(game.players, (player) => _.pick(player, ['id', 'name', 'ready'])) }
    player.socket.emit('playersInGame', obj);
  })
}

var removePlayerFromGame = (game, playerId) => {
  let playerIndex = findIndex(game.players, (player) => { return player.id == playerId })
  return game.players.splice(playerIndex, 1)
}

var findIndex = (collection, filter) => {
  for (var i = 0; i < collection.length; i++) {
    if (filter(collection[i])) { return i }
  }
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
  'Teatr',
  'Restauracja',
  'Plaża',
  'School',
  'Supermarket',
  'Warsztat samochodowy',
  'Cyrk',
  'Szpital',
  'Pociąg pasażerski',
  'Bank',
  'Samolot pasażerski',
  'Komisariat policji',
  'Statek piracki',
  'Studio filmowe',
  'Baza wojskowa',
  'Łódź podwodna',
  'Statek pasażerski',
  'Stacja polarna',
  'Hotel',
  'Impreza firmowa',
  'Salon SPA',
  'Uniwersytet',
  'Ambasada',
  'Stacja kosmiczna',
  'Kasyno',
  'Kościół'
]
