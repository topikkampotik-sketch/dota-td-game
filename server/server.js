// Внутри вашего io.on('connection', (socket) => { ... }) в server.js или roomHandler.js:

// Присоединение к комнате
socket.on('joinRoom', ({ roomCode, heroId }) => {
  socket.join(roomCode);

  // Оповещаем остальных в комнате
  socket.to(roomCode).emit('newPlayer', {
    id: socket.id,
    heroId: heroId || 'meepo',
    x: 120,
    y: 200
  });
});

// Синхронизация движения
socket.on('playerMovement', ({ roomCode, x, y }) => {
  socket.to(roomCode).emit('playerMoved', {
    id: socket.id,
    x,
    y
  });
});

// Синхронизация постройки башен
socket.on('buildTower', ({ roomCode, x, y, type }) => {
  socket.to(roomCode).emit('towerBuilt', { x, y, type });
});

// Синхронизация атак и скиллов
socket.on('useSkill', ({ roomCode, targetX, targetY, heroId }) => {
  socket.to(roomCode).emit('skillUsed', { targetX, targetY, heroId });
});

// Отключение
socket.on('disconnecting', () => {
  socket.rooms.forEach((room) => {
    socket.to(room).emit('playerDisconnected', socket.id);
  });
});