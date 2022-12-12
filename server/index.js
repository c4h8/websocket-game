
var express = require('express');
var app = express();
var http = require('http').Server(app);
const renderChart = require('./stats/normalize')

const Player = require('./models/Player');
const PowerUp = require('./models/PowerUp');
const Coin = require('./models/Coin');

const {
  startingPositionsArray,
  initialMap,
  playerCollidesWithAnotherPlayer,
  getRandomEmptyGridPosition,
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
// render charts
app.get('/stats/:slug/', async (req, res) => {
  const slug = req.params.slug;
  const htmlString = await renderChart(slug)
  res.send(htmlString)
})
app.use(express.static('build'));

http.listen(port, () => {
  console.log('Server is running on port ', port);
})

let map = initialMap.map(a => a.slice());

const fps = 45;
const scoreLimit = 10;
let roundEnded = true;
let players = [];
let coins = [];
let powerUp = null;

const initializeMap = () => {
  coins.forEach((c) => map[c.gridPosition.y][c.gridPosition.x] = 2);
  if (powerUp !== null) {
    map[powerUp.gridPosition.y][powerUp.gridPosition.x] = 3;
  }
}

initializeMap();

const startRound = () => {
  players.forEach((p) => {
    p.score = 0;
  });
  coins = [
    new Coin({ gridPosition: getRandomEmptyGridPosition(map) }),
    new Coin({ gridPosition: getRandomEmptyGridPosition(map) }),
    new Coin({ gridPosition: getRandomEmptyGridPosition(map) }),
  ];
  powerUp = new PowerUp({ gridPosition: getRandomEmptyGridPosition(map) });
  initializeMap();

  roundEnded = false;

  io.emit('start-round', { newCoins: coins, newPowerUp: powerUp });
};

const endRound = () => {
  roundEnded = true;
  coins = [];
  powerUp = null;
  map = initialMap.map(a => a.slice());
};

let startingPositions = startingPositionsArray;

const updatePowerUp = (player) => {
  map[powerUp.gridPosition.y][powerUp.gridPosition.x] = 0;
  powerUp = null;

  io.emit('remove-powerup');

  player.hasPowerUp = true;
  player.color = 'blue';

  setTimeout(function() {
    player.hasPowerUp = false;
    player.color = 'red';
    if (!roundEnded) {
      const newPowerUpGridPosition = getRandomEmptyGridPosition(map);
      powerUp = new PowerUp({ gridPosition: newPowerUpGridPosition });
      map[newPowerUpGridPosition.y][newPowerUpGridPosition.x] = 3;
      io.emit('add-powerup', newPowerUpGridPosition);
    }
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
    if (player.score >= scoreLimit && !roundEnded) {
      endRound();
      io.emit('end-round', player);
      // endRecordSession();
      setTimeout(function() {
        if (roundEnded) {
          startRound();
        }
      }, 5000);
    }
    if (powerUp && playerTouchesElement(player, powerUp)) {
      updatePowerUp(player);
    }
    coins.forEach((coin) => {
      if (playerTouchesElement(player, coin)) {
        map[coin.gridPosition.y][coin.gridPosition.x] = 0;
        coins = coins.filter(c => c !== coin);

        player.score += 1;

        const newCoinGridPosition = getRandomEmptyGridPosition(map);
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
  }, 1000 / fps);
};

let recordSessionActive = false;
let recordSessionTimeout = null;
const endRecordSession = () => {
  if(recordSessionActive) {
    io.emit('server-request-statistics');
    setTimeout(() => {
      dataRecorder.commit();
      recordSessionActive = false; 
      recordSessionTimeout = null;
    }, 10*1000)
  }
}

updateLoop();

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
  socket.on('send-update-player', (player) => {
    const playerToUpdate = players.find((p) => p.id === socket.id);
    if (playerToUpdate) {
      playerToUpdate.position = player.position;
      playerToUpdate.velocity = player.velocity;
    }
  });

  socket.on('send-start-round', () => {
    if (roundEnded) {
      startRound();
    }
  });

  socket.on('send-end-round', () => {
    if (!roundEnded) {
      endRound();
      io.emit('end-round', null);
    }
    // if record session is active, collect data
    if (recordSessionActive) {
      clearTimeout(recordSessionTimeout);
      endRecordSession();
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
  socket.on('start-stat-recording', (ack) => {
    if(!recordSessionActive) {
      recordSessionActive = true
      console.log('starting recorded session');
      ack('starting recorded session')

      recordSessionTimeout = setTimeout(endRecordSession, 60* 1000)
    } else {
      ack('record session already in progress')
    }
  })

  // Players push ping data to the server
  socket.on('save-statistics', (data) => {
    dataRecorder.push(`${socket.id}`, data)
  });
});
