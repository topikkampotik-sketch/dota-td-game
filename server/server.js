const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Настройка Socket.io с поддержкой CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Разрешает подключение с любых доменов (GitHub Pages, localhost и т.д.)
    methods: ["GET", "POST"]
  }
});

// Слушаем подключения клиентов
io.on('connection', (socket) => {
  console.log('Игрок подключился:', socket.id);

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

  socket.on('disconnect', () => {
    console.log('Игрок отключился:', socket.id);
  });
});

// Render динамически передает PORT, по умолчанию используем 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});