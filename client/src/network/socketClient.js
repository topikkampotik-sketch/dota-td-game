import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    // Подключение к развернутому серверу на Render
    this.socket = io('https://dota-td-game-server.onrender.com'); 
  }

  joinRoom(roomCode, heroId) {
    this.socket.emit('joinRoom', { roomCode, heroId });
  }

  sendMovement(roomCode, x, y) {
    this.socket.emit('playerMovement', { roomCode, x, y });
  }

  sendBuildTower(roomCode, x, y, type) {
    this.socket.emit('buildTower', { roomCode, x, y, type });
  }

  sendSkill(roomCode, targetX, targetY, heroId) {
    this.socket.emit('useSkill', { roomCode, targetX, targetY, heroId });
  }
}

export const socketClient = new SocketClient();