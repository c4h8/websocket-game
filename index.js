const io = require('socket.io')(4000, {
  cors: {
    origin: ['http://localhost:8080'],
  },
});

io.on('connection', (socket) => {
  console.log(socket.id);
  socket.on('send-player-info', (player) => {
    socket.broadcast.emit('receive-player-info', player);
  });
});
