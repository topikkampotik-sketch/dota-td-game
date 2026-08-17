import Phaser from 'phaser';

export class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
  }

  init(data) {
    this.roomCode = data.roomCode || 'ROOM1';
    this.heroId = data.heroId || 'meepo';
    this.currentLevel = data.currentLevel || 1;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1e1b4b);

    this.add.text(width / 2, 50, 'КАРТА КАМПАНИИ (100 УРОВНЕЙ)', {
      fontSize: '32px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Сетка уровней
    for (let i = 1; i <= 10; i++) {
      const x = 200 + (i - 1) * 95;
      const y = height / 2;

      const isCompleted = i < this.currentLevel;
      const isCurrent = i === this.currentLevel;
      const color = isCurrent ? 0xf59e0b : (isCompleted ? 0x10b981 : 0x4b5563);

      const node = this.add.circle(x, y, 30, color)
        .setInteractive({ useHandCursor: isCurrent });

      this.add.text(x, y, `${i}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      if (isCurrent) {
        node.on('pointerdown', () => {
          this.scene.start('BattleScene', {
            level: i,
            heroId: this.heroId,
            roomCode: this.roomCode
          });
        });
      }
    }

    this.add.text(width / 2, height - 80, 'Нажмите на активный уровень для начала боя', {
      fontSize: '18px',
      color: '#9ca3af'
    }).setOrigin(0.5);
  }
}