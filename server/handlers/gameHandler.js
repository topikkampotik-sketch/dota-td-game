const CARDS_DATABASE = require('../data/cardsDatabase');
const { savePlayerData } = require('../database/storage');
const { rooms } = require('./roomHandler');

function handleGameEvents(io, socket) {
  // Статус АФК (💤)
  socket.on('setAfkStatus', ({ roomCode, isAfk }) => {
    if (rooms[roomCode]) {
      const player = rooms[roomCode].players.find(p => p.id === socket.id);
      if (player) {
        player.isAfk = isAfk;
        io.to(roomCode).emit('playerAfkChanged', { playerId: socket.id, isAfk });
      }
    }
  });

  // Запрос 3 рогалик-карточек с шансом редкости
  socket.on('getCards', ({ roomCode }) => {
    const getRandomCard = () => {
      const rand = Math.random();
      let rarity = 'Common';
      if (rand > 0.60) rarity = 'Rare';      // 30% Rare
      if (rand > 0.88) rarity = 'Epic';      // 9% Epic
      if (rand > 0.97) rarity = 'Legendary'; // 3% Legendary

      const pool = CARDS_DATABASE.filter(c => c.rarity === rarity);
      const finalPool = pool.length > 0 ? pool : CARDS_DATABASE.filter(c => c.rarity === 'Common');
      return finalPool[Math.floor(Math.random() * finalPool.length)];
    };

    const offeredCards = [];
    while (offeredCards.length < 3) {
      const card = getRandomCard();
      if (!offeredCards.some(c => c.id === card.id)) {
        offeredCards.push(card);
      }
    }

    socket.emit('offerCards', offeredCards);
  });

  // Завершение уровня (Победа)
  socket.on('levelCompleted', ({ roomCode, levelPassed }) => {
    if (rooms[roomCode]) {
      rooms[roomCode].currentLevel = Math.max(rooms[roomCode].currentLevel, levelPassed + 1);
      rooms[roomCode].teamGold += 150;

      // Автосохранение
      savePlayerData(roomCode, {
        currentLevel: rooms[roomCode].currentLevel,
        teamGold: rooms[roomCode].teamGold
      });

      io.to(roomCode).emit('roomStateUpdate', rooms[roomCode]);
    }
  });
}

module.exports = { handleGameEvents };