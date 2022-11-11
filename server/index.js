
var express = require('express')
var app = express();
app.use(express.static('build'));
var http = require('http').Server(app);

const Player = require('./models/Player');
const Coin = require('./models/Coin');
const { startingPositionsArray, mapArray } = require('./utils');

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

io.listen(http)
http.listen(port, () => {
  console.log('Server is running on port ', port);
})


let players = [];
let startingPositions = startingPositionsArray;
const map = mapArray;

let colors = ['red', 'yellow', 'aqua', 'silver', 'orange', 'fuchsia', 'white', 'beige', 'lightsteelblue', 'olive'];

const getRandomEmptyGridPosition = () => {
  const emptyPositions = map.map(
    (row, rowIndex) => row.map((number, column) => ({ x: column, y: rowIndex, number })),
  )
    .flat()
    .filter((element) => element.number === 0);

  const randomEmptyPositionIndex = Math.floor(Math.random() * emptyPositions.length)

  return emptyPositions[randomEmptyPositionIndex]
}

io.on('connection', (socket) => {
  console.log('CLIENT CONNECTED');

  if (players.length < 10) {
    const thisPlayer = new Player({
      startingPosition: startingPositions[0],
      color: colors[0],
      id: socket.id,
    });

    colors = colors.filter((c) => c !== colors[0]);
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

  socket.on('send-update-player-position', (player) => {
    socket.broadcast.emit('update-player-position', player);
    const somePlayer = players.find((p) => p.id === socket.id);
    if (somePlayer) {
      somePlayer.position = player.position;
      somePlayer.velocity = player.velocity;
    }
  });

  socket.on('send-update-powerup', (powerUp) => {
    console.log(powerUp);
    if (map[powerUp.gridPosition.y][powerUp.gridPosition.x] === 3) {
      const newPowerUpPosition = getRandomEmptyGridPosition();

      map[powerUp.gridPosition.y][powerUp.gridPosition.x] = 0;
      map[newPowerUpPosition.y][newPowerUpPosition.x] = 3;

      io.emit('remove-powerup');

      setTimeout(function() {
        io.emit('add-powerup', newPowerUpPosition);
      }, 5000);
    }
  });

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

  socket.on('disconnect', () => {
    const player = players.find((p) => p.id === socket.id);
    if (player) {
      colors = [player.color, ...colors];
      startingPositions = [player.startingPosition, ...startingPositions];

      players = players.filter((p) => p.id !== socket.id);

      socket.broadcast.emit('delete-player', player);
    }
    console.log('CLIENT CONNECTION CLOSED');
  });
});
