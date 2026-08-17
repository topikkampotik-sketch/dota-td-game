import Phaser from 'phaser';
import { socketClient } from '../network/socketClient';

export class HubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HubScene' });
    this.selectedHero = 'meepo';
  }

  create() {
    const { width, height } = this.scale;

    // Задний фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x111827);

    // Заголовок
    this.add.text(width / 2, 80, 'DOTA DUO: KINGDOM DEFENSE', {
      fontSize: '42px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 130, 'Кооперативный Action-TD Roguelike', {
      fontSize: '20px',
      color: '#9ca3af'
    }).setOrigin(0.5);

    // Выбор героев
    this.add.text(width / 2, 220, 'ВЫБЕРИТЕ ГЕРОЯ:', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const heroes = [
      { id: 'meepo', name: 'Meepo', color: 0x8b5cf6, x: width / 2 - 200 },
      { id: 'sf', name: 'Shadow Fiend', color: 0xef4444, x: width / 2 },
      { id: 'tb', name: 'Terrorblade', color: 0x06b6d4, x: width / 2 + 200 }
    ];

    heroes.forEach(h => {
      const card = this.add.rectangle(h.x, 320, 160, 140, h.color, 0.2)
        .setStrokeStyle(2, 0x4b5563)
        .setInteractive({ useHandCursor: true });

      const nameText = this.add.text(h.x, 320, h.name, {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      card.on('pointerdown', () => {
        this.selectedHero = h.id;
        heroes.forEach(other => other.cardObj.setStrokeStyle(2, 0x4b5563));
        card.setStrokeStyle(4, 0x10b981);
      });

      h.cardObj = card;
      if (h.id === 'meepo') card.setStrokeStyle(4, 0x10b981);
    });

    // Кнопка Вход в Игру / Подключение
    const startBtn = this.add.rectangle(width / 2, 520, 260, 60, 0x10b981)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, 520, 'ГОТОВ К БОЮ', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    startBtn.on('pointerdown', () => {
      const roomCode = 'ROOM1';
      const nickname = 'Player_' + Math.floor(Math.random() * 1000);

      socketClient.joinRoom(roomCode, nickname, this.selectedHero);
      this.scene.start('MapScene', { roomCode, heroId: this.selectedHero });
    });
  }
}