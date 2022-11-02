/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-globals */
import { io } from 'socket.io-client';

import Boundary from './Boundary';
import Player from './Player';
import Coin from './Coin';

const socket = io('http://localhost:4000');

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreSpan = document.querySelector('#score');
const header = document.querySelector('#header');

canvas.width = innerWidth;
canvas.height = innerHeight;

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

const coins = [];
const boundaries = [];

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
          position: {
            x: Boundary.width * j + Boundary.width / 2,
            y: Boundary.height * i + Boundary.height / 2,
          },
        }),
      );
      break;
    default:
      break;
  }
}));

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

let players = [];

socket.on('create-player', player => {
  console.log(player);
  const localPlayer = new Player({
    position: player.position,
    color: player.color,
    id: player.id,
  });

  animate(localPlayer);
});

socket.on('spectate', () => {
  header.innerHTML = 'Spectating';
  spectate();
});

socket.on('add-player', player => {
  const newPlayer = new Player({
    position: player.position,
    color: player.color,
    id: player.id,
  });

  players = [newPlayer, ...players];
});

socket.on('update-player', player => {
  const specificPlayer = players.find((p) => p.id === player.id);

  specificPlayer.position.x = player.position.x;
  specificPlayer.position.y = player.position.y;
});

socket.on('delete-player', player => {
  players = players.filter((p) => p.id !== player.id);
});

const fps = 60;

function animate(localPlayer) {
  c.clearRect(0, 0, canvas.width, canvas.height);

  if (keys.w.pressed && lastKey === 'w') {
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
  } else if (keys.a.pressed && lastKey === 'a') {
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
  } else if (keys.s.pressed && lastKey === 's') {
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
  } else if (keys.d.pressed && lastKey === 'd') {
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
  }

  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    coin.draw(c);

    if (Math.hypot(
      coin.position.x - localPlayer.position.x,
      coin.position.y - localPlayer.position.y,
    ) < coin.radius + localPlayer.radius
    ) {
      coins.splice(i, 1);
      localPlayer.score += 1;
      scoreSpan.innerHTML = `Score: ${localPlayer.score}`;
    }
  }

  boundaries.forEach((boundary) => {
    boundary.draw(c);
    if (playerCollidesWithBoundary({ player: localPlayer, boundary })) {
      localPlayer.velocity.x = 0;
      localPlayer.velocity.y = 0;
    }
  });
  
  players.forEach((p) => p.draw(c));

  localPlayer.update(c);

  socket.emit('send-update-player', { position: localPlayer.position, velocity: localPlayer.velocity, id: localPlayer.id });

  setTimeout(() => {
    requestAnimationFrame(() => animate(localPlayer));
  }, 1000 / fps);
}

function spectate() {
  c.clearRect(0, 0, canvas.width, canvas.height);

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
