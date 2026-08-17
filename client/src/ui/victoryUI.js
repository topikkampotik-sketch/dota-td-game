export class VictoryUI {
  constructor(scene) {
    this.scene = scene;
  }

  showVictory(onRestart) {
    this.createResultScreen('🎉 ПОБЕДА!', 'Все волны отражены!', 0x22c55e, onRestart);
  }

  showDefeat(onRestart) {
    this.createResultScreen('💀 ПОРАЖЕНИЕ!', 'База была уничтожена', 0xef4444, onRestart);
  }

  createResultScreen(titleText, subText, colorHex, onRestart) {
    const { width, height } = this.scene.scale;

    const container = this.scene.add.container(width / 2, height / 2).setDepth(600);

    const bg = this.scene.add.rectangle(0, 0, 400, 250, 0x0f172a, 0.95)
      .setStrokeStyle(3, colorHex);

    const title = this.scene.add.text(0, -60, titleText, {
      fontSize: '32px', color: '#ffffff', style: 'bold'
    }).setOrigin(0.5);

    const sub = this.scene.add.text(0, -10, subText, {
      fontSize: '16px', color: '#cbd5e1'
    }).setOrigin(0.5);

    const btn = this.scene.add.rectangle(0, 60, 180, 45, colorHex)
      .setInteractive({ useHandCursor: true });

    const btnText = this.scene.add.text(0, 60, 'В МЕНЮ', {
      fontSize: '18px', color: '#ffffff', style: 'bold'
    }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      container.destroy();
      if (onRestart) onRestart();
    });

    container.add([bg, title, sub, btn, btnText]);
  }
}