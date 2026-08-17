
import { socket } from './network/socketClient.js';
import { HubScene } from './scenes/HubScene.js';
import { MapScene } from './scenes/MapScene.js';
import { BattleScene } from './scenes/BattleScene.js';

// Инициализируем сокет-соединение
socketClient.connect();

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [HubScene, MapScene, BattleScene]
};

window.game = new Phaser.Game(config);