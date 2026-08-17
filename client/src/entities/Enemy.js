
export class Enemy extends Phaser.GameObjects.Arc {
  constructor(scene, x, y, wave = 1, level = 1, type = 'orc') {
    // 🎨 Визуальные и базовые характеристики типов крипов
    const enemyConfigs = {
      goblin: { color: 0x22c55e, radius: 10, hpMult: 0.7, speedMult: 1.4, bountyMult: 0.8, name: 'Гоблин' },
      orc:    { color: 0xef4444, radius: 14, hpMult: 1.0, speedMult: 1.0, bountyMult: 1.0, name: 'Орк' },
      dwarf:  { color: 0x64748b, radius: 16, hpMult: 1.8, speedMult: 0.7, bountyMult: 1.3, name: 'Дварф' },
      elf:    { color: 0xa855f7, radius: 12, hpMult: 0.8, speedMult: 1.2, bountyMult: 1.5, name: 'Эльф' },
      boss:   { color: 0xf59e0b, radius: 22, hpMult: 5.0, speedMult: 0.6, bountyMult: 4.0, name: 'Босс' }
    };

    const config = enemyConfigs[type] || enemyConfigs.orc;

    // Рисуем кружок соответствующего размера и цвета
    super(scene, x, y, config.radius, 0, 360, false, config.color);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type;
    this.wave = wave;
    this.level = level;

    // 📈 ДВОЙНОЕ МАСШТАБИРОВАНИЕ (Уровень * Волна):
    // Каждый новый уровень карты (+50% сложность: x1.5^(level - 1))
    const levelFactor = Math.pow(1.5, level - 1);
    // Каждая новая волна (+20% сложность: x1.2^(wave - 1))
    const waveFactor = Math.pow(1.2, wave - 1);

    const baseHp = 40;
    this.maxHp = Math.round(baseHp * config.hpMult * levelFactor * waveFactor);
    this.hp = this.maxHp;

    // Скорость моба (с легким приростом с волнами)
    this.speed = Math.min((80 * config.speedMult) + (wave * 2), 180);

    // 🪙 Золото с крипа растет и от волны, и от уровня карты
    const baseBounty = 12;
    this.bounty = Math.round((baseBounty + (wave * 2)) * config.bountyMult * (1 + (level - 1) * 0.4));

    // Полоска здоровья
    this.hpBar = scene.add.graphics();
    this.updateHpBar();
  }

  update() {
    if (this.body) {
      this.body.setVelocityX(this.speed);
    }

    this.updateHpBar();

    // Проверка дошел ли моб до Базы
    if (this.x >= this.scene.scale.width - 80) {
      const dmg = this.type === 'boss' ? 3 : 1;
      this.scene.damageBase(dmg);
      this.destroyEnemy();
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.scene.gold += this.bounty;
      this.scene.hudGold.setText(`🪙 Золото: ${this.scene.gold}`);
      this.destroyEnemy();
    }
  }

  updateHpBar() {
    if (!this.hpBar) return;
    this.hpBar.clear();

    const width = this.type === 'boss' ? 36 : 24;
    const height = 4;
    const x = this.x - width / 2;
    const y = this.y - (this.type === 'boss' ? 26 : 20);

    // Черный фон
    this.hpBar.fillStyle(0x000000);
    this.hpBar.fillRect(x, y, width, height);

    // Зеленый / красный цвет здоровья
    const hpPercent = Math.max(0, this.hp / this.maxHp);
    const color = hpPercent > 0.3 ? 0x22c55e : 0xef4444;
    this.hpBar.fillStyle(color);
    this.hpBar.fillRect(x, y, width * hpPercent, height);
  }

  destroyEnemy() {
    if (this.hpBar) this.hpBar.destroy();
    this.destroy();
  }
}