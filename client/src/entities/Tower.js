import Phaser from 'phaser';

// Юнит Свена из Бараков
export class SvenUnit extends Phaser.GameObjects.Arc {
  constructor(scene, x, y, level = 1) {
    const isArcana = level >= 4;
    super(scene, x, y, isArcana ? 16 : 14, 0, 360, false, isArcana ? 0xef4444 : 0x3b82f6);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = 180 + (level - 1) * 60;
    this.damage = 15 + (level - 1) * 10;
    this.speed = 100;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.destroy();
    }
  }
}

export class Tower extends Phaser.GameObjects.Container {
  static PRICES = {
    zeus: 100,
    techies: 150,
    sven: 120,
    archer: 110
  };

  constructor(scene, x, y, towerType = 'zeus') {
    super(scene, x, y);

    this.towerType = towerType;
    this.level = 1;
    this.maxLevel = 4;
    this.lastActionTime = 0;

    // Базовый визуал
    this.bodyShape = scene.add.rectangle(0, 0, 44, 44, this.getColor());
    this.add(this.bodyShape);

    // Текст уровня башни
    this.levelText = scene.add.text(0, -28, `Lvl 1`, { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);
    this.add(this.levelText);

    scene.add.existing(this);

    if (towerType === 'sven') {
      this.spawnedSvens = [];
      if (!scene.svenBarracksUnits) scene.svenBarracksUnits = [];
    }

    // Интерактивность для апгрейда при клике
    this.bodyShape.setInteractive({ useHandCursor: true });
    this.bodyShape.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() || scene.isMobile) {
        scene.openUpgradeMenu(this);
      }
    });
  }

  getColor() {
    // На 4 уровне башня получает "Аркана"-цвет (золотой/пурпурный блеск)
    if (this.level >= 4) return 0xfac814; 

    const baseColors = {
      zeus: 0x06b6d4,
      techies: 0xf59e0b,
      sven: 0x3b82f6,
      archer: 0x10b981 // WR / Drow
    };
    return baseColors[this.towerType] || 0xffffff;
  }

  getUpgradeCost() {
    return Math.floor(Tower.PRICES[this.towerType] * 0.8 * this.level);
  }

  upgrade() {
    if (this.level >= this.maxLevel) return false;

    this.level++;
    this.levelText.setText(this.level === 4 ? '✨ ARCANA' : `Lvl ${this.level}`);
    this.levelText.setColor(this.level === 4 ? '#f59e0b' : '#ffffff');
    this.bodyShape.setFillStyle(this.getColor());

    // Визуальный эффект апгрейда
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 150,
      yoyo: true
    });

    return true;
  }

  update(enemiesGroup) {
    const time = this.scene.time.now;
    const lvlBonus = this.level;

    // ⚡ 1. ZEUS TOWER (Молнии)
    if (this.towerType === 'zeus') {
      const cooldown = Math.max(700, 1500 - (lvlBonus - 1) * 200);
      if (time - this.lastActionTime >= cooldown) {
        const enemies = enemiesGroup.getChildren().filter(e => e.active);
        if (enemies.length > 0) {
          this.lastActionTime = time;
          const targetCount = this.level >= 4 ? 6 : 3 + (lvlBonus - 1);
          const targets = enemies.slice(0, targetCount);
          targets.forEach(e => {
            e.takeDamage(35 + lvlBonus * 15);
            const lightningColor = this.level >= 4 ? 0xfac814 : 0x38bdf8;
            const lightning = this.scene.add.line(0, 0, this.x, this.y, e.x, e.y, lightningColor);
            lightning.setLineWidth(this.level >= 4 ? 5 : 3);
            this.scene.tweens.add({ targets: lightning, alpha: 0, duration: 120, onComplete: () => lightning.destroy() });
          });
        }
      }
    }

    // 💣 2. TECHIES MINES (Мины)
    else if (this.towerType === 'techies') {
      const cooldown = Math.max(1200, 3000 - (lvlBonus - 1) * 450);
      if (time - this.lastActionTime >= cooldown) {
        this.lastActionTime = time;
        const mineX = this.x + Phaser.Math.Between(-90, 90);
        const mineY = this.y + Phaser.Math.Between(-50, 50);

        const mineColor = this.level >= 4 ? 0xd97706 : 0xef4444;
        const mine = this.scene.add.circle(mineX, mineY, 8 + lvlBonus, mineColor);
        this.scene.physics.add.existing(mine);

        this.scene.physics.add.overlap(mine, enemiesGroup, (m, enemy) => {
          enemiesGroup.getChildren().forEach(e => {
            if (e.active && Phaser.Math.Distance.Between(mine.x, mine.y, e.x, e.y) <= (80 + lvlBonus * 15)) {
              e.takeDamage(70 + lvlBonus * 30);
            }
          });
          mine.destroy();
        });
      }
    }

    // ⚔️ 3. SVEN BARRACKS (Пехота)
    else if (this.towerType === 'sven') {
      this.spawnedSvens = this.spawnedSvens.filter(s => s.active);
      const maxUnits = this.level >= 4 ? 5 : 4;

      if (this.spawnedSvens.length < maxUnits && time - this.lastActionTime >= (4000 - (lvlBonus - 1) * 500)) {
        this.lastActionTime = time;
        const sven = new SvenUnit(this.scene, this.x + Phaser.Math.Between(-20, 20), this.y + 40, this.level);
        this.spawnedSvens.push(sven);
        this.scene.svenBarracksUnits.push(sven);
      }
    }

    // 🏹 4. ARCHER TOWER (Windranger / Drow Ranger)
    else if (this.towerType === 'archer') {
      const cooldown = Math.max(300, 900 - (lvlBonus - 1) * 150); // Очень быстрая атака (особенно на 4 уровне — Focus Fire!)
      if (time - this.lastActionTime >= cooldown) {
        const enemies = enemiesGroup.getChildren().filter(e => e.active);
        let nearestEnemy = null;
        let minDist = 220 + (lvlBonus * 20);

        enemies.forEach(e => {
          const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
          if (dist <= minDist) {
            minDist = dist;
            nearestEnemy = e;
          }
        });

        if (nearestEnemy) {
          this.lastActionTime = time;
          nearestEnemy.takeDamage(20 + lvlBonus * 12);

          // Визуал стрелы
          const arrowColor = this.level >= 4 ? 0xef4444 : 0x10b981; // Аркана ВРки — красные/золотые стрелы
          const arrow = this.scene.add.line(0, 0, this.x, this.y, nearestEnemy.x, nearestEnemy.y, arrowColor);
          arrow.setLineWidth(this.level >= 4 ? 3 : 2);
          this.scene.tweens.add({ targets: arrow, alpha: 0, duration: 80, onComplete: () => arrow.destroy() });
        }
      }
    }
  }
}