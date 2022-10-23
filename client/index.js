/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-globals */
import Boundary from './Boundary';
import Player from './Player';

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const localPlayer = new Player({
  position: {
    x: 1.5 * Boundary.width,
    y: 1.5 * Boundary.height,
  },
  velocity: {
    x: 0,
    y: 0,
  },
});

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

const boundaries = [];

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
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
    default:
      break;
  }
}));

const v = 2;

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

function animate() {
  requestAnimationFrame(animate);
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

  boundaries.forEach((boundary) => {
    boundary.draw(c);
    if (playerCollidesWithBoundary({ player: localPlayer, boundary })) {
      localPlayer.velocity.x = 0;
      localPlayer.velocity.y = 0;
    }
  });
  localPlayer.update(c);
  // player.velocity.x = 0;
  // player.velocity.y = 0;
}

animate();

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
