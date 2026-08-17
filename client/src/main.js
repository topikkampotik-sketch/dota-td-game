import Phaser from 'phaser';
import { socketClient } from './network/socketClient';
import { HubScene } from './scenes/HubScene';
import { MapScene } from './scenes/MapScene';
import { BattleScene } from './scenes/BattleScene';

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