const fs = require('fs');
const path = require('path');

const SAVE_FILE = path.join(__dirname, 'saves.json');

// Загрузка всех сохранений
function loadSaves() {
  if (!fs.existsSync(SAVE_FILE)) {
    fs.writeFileSync(SAVE_FILE, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    const data = fs.readFileSync(SAVE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Ошибка чтения saves.json:', err);
    return {};
  }
}

// Сохранение профиля игрока по комнате/нику
function savePlayerData(roomCode, data) {
  const saves = loadSaves();
  saves[roomCode] = {
    ...saves[roomCode],
    ...data,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(SAVE_FILE, JSON.stringify(saves, null, 2));
}

// Получение данных комнаты
function getRoomSave(roomCode) {
  const saves = loadSaves();
  return saves[roomCode] || { currentLevel: 1, teamGold: 250, talentTree: {} };
}

module.exports = { savePlayerData, getRoomSave };