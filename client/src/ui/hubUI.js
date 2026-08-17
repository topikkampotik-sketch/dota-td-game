export class HubUI {
  constructor(scene) {
    this.scene = scene;
  }

  createHubMenu(onStartGame) {
    const { width, height } = this.scene.scale;

    const title = this.scene.add.text(width / 2, 100, 'DOTA TOWER DEFENSE', {
      fontSize: '32px', color: '#f59e0b', style: 'bold'
    }).setOrigin(0.5);

    const startBtn = this.scene.add.rectangle(width / 2, height / 2, 220, 50, 0x3b82f6)
      .setInteractive({ useHandCursor: true });

    const startText = this.scene.add.text(width / 2, height / 2, 'В БОЙ (CO-OP)', {
      fontSize: '20px', color: '#ffffff', style: 'bold'
    }).setOrigin(0.5);

    startBtn.on('pointerdown', () => {
      if (onStartGame) onStartGame();
    });
  }
}