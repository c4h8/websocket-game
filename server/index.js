
var express = require('express');
var app = express();
var http = require('http').Server(app);

const Player = require('./models/Player');
const PowerUp = require('./models/PowerUp');
const Coin = require('./models/Coin');

const {
  startingPositionsArray,
  map,
  playerCollidesWithAnotherPlayer,
  getRandomEmptyGridPosition,
} = require('./utils');

const GAME_STATE = require('./gameState')

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
let coins = [
  new Coin({ gridPosition: { x: 5, y: 4 } }),
  new Coin({ gridPosition: { x: 14, y: 3 } }),
  new Coin({ gridPosition: { x: 17, y: 8 } }),
];
let powerUp = new PowerUp({ gridPosition: { x: 9, y: 5 } });

const initializeMap = () => {
  coins.forEach((c) => map[c.gridPosition.y][c.gridPosition.x] = 2);
  map[powerUp.gridPosition.y][powerUp.gridPosition.x] = 3;
}

initializeMap();

let startingPositions = startingPositionsArray;
// let gameState = GAME_STATE.IN_GAME;
// setTimeout(() => {
//   io.emit('')
// }, "1000")

const updatePowerUp = (player) => {
  map[powerUp.gridPosition.y][powerUp.gridPosition.x] = 0;
  powerUp = null;

  io.emit('remove-powerup');

  player.hasPowerUp = true;

  setTimeout(function() {
    player.hasPowerUp = false;
    const newPowerUpGridPosition = getRandomEmptyGridPosition();
    powerUp = new PowerUp({ gridPosition: newPowerUpGridPosition });
    map[newPowerUpGridPosition.y][newPowerUpGridPosition.x] = 3;
    io.emit('add-powerup', newPowerUpGridPosition);
    io.emit('update', {
      playerList: players,
      collisions: [],
      updatedCoins: []
    });
  }, 5000);
}

const playerTouchesElement = (player, element) => {
  return Math.hypot(
    element.position.x - player.position.x,
    element.position.y - player.position.y,
  ) < element.radius + player.radius
}

const updateLoop = () => {
  let collisions = [];
  let updatedCoins = [];
  players.forEach((player) => {
    if (powerUp && playerTouchesElement(player, powerUp)) {
      updatePowerUp(player);
    }
    coins.forEach((coin) => {
      if (playerTouchesElement(player, coin)) {
        map[coin.gridPosition.y][coin.gridPosition.x] = 0;
        coins = coins.filter(c => c !== coin);

        player.score += 1;

        const newCoinGridPosition = getRandomEmptyGridPosition();
        coins = [...coins, new Coin({ gridPosition: newCoinGridPosition })]
        map[newCoinGridPosition.y][newCoinGridPosition.x] = 2;
        updatedCoins = coins;
      }
    });
    players.forEach((anotherPlayer) => {
      if (player !== anotherPlayer
        && !(collisions.includes(player.id) && collisions.includes(anotherPlayer.id))
        && !player.hasPowerUp && !anotherPlayer.hasPowerUp
        && playerCollidesWithAnotherPlayer(player, anotherPlayer)) {
          collisions = [player.id, ...collisions];
        }
    })
  })
  io.emit('update', { playerList: players, collisions, updatedCoins });
  setTimeout(function() {
    updateLoop();
  }, 1000/60);
};

updateLoop();

io.on('connection', (socket) => {
  console.log('CLIENT CONNECTED');

  if (players.length < 2) {
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
  socket.on('send-update-player', (player) => {
    const playerToUpdate = players.find((p) => p.id === socket.id);
    if (playerToUpdate) {
      playerToUpdate.position = player.position;
      playerToUpdate.velocity = player.velocity;
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
  });


  // start recording session.
  let recordSessionActive = false;
  socket.on('start-stat-recording', (ack) => {
    if(!recordSessionActive) {
      recordSessionActive = true
      console.log('starting recorded session');
      ack('starting recorded session')

      setTimeout(() => {
        socket.emit('server-request-statistics');

        setTimeout(() =>{ dataRecorder.commit(); recordSessionActive = false }, 10*1000)
      }, 60* 1000)
    } else {
      ack('record session already in progress')
    }
  })

  // Players push ping data to the server
  socket.on('save-statistics', (data) => {
    dataRecorder.push(`${socket.id}`, data)
  });
});
