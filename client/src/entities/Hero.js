
export class Hero extends Phaser.GameObjects.Arc {
  constructor(scene, x, y, heroId = 'meepo') {
    super(scene, x, y, 18, 0, 360, false, 0x3b82f6);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.heroId = heroId;
    this.speed = 180;
    this.hp = 300;
    this.maxHp = 300;

    // Параметры способности (Q)
    this.lastSkillTime = 0;
    this.skillCooldown = 4000; // 4 секунды КД
    this.isTransformed = false; // Для ТБ (Метаморфоза)

    this.applyHeroStats();
  }

  applyHeroStats() {
    if (this.heroId === 'sf') {
      this.setFillStyle(0xd97706); // Оранжевый/Огненный
    } else if (this.heroId === 'tb') {
      this.setFillStyle(0x7c3aed); // Фиолетовый
    } else {
      this.setFillStyle(0x3b82f6); // Синий (Мипо)
    }
  }

  moveByVector(dx, dy) {
    if (!this.body) return;
    const speed = this.isTransformed ? this.speed * 1.2 : this.speed;
    this.body.setVelocity(dx * speed, dy * speed);
  }

  attack(targetX, targetY) {
    // Базовая атака
    const range = this.isTransformed ? 220 : 60;
    const bulletColor = this.isTransformed ? 0x7c3aed : 0xffffff;

    const bullet = this.scene.add.circle(this.x, this.y, 6, bulletColor);
    this.scene.physics.add.existing(bullet);
    this.scene.physics.moveTo(bullet, targetX, targetY, 400);

    this.scene.physics.add.overlap(bullet, this.scene.enemies, (b, enemy) => {
      enemy.takeDamage(this.isTransformed ? 60 : 30);
      b.destroy();
    });

    this.scene.time.delayedCall(600, () => {
      if (bullet.active) bullet.destroy();
    });
  }

  // --- ИСПОЛЬЗОВАНИЕ СПОСОБНОСТИ (Q) ---
  useSkill(targetX, targetY) {
    const time = this.scene.time.now;
    if (time - this.lastSkillTime < this.skillCooldown) {
      return false; // Еще на перезарядке
    }

    this.lastSkillTime = time;

    // 1. МИПО — СЕТКА (Earthbind)
    if (this.heroId === 'meepo') {
      const net = this.scene.add.circle(targetX, targetY, 70, 0x10b981, 0.4);
      net.setStrokeStyle(3, 0x059669);

      this.scene.enemies.getChildren().forEach(enemy => {
        if (enemy.active && Phaser.Math.Distance.Between(targetX, targetY, enemy.x, enemy.y) <= 70) {
          enemy.takeDamage(40);
          // Замораживаем моба на 2.5 сек
          const oldSpeed = enemy.speed;
          enemy.speed = 0;
          this.scene.time.delayedCall(2500, () => {
            if (enemy.active) enemy.speed = oldSpeed;
          });
        }
      });

      this.scene.tweens.add({ targets: net, alpha: 0, duration: 1500, onComplete: () => net.destroy() });
    }

    // 2. СФ — КОЙЛ (Shadowraze)
    else if (this.heroId === 'sf') {
      const razeX = this.x + 80;
      const razeY = this.y;

      const razeEffect = this.scene.add.circle(razeX, razeY, 60, 0xd97706, 0.6);
      this.scene.tweens.add({ targets: razeEffect, scale: 1.4, alpha: 0, duration: 400, onComplete: () => razeEffect.destroy() });

      this.scene.enemies.getChildren().forEach(enemy => {
        if (enemy.active && Phaser.Math.Distance.Between(razeX, razeY, enemy.x, enemy.y) <= 80) {
          enemy.takeDamage(120); // Ощутимый урон
        }
      });
    }

    // 3. ТБ — МЕТАМОРФОЗА (Metamorphosis)
    else if (this.heroId === 'tb') {
      this.isTransformed = true;
      this.setScale(1.5);
      this.setFillStyle(0x4c1d95); // Темно-фиолетовый демон

      // Эффект превращения
      const aura = this.scene.add.circle(this.x, this.y, 40, 0x7c3aed, 0.5);
      this.scene.tweens.add({ targets: aura, scale: 2, alpha: 0, duration: 500, onComplete: () => aura.destroy() });

      // Возврат в обычную форму через 8 секунд
      this.scene.time.delayedCall(8000, () => {
        this.isTransformed = false;
        this.setScale(1.0);
        this.applyHeroStats();
      });
    }

    return true;
  }
}