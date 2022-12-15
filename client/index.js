/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-globals */
import { io } from 'socket.io-client';


import Boundary from './classes/Boundary';
import Player from './classes/Player';
import Coin from './classes/Coin';
import PowerUp from './classes/PowerUp';
import StatCache from './StatCache';

import { createMap, playerCollidesWithBoundary } from './functions';
import { keys, fps } from './constants';

const socket = io(import.meta.env.IS_PROD ? `${window.location.hostname}` : 'http://localhost:4000');

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoresDivElement = document.querySelector('#scores');
const myScoreElement = document.querySelector('#myScore');
const headerElement = document.querySelector('#header');

let lastKey = '';

let boundaries = [];
let coins = [];
let powerUp = null;

let velocity = 5;

let localPlayer = null;
let players = [];

let disconnected = false;

let collisionDetected = false;

let winner = null;

let timeToNewRound = 0;
let intervalId = null;

// Creates the local player and the map, and starts the game loop
socket.on('create-game', ({ player, map }) => {
  canvas.width = Boundary.width * map[0].length;
  canvas.height = Boundary.height * map.length;

  localPlayer = new Player({
    startingPosition: player.startingPosition,
    color: 'red',
    id: player.id,
    name: player.name,
    isLocalPlayer: true
  });

  console.log("Socket id:", player.id);

  headerElement.innerHTML = `You are the ${localPlayer.color} circle`;
  headerElement.style.color = localPlayer.color;
  myScoreElement.style.color = localPlayer.color;

  powerUp = createMap(map, boundaries, coins);

  gameLoop(localPlayer);
});

socket.on('start-round', ({ newCoins, newPowerUp }) => {
  coins = newCoins.map(c => new Coin({ gridPosition: c.gridPosition }));
  powerUp = new PowerUp({
    gridPosition: newPowerUp.gridPosition
  });
  winner = null;
  clearInterval(intervalId);
});

// Creates the map, and starts the spectate loop
socket.on('spectate', (map) => {
  canvas.width = Boundary.width * map[0].length;
  canvas.height = Boundary.height * map.length;

  headerElement.innerHTML = 'Spectating';
  document.getElementById('instructions').remove();

  powerUp = createMap(map, boundaries, coins);
  spectate();
});

// Creates a new player (opponent) and adds it to the players list
socket.on('add-player', player => {
  if (localPlayer) {
    socket.emit('send-update-player-position', {
      position: localPlayer.position,
      velocity: localPlayer.velocity,
      id: localPlayer.id
    });
  }

  const newPlayer = new Player({
    startingPosition: player.startingPosition,
    id: player.id,
    name: player.name,
    isLocalPlayer: false,
  });

  newPlayer.velocity = player.velocity;

  const scoreElement = document.createElement('div');
  scoreElement.id = newPlayer.name;
  scoreElement.innerHTML = `${newPlayer.name} score: ${player.score}`;
  scoreElement.style.color = newPlayer.color;

  scoresDivElement.appendChild(scoreElement);

  players = [newPlayer, ...players];
});

socket.on('update', ({ playerList, collisions, updatedCoins }) => {
  playerList.forEach(player => {
    const playerToUpdate = players.find((p) => p.id === player.id);

    if (playerToUpdate && (localPlayer === null || player.id !== localPlayer.id)) {
      playerToUpdate.color = player.color === 'red' ? 'gray' : 'blue';
      playerToUpdate.updateWithPosition(player.position);
  
      playerToUpdate.velocity.x = player.velocity.x;
      playerToUpdate.velocity.y = player.velocity.y;

      if (player.score !== playerToUpdate.score) {
        playerToUpdate.score = player.score;
        const scoreElement = document.getElementById(playerToUpdate.name);
        scoreElement.innerHTML = `${playerToUpdate.name} score: ${playerToUpdate.score}`;
      }
    }

    if (localPlayer && player.id === localPlayer.id && player.score !== localPlayer.score) {
      localPlayer.score = player.score;
      myScoreElement.innerHTML = `My score: ${localPlayer.score}`;
    }
  })

  if (localPlayer) {
    const localPlayerToUpdate = playerList.find((p) => p.id === localPlayer.id);
    localPlayer.color = localPlayerToUpdate.color;
    if(collisions.includes(localPlayer.id)) {
      localPlayer.velocity.x = localPlayerToUpdate.velocity.x;
      localPlayer.velocity.y = localPlayerToUpdate.velocity.y;
      localPlayer.update();
      collisionDetected = true;
    }
  }

  if (updatedCoins.length > 0) {
    coins = updatedCoins.map(c => new Coin({ gridPosition: c.gridPosition }));
  }
});

// Removes a player (opponent) from a list of players
socket.on('delete-player', player => {
  players = players.filter((p) => p.id !== player.id);
  document.getElementById(player.name).remove()
});

// Removes a powerup from the map
socket.on('remove-powerup', () => {
  powerUp = null;
});

// Adds a powerup to the map
socket.on('add-powerup', (newPowerUpGridPosition) => {
  powerUp = new PowerUp({
    gridPosition: newPowerUpGridPosition
  });
});

socket.on('end-round', (player) => {
  console.log('round ended');
  winner = player;
  coins = [];
  powerUp = null;

  if (winner !== null) {
    timeToNewRound = 5;
    intervalId = setInterval(function() {
      --timeToNewRound;
    }, 1000)
  }
});

// Removes the players and their scores from the screen
socket.on("disconnect", () => {
  players.forEach(player => document.getElementById(player.name).remove());
  players = [];
  disconnected = true
  headerElement.innerHTML = 'Disconnected';
  headerElement.style.color = 'white';
});

