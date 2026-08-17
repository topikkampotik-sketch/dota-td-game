export class BattleUI {
  constructor(scene) {
    this.scene = scene;
  }

  createHUD(baseHp, gold, wave, maxWaves) {
    this.hudHp = this.scene.add.text(30, 20, `❤️ База HP: ${baseHp}`, { fontSize: '18px', color: '#ef4444' }).setScrollFactor(0).setDepth(300);
    this.hudGold = this.scene.add.text(220, 20, `🪙 Золото: ${gold}`, { fontSize: '18px', color: '#f59e0b' }).setScrollFactor(0).setDepth(300);
    this.hudWave = this.scene.add.text(400, 20, `🌊 Волна: ${wave}/${maxWaves}`, { fontSize: '18px', color: '#3b82f6' }).setScrollFactor(0).setDepth(300);
  }

  updateHp(hp) {
    if (this.hudHp) this.hudHp.setText(`❤️ База HP: ${Math.max(0, hp)}`);
  }

  updateGold(gold) {
    if (this.hudGold) this.hudGold.setText(`🪙 Золото: ${gold}`);
  }

  updateWave(wave, maxWaves) {
    if (this.hudWave) this.hudWave.setText(`🌊 Волна: ${wave}/${maxWaves}`);
  }

  flashGoldError() {
    if (this.hudGold) {
      this.hudGold.setColor('#ef4444');
      this.scene.time.delayedCall(500, () => this.hudGold.setColor('#f59e0b'));
    }
  }
}