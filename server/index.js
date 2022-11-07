
var express = require('express')
var app = express();
app.use(express.static('build'));
var http = require('http').Server(app);

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
const Player = require('./models/Player');
const Coin = require('./models/Coin');

let players = [];
let startingPositions = [
  { x: 1, y: 1 },
  { x: 1, y: 9 },
  { x: 17, y: 1 },
  { x: 17, y: 9 },
  { x: 9, y: 1 },
  { x: 9, y: 9 },
  { x: 5, y: 5 },
  { x: 12, y: 5 },
  { x: 3, y: 3 },
  { x: 15, y: 3 }];

let colors = ['red', 'yellow', 'aqua', 'silver', 'orange', 'fuchsia', 'white', 'beige', 'lightsteelblue', 'olive'];

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

io.on('connection', (socket) => {
  console.log('CLIENT CONNECTED');

  const thisPlayer = new Player({
    startingPosition: startingPositions[0],
    color: colors[0],
    id: socket.id,
  });

  if (players.length < 10) {
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
    somePlayer.position = player.position;
    somePlayer.velocity = player.velocity;
  });

  socket.on('send-update-player-score', (removedCoin) => {
    if (map[removedCoin.gridPosition.y][removedCoin.gridPosition.x] === 2) {
      const newCoinPossibleLocations = map.map(
        (row, rowIndex) => row.map((number, column) => ({ x: column, y: rowIndex, number })),
      )
        .flat()
        .filter((element) => element.number === 0);

      const newCoinLocationIndex = Math.floor(Math.random() * newCoinPossibleLocations.length);

      const newCoin = new Coin({
        gridPosition: {
          x: newCoinPossibleLocations[newCoinLocationIndex].x,
          y: newCoinPossibleLocations[newCoinLocationIndex].y,
        },
      });

      map[removedCoin.gridPosition.y][removedCoin.gridPosition.x] = 0;

      const player = players.find((p) => p.id === socket.id);
      player.score += 1;

      map[newCoin.gridPosition.y][newCoin.gridPosition.x] = 2;

      io.emit('update-player-score-and-map', { player, removedCoin, newCoin });
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
