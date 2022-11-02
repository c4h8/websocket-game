const io = require('socket.io')(4000, {
  cors: {
    origin: ['http://localhost:8080'],
  },
});

const Player = require('./models/Player');

let players = [];
let startingPositions = [
  { x: 60, y: 60 },
  { x: 60, y: 380 },
  { x: 700, y: 60 },
  { x: 700, y: 380 }];
let colors = ['red', 'yellow', 'blue', 'orange'];

io.on('connection', (socket) => {
  console.log('CONNECTED');

  const thisPlayer = new Player({
    position: startingPositions[0],
    color: colors[0],
    id: socket.id,
  });

  if (players.length < 4) {
    colors = colors.filter((c) => c !== colors[0]);
    startingPositions = startingPositions.filter((p) => p !== startingPositions[0]);

    socket.emit('create-player', thisPlayer);

    players.forEach((p) => socket.emit('add-player', p));

    players = [thisPlayer, ...players];

    socket.broadcast.emit('add-player', thisPlayer);
  } else {
    socket.emit('spectate');
    players.forEach((p) => socket.emit('add-player', p));
  }

  socket.on('send-update-player', (player) => {
    socket.broadcast.emit('update-player', player);
  });

  socket.on('disconnect', () => {
    const player = players.find((p) => p.id === socket.id);
    if (player) {
      colors = [player.color, ...colors];
      startingPositions = [player.startingPosition, ...startingPositions];

      players = players.filter((p) => p.id !== socket.id);

      socket.broadcast.emit('delete-player', player);
    }
    console.log('CONNECTION CLOSED');
  });
});
