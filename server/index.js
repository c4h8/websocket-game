
var express = require('express')
var app = express();
var http = require('http').Server(app);

const Player = require('./models/Player');
const {
  startingPositionsArray,
  map,
  getRandomEmptyGridPosition
} = require('./utils');

const dataRecorder = new (require('./dataRecorder'))()

const port = process.env.PORT || '4000';

const originList = process.env.RENDER_EXTERNAL_HOSTNAME
  ? [`${process.env?.RENDER_EXTERNAL_HOSTNAME}:${port}`]
  : ['http://localhost:8080']

console.log('cors', originList)
console.log('cors', port)
const io = require('socket.io')(http, {
  cors: {
    origin: originList,
  },
});
app.use(express.static('build'));

http.listen(port, () => {
  console.log('Server is running on port ', port);
})

let players = [];
let startingPositions = startingPositionsArray;

io.on('connection', (socket) => {
  console.log('CLIENT CONNECTED');

  if (players.length < 10) {
    const thisPlayer = new Player({
      startingPosition: startingPositions[0],
      id: socket.id,
    });

    startingPositions = startingPositions.filter((p) => p !== startingPositions[0]);

    socket.emit('create-game', { player: thisPlayer, map });

    players.forEach((p) => {
      socket.emit('add-player', p);
    });

    players = [thisPlayer, ...players];

    socket.broadcast.emit('add-player', thisPlayer);
  } else {
    socket.emit('spectate', map);
    players.forEach((p) => socket.emit('add-player', p));
  }


  // One of the clients sends their position and velocity
  // This information is broadcasted to all other clients
  socket.on('send-update-player-position', (player) => {
    socket.broadcast.emit('update-player-position', player);
    const somePlayer = players.find((p) => p.id === socket.id);
    if (somePlayer) {
      somePlayer.position = player.position;
      somePlayer.velocity = player.velocity;
    }
  });


  // One of the clients has collected a powerup
  // Powerup is removed from the map
  // New powerup position is emitted to all clients after 5 seconds
  socket.on('send-update-powerup', (powerUp) => {
    if (map[powerUp.gridPosition.y][powerUp.gridPosition.x] === 3) {
      map[powerUp.gridPosition.y][powerUp.gridPosition.x] = 0;

      io.emit('remove-powerup');

      setTimeout(function() {
        const newPowerUpPosition = getRandomEmptyGridPosition();
        map[newPowerUpPosition.y][newPowerUpPosition.x] = 3;
        io.emit('add-powerup', newPowerUpPosition);
      }, 5000);
    }
  });


  // One of the clients has collected a coin
  // The score of the client is increased by one
  // New coin position is emitted to all clients
  socket.on('send-update-player-score', (removedCoin) => {
    if (map[removedCoin.gridPosition.y][removedCoin.gridPosition.x] === 2) {
      const newCoinGridPosition = getRandomEmptyGridPosition();

      map[removedCoin.gridPosition.y][removedCoin.gridPosition.x] = 0;

      const player = players.find((p) => p.id === socket.id);
      player.score += 1;

      map[newCoinGridPosition.y][newCoinGridPosition.x] = 2;

      io.emit('update-player-score-and-map', { player, removedCoin, newCoinGridPosition });
    }
  });

  // One of the clients has disconnected
  // Remove the player and broadcast to all other clients
  socket.on('disconnect', () => {
    const player = players.find((p) => p.id === socket.id);
    if (player) {
      startingPositions = [player.startingPosition, ...startingPositions];

      players = players.filter((p) => p.id !== socket.id);

      socket.broadcast.emit('delete-player', player);
    }
    console.log('CLIENT CONNECTION CLOSED');
  });

  // Respond to ping measurement
  socket.on('get-rtt', (callback) => {
    callback(Date.now());
  })

  socket.on('save-statistics', (data) => {
    dataRecorder.push('fakeID', data)
    dataRecorder.commit()
  })
});
