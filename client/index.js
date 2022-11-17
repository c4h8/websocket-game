/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-globals */
import { io } from 'socket.io-client';


import Boundary from './classes/Boundary';
import Player from './classes/Player';
import Coin from './classes/Coin';
import PowerUp from './classes/PowerUp';

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

// Creates the local player and the map, and starts the game loop
socket.on('create-game', ({ player, map }) => {
  canvas.width = Boundary.width * map[0].length;
  canvas.height = Boundary.height * map.length;

  localPlayer = new Player({
    startingPosition: player.startingPosition,
    color: 'red',
    id: player.id,
    name: player.name,
  });

  headerElement.innerHTML = `You are the ${localPlayer.color} circle`;
  headerElement.style.color = localPlayer.color;
  myScoreElement.style.color = localPlayer.color;

  powerUp = createMap(map, boundaries, coins);

  gameLoop(localPlayer);
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
  });

  newPlayer.velocity = player.velocity;

  const scoreElement = document.createElement('div');
  scoreElement.id = newPlayer.name;
  scoreElement.innerHTML = `${newPlayer.name} score: ${player.score}`;
  scoreElement.style.color = newPlayer.color;

  scoresDivElement.appendChild(scoreElement);

  players = [newPlayer, ...players];
});

// Updates the position and velocity of the opponent
socket.on('update-player-position', player => {
  const anotherPlayer = players.find((p) => p.id === player.id);

  if (anotherPlayer) {
    anotherPlayer.position.x = player.position.x;
    anotherPlayer.position.y = player.position.y;

    anotherPlayer.velocity.x = player.velocity.x;
    anotherPlayer.velocity.y = player.velocity.y;
  }
});

// Removes the collected coin from the map and adds a new coin to the map
// Updates the score of the player who collected the coin
socket.on('update-player-score-and-map', ({ player, removedCoin, newCoinGridPosition }) => {
  coins = coins.filter((c) =>
    c.gridPosition.x !== removedCoin.gridPosition.x || c.gridPosition.y !== removedCoin.gridPosition.y
  );
  coins = [...coins, new Coin({ gridPosition: {
    x: newCoinGridPosition.x,
    y: newCoinGridPosition.y,
  }})]
  const anotherPlayer = players.find((p) => p.id === player.id);
  if (localPlayer && player.id === localPlayer.id) {
    localPlayer.score = player.score;
    myScoreElement.innerHTML = `My score: ${localPlayer.score}`;
  } else if (anotherPlayer) {
    anotherPlayer.score = player.score;
    const scoreElement = document.getElementById(anotherPlayer.name);
    scoreElement.innerHTML = `${anotherPlayer.name} score: ${anotherPlayer.score}`;
  }
});

// Removes a player (opponent) from a list of players
socket.on('delete-player', player => {
  players = players.filter((p) => p.id !== player.id);
  document.getElementById(player.name).remove()
});

// Removes a powerup from the map
socket.on('remove-powerup', (newPowerUpGridPosition) => {
  powerUp = null;
});

// Adds a powerup to the map
socket.on('add-powerup', (newPowerUpGridPosition) => {
  powerUp = new PowerUp({
    gridPosition: newPowerUpGridPosition
  });
});

// Removes the players and their scores from the screen
socket.on("disconnect", () => {
  players.forEach(player => document.getElementById(player.name).remove());
  players = [];
  disconnected = true
  headerElement.innerHTML = 'Disconnected';
  headerElement.style.color = 'white';
});

