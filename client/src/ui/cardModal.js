export class CardModal {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
  }

  show(cardData, onSelect) {
    const { width, height } = this.scene.scale;

    this.container = this.scene.add.container(width / 2, height / 2).setDepth(500);

    const bg = this.scene.add.rectangle(0, 0, 320, 420, 0x0f172a, 0.95)
      .setStrokeStyle(2, 0x3b82f6);

    const title = this.scene.add.text(0, -160, cardData.name || 'Карточка Усиления', {
      fontSize: '20px', color: '#60a5fa', style: 'bold'
    }).setOrigin(0.5);

    const desc = this.scene.add.text(0, -80, cardData.description || 'Описание эффекта...', {
      fontSize: '14px', color: '#cbd5e1', align: 'center', wordWrap: { width: 280 }
    }).setOrigin(0.5);

    const btnBg = this.scene.add.rectangle(0, 140, 160, 40, 0x22c55e)
      .setInteractive({ useHandCursor: true });

    const btnText = this.scene.add.text(0, 140, 'ВЫБРАТЬ', {
      fontSize: '16px', color: '#ffffff', style: 'bold'
    }).setOrigin(0.5);

    btnBg.on('pointerdown', () => {
      if (onSelect) onSelect(cardData);
      this.close();
    });

    this.container.add([bg, title, desc, btnBg, btnText]);
  }

  close() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}