const drawWinningText = () => {
  if (winner !== null) {
    c.font = "100px Arial";
    c.fillStyle = "red";
    c.textAlign = "center";
    if (localPlayer && winner.id === localPlayer.id) {
      c.fillText(`You win!`, canvas.width / 2, canvas.height / 2);
    } else {
      c.fillText(`${winner.name} wins!`, canvas.width / 2, canvas.height / 2);
    }
    c.font = "30px Arial";
    c.fillText(`New round starting in ${timeToNewRound}`, canvas.width / 2, canvas.height / 2 + 75);
  }
}

// The main game loop which is looped fps times a second
function gameLoop(localPlayer) {
  if (!disconnected) {
    setTimeout(() => {
      requestAnimationFrame(() => gameLoop(localPlayer));
    }, 1000 / fps);
  }
  // Clear the canvas
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Change the direction of the player if:
  // 1. User has pressed a new key, and
  // 2. Changing the direction does not break the rules of the game
  if (keys.w.pressed && lastKey === 'w') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (playerCollidesWithBoundary({
        player: {
          ...localPlayer,
          velocity: {
            x: 0,
            y: -velocity,
          },
        },
        boundary,
      })
      ) {
        localPlayer.velocity.y = 0;
        break;
      } else {
        localPlayer.velocity.y = -velocity;
      }
    }
  } else if (keys.a.pressed && lastKey === 'a') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (playerCollidesWithBoundary({
        player: {
          ...localPlayer,
          velocity: {
            x: -velocity,
            y: 0,
          },
        },
        boundary,
      })
      ) {
        localPlayer.velocity.x = -0;
        break;
      } else {
        localPlayer.velocity.x = -velocity;
      }
    }
  } else if (keys.s.pressed && lastKey === 's') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (playerCollidesWithBoundary({
        player: {
          ...localPlayer,
          velocity: {
            x: 0,
            y: velocity,
          },
        },
        boundary,
      })
      ) {
        localPlayer.velocity.y = 0;
        break;
      } else {
        localPlayer.velocity.y = velocity;
      }
    }
  } else if (keys.d.pressed && lastKey === 'd') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (playerCollidesWithBoundary({
        player: {
          ...localPlayer,
          velocity: {
            x: velocity,
            y: 0,
          },
        },
        boundary,
      })
      ) {
        localPlayer.velocity.x = -0;
        break;
      } else {
        localPlayer.velocity.x = velocity;
      }
    }
  }

  // Render the coins on the screen
  // If coin is collected:
  // 1. Send a message to the server
  // 2. Remove the collected coin from the screen
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    coin.draw(c);
  }

  // Render the powerup on the screen
  if(powerUp) {
    powerUp.draw(c);
  }

  // Render the boundaries on the screen
  // If player is colliding with the boundary, set the velocity of the player to 0
  boundaries.forEach((boundary) => {
    boundary.draw(c);
    if (playerCollidesWithBoundary({ player: localPlayer, boundary })) {
      localPlayer.velocity.x = 0;
      localPlayer.velocity.y = 0;
    }
  });
  
  // Draw the players on the screen
  players.forEach((p) => {
    p.draw(c);
  });

  if (!collisionDetected) {
    localPlayer.updateAndDraw(c);
  } else {
    localPlayer.draw(c);
  }

  socket.emit('send-update-player', {
    position: localPlayer.position,
    velocity: localPlayer.velocity,
    id: localPlayer.id
  });

  drawWinningText();

  collisionDetected = false;
}


// A function for spectating the game
function spectate() {
  c.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    coin.draw(c);
  }

  if(powerUp) {
    powerUp.draw(c);
  }

  boundaries.forEach((boundary) => {
    boundary.draw(c);
  });
  
  players.forEach((p) => p.draw(c));

  drawWinningText();

  setTimeout(() => {
    requestAnimationFrame(spectate);
  }, 1000 / fps);
}



const statCache = new StatCache();

const measureRTT = () => {
  const t = performance.now();

  socket.emit('get-rtt', (serverTimestamp) => {
    const t2 = performance.now();
    const rtt = t2- t;
    statCache.push({c: rtt, s: serverTimestamp });
  })
}

socket.on('server-request-statistics', () => {
  const data = statCache.get();
  socket.emit('save-statistics', data);
  statCache.reset();
});


const pingInterval = setInterval(measureRTT, 1000);

const startStatRecording = () => {
  socket.emit('start-stat-recording', ack => console.log(ack))
};

const startRound = () => {
  socket.emit('send-start-round');
}

const endRound = () => {
  socket.emit('send-end-round');
}

// Add event listener for keydown event
// When user presses key (WASD) down:
// 1. The value of lastKey is updated
// 2. The value of the key property 'pressed' is set to true
window.addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'w':
      keys.w.pressed = true;
      lastKey = 'w';
      break;
    case 'a':
      keys.a.pressed = true;
      lastKey = 'a';
      break;
    case 's':
      keys.s.pressed = true;
      lastKey = 's';
      break;
    case 'd':
      keys.d.pressed = true;
      lastKey = 'd';
      break;
    case 'p':
      measureRTT();
      break;
    case 'l':
      startStatRecording();
      break;
    case '!':
      startRound();
      break;
    case 'u':
      console.log('starting benchmark');
      endRound();
      startRound();
      startStatRecording();
      setTimeout(endRound, 60*1000);
      break;
    case '?':
      endRound();
      break;
    default:
      break;
  }
});

// Add event listener for keyup event
// When user releases key (WASD):
// The value of the key property 'pressed' is set to false
window.addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'w':
      keys.w.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
    case 's':
      keys.s.pressed = false;
      break;
    case 'd':
      keys.d.pressed = false;
      break;
    default:
      break;
  }
});