// The main game loop which is looped fps times a second
function gameLoop(localPlayer) {
  // Clear the canvas
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Change the direction of the player if:
  // 1. User has pressed a new key, and
  // 2. Changing the direction does not break the rules of the game
  if (keys.w.pressed && lastKey === 'w') {
    const velocityBeforeUpdate = localPlayer.velocity.y;
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
    if (localPlayer.velocity.y !== velocityBeforeUpdate) {
      socket.emit('send-update-player-position', {
        position: localPlayer.position,
        velocity: localPlayer.velocity,
        id: localPlayer.id
      });
    }
  } else if (keys.a.pressed && lastKey === 'a') {
    const velocityBeforeUpdate = localPlayer.velocity.x;
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
    if (localPlayer.velocity.x !== velocityBeforeUpdate) {
      socket.emit('send-update-player-position', {
        position: localPlayer.position,
        velocity: localPlayer.velocity,
        id: localPlayer.id
      });
    }
  } else if (keys.s.pressed && lastKey === 's') {
    const velocityBeforeUpdate = localPlayer.velocity.y;
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
    if (localPlayer.velocity.y !== velocityBeforeUpdate) {
      socket.emit('send-update-player-position', {
        position: localPlayer.position,
        velocity: localPlayer.velocity,
        id: localPlayer.id
      });
    }
  } else if (keys.d.pressed && lastKey === 'd') {
    const velocityBeforeUpdate = localPlayer.velocity.x;
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
    if (localPlayer.velocity.x !== velocityBeforeUpdate) {
      socket.emit('send-update-player-position', {
        position: localPlayer.position,
        velocity: localPlayer.velocity,
        id: localPlayer.id
      });
    }
  }

  // Render the coins on the screen
  // If coin is collected:
  // 1. Send a message to the server
  // 2. Remove the collected coin from the screen
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    coin.draw(c);

    if (Math.hypot(
      coin.position.x - localPlayer.position.x,
      coin.position.y - localPlayer.position.y,
    ) < coin.radius + localPlayer.radius
    ) {
      socket.emit('send-update-player-score', { gridPosition: {
        x: coin.gridPosition.x,
        y: coin.gridPosition.y
      }});
      coins.splice(i, 1);
    }
  }

  // Render the powerup on the screen
  // If powerup is collected:
  // 1. Double the velocity of the local player
  // 2. Send a message to the server
  // 3. Remove the collected powerup from the screen
  if(powerUp) {
    powerUp.draw(c);

    if (Math.hypot(
      powerUp.position.x - localPlayer.position.x,
      powerUp.position.y - localPlayer.position.y,
    ) < powerUp.radius + localPlayer.radius
    ) {
      velocity = 10;
      localPlayer.velocity.x *= 2;
      localPlayer.velocity.y *= 2;
      socket.emit('send-update-powerup', powerUp);
      powerUp = null;
      socket.emit('send-update-player-position', {
        position: localPlayer.position,
        velocity: localPlayer.velocity,
        id: localPlayer.id
      });
      setTimeout(function() {
        velocity = 5;
        localPlayer.velocity.x /= 2;
        localPlayer.velocity.y /= 2;
        socket.emit('send-update-player-position', {
          position: localPlayer.position,
          velocity: localPlayer.velocity,
          id: localPlayer.id
        });
      }, 5000);
    }
  }

  // Render the boundaries on the screen
  // If player is colliding with the boundary, set the velocity of the player to 0
  boundaries.forEach((boundary) => {
    boundary.draw(c);
    if (playerCollidesWithBoundary({ player: localPlayer, boundary })) {
      localPlayer.velocity.x = 0;
      localPlayer.velocity.y = 0;
    }
    players.forEach(player => {
      if (playerCollidesWithBoundary({ player, boundary })) {
        player.velocity.x = 0;
        player.velocity.y = 0;
      }
    })
  });
  
  // Update the positions of the players and draw them on the screen
  players.forEach((p) => p.update(c));
  localPlayer.update(c);

  if (!disconnected) {
    setTimeout(() => {
      requestAnimationFrame(() => gameLoop(localPlayer));
    }, 1000 / fps);
  }
}


// A function for spectating the game
function spectate() {
  c.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    coin.draw(c);
  }

  boundaries.forEach((boundary) => {
    boundary.draw(c);
    players.forEach(player => {
      if (playerCollidesWithBoundary({ player, boundary })) {
        player.velocity.x = 0;
        player.velocity.y = 0;
      }
    })
  });
  
  players.forEach((p) => p.update(c));

  setTimeout(() => {
    requestAnimationFrame(spectate);
  }, 1000 / fps);
}


const measureRTT = () => {
  const t = performance.now();

  socket.emit('get-rtt', (res) => {
    const t2 = performance.now();
    console.log(res);
    console.log("rtt: ", t2-t);
    console.log("connection: ", socket.io?.engine?.transport?.name);
  })
}

const saveSnapshot = () => {
  socket.emit('save-statistics')
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
    case 'o':
      saveSnapshot();
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