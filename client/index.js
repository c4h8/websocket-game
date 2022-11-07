/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-globals */
import { io } from 'socket.io-client';


import Boundary from './Boundary';
import Player from './Player';
import Coin from './Coin';

const socket = io(import.meta.env.IS_PROD ? `${window.location.hostname}` : 'http://localhost:4000');

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoresDivElement = document.querySelector('#scores');
const myScoreElement = document.querySelector('#myScore');
const headerElement = document.querySelector('#header');

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastKey = '';

let coins = [];
const boundaries = [];

const v = 5;

function playerCollidesWithBoundary({
  player,
  boundary,
}) {
  return (
    player.position.y - player.radius + player.velocity.y <= boundary.position.y + boundary.height
      && player.position.x + player.radius + player.velocity.x >= boundary.position.x
      && player.position.y + player.radius + player.velocity.y >= boundary.position.y
      && player.position.x - player.radius + player.velocity.x
      <= boundary.position.x + boundary.width
  );
}

let localPlayer = null;
let players = [];

socket.on('create-game', ({ player, map }) => {
  canvas.width = Boundary.width * map[0].length;
  canvas.height = Boundary.height * map.length;

  localPlayer = new Player({
    startingPosition: player.startingPosition,
    color: player.color,
    id: player.id,
  });

  headerElement.innerHTML = `You are the ${localPlayer.color} circle`;
  headerElement.style.color = localPlayer.color;
  myScoreElement.style.color = localPlayer.color;

  createMap(map);
  animate(localPlayer);
});

socket.on('spectate', (map) => {
  headerElement.innerHTML = 'Spectating';
  createMap(map);
  spectate();
});

socket.on('add-player', player => {
  socket.emit('send-update-player-position', {
    position: localPlayer.position,
    velocity: localPlayer.velocity,
    id: localPlayer.id
  });

  const newPlayer = new Player({
    startingPosition: player.startingPosition,
    color: player.color,
    id: player.id,
  });

  newPlayer.velocity = player.velocity;

  const scoreElement = document.createElement('div');
  scoreElement.id = `${newPlayer.color}Player`;
  scoreElement.innerHTML = `${player.color} player score: ${player.score}`;
  scoreElement.style.color = player.color;

  scoresDivElement.appendChild(scoreElement);

  players = [newPlayer, ...players];
});

socket.on('update-player-position', player => {
  const anotherPlayer = players.find((p) => p.id === player.id);

  anotherPlayer.position.x = player.position.x;
  anotherPlayer.position.y = player.position.y;

  anotherPlayer.velocity.x = player.velocity.x;
  anotherPlayer.velocity.y = player.velocity.y;
});

socket.on('update-player-score-and-map', ({ player, removedCoin, newCoin }) => {
  coins = coins.filter((c) =>
    c.gridPosition.x !== removedCoin.gridPosition.x || c.gridPosition.y !== removedCoin.gridPosition.y
  );
  coins = [...coins, new Coin({ gridPosition: {
    x: newCoin.gridPosition.x,
    y: newCoin.gridPosition.y,
  }})]
  const anotherPlayer = players.find((p) => p.id === player.id);
  if (player.id === localPlayer.id) {
    localPlayer.score = player.score;
    myScoreElement.innerHTML = `My score: ${localPlayer.score}`;
  } else if (anotherPlayer) {
    anotherPlayer.score = player.score;
    const scoreElement = document.getElementById(`${anotherPlayer.color}Player`);
    scoreElement.innerHTML = `${anotherPlayer.color} player score: ${anotherPlayer.score}`;
  }
});

socket.on('delete-player', player => {
  players = players.filter((p) => p.id !== player.id);
  document.getElementById(`${player.color}Player`).remove()
});

let disconnected = false;

socket.on("disconnect", () => {
  players.forEach(player => document.getElementById(`${player.color}Player`).remove());
  players = [];
  disconnected = true
  headerElement.innerHTML = 'Disconnected';
  headerElement.style.color = 'white';
});

function createMap(map) {
  map.forEach((row, i) => row.forEach((symbol, j) => {
    switch (symbol) {
      case 1:
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
          }),
        );
        break;
      case 2:
        coins.push(
          new Coin({
            gridPosition: {
              x: j,
              y: i,
            }
          }),
        );
        break;
      default:
        break;
    }
  }));
}


const fps = 60;

function animate(localPlayer) {
  c.clearRect(0, 0, canvas.width, canvas.height);

  if (keys.w.pressed && lastKey === 'w') {
    const velocityBeforeUpdate = localPlayer.velocity.y;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (playerCollidesWithBoundary({
        player: {
          ...localPlayer,
          velocity: {
            x: 0,
            y: -v,
          },
        },
        boundary,
      })
      ) {
        localPlayer.velocity.y = 0;
        break;
      } else {
        localPlayer.velocity.y = -v;
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
            x: -v,
            y: 0,
          },
        },
        boundary,
      })
      ) {
        localPlayer.velocity.x = -0;
        break;
      } else {
        localPlayer.velocity.x = -v;
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
            y: v,
          },
        },
        boundary,
      })
      ) {
        localPlayer.velocity.y = 0;
        break;
      } else {
        localPlayer.velocity.y = v;
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
            x: v,
            y: 0,
          },
        },
        boundary,
      })
      ) {
        localPlayer.velocity.x = -0;
        break;
      } else {
        localPlayer.velocity.x = v;
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
  
  players.forEach((p) => p.update(c));

  localPlayer.update(c);

  if (!disconnected) {
    setTimeout(() => {
      requestAnimationFrame(() => animate(localPlayer));
    }, 1000 / fps);
  }
}

function spectate() {
  c.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    coin.draw(c);
  }

  boundaries.forEach((boundary) => {
    boundary.draw(c);
  });
  
  players.forEach((p) => p.draw(c));

  setTimeout(() => {
    requestAnimationFrame(spectate);
  }, 1000 / fps);
}

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
    default:
      break;
  }
});

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
