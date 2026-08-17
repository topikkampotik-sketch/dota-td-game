const { getRoomSave, savePlayerData } = require('../database/storage');

const rooms = {};

function handleRoomEvents(io, socket) {
  // Подключение к комнате
  socket.on('joinRoom', ({ roomCode, nickname, heroId }) => {
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.nickname = nickname;

    if (!rooms[roomCode]) {
      const savedData = getRoomSave(roomCode);
      rooms[roomCode] = {
        code: roomCode,
        players: [],
        currentLevel: savedData.currentLevel || 1,
        teamGold: savedData.teamGold || 250
      };
    }

    const room = rooms[roomCode];
    const existingPlayer = room.players.find(p => p.id === socket.id);

    if (!existingPlayer && room.players.length < 2) {
      room.players.push({
        id: socket.id,
        nickname: nickname,
        heroId: heroId || 'sven',
        isAfk: false
      });
    }

    io.to(roomCode).emit('roomStateUpdate', room);
  });

  // Отключение игрока
  socket.on('disconnect', () => {
    const roomCode = socket.roomCode;
    if (roomCode && rooms[roomCode]) {
      rooms[roomCode].players = rooms[roomCode].players.filter(p => p.id !== socket.id);
      io.to(roomCode).emit('roomStateUpdate', rooms[roomCode]);
    }
  });
}

module.exports = { handleRoomEvents, rooms };