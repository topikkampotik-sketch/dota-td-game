import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    // Укажите порт вашего бэкенд-сервера
    this.socket = io('http://localhost:3000'); 
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