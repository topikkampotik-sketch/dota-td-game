const { savePlayerData, getRoomSave } = require('../database/storage');

function handleSaveEvents(io, socket) {
  // Запрос сохранения по требованию клиента
  socket.on('requestSave', ({ roomCode, gameData }) => {
    savePlayerData(roomCode, gameData);
    socket.emit('saveCompleted', { status: 'ok', timestamp: new Date() });
  });

  // Загрузка мета-прогресса
  socket.on('loadProgress', ({ roomCode }) => {
    const data = getRoomSave(roomCode);
    socket.emit('progressLoaded', data);
  });
}

module.exports = { handleSaveEvents };