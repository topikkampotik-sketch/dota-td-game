
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { Tower } from '../entities/Tower';
import { socketClient } from '../network/socketClient';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
    this.GRID_SIZE = 64;
  }

  init(data) {
    this.level = data.level || 1;
    this.heroId = data.heroId || 'meepo';
    this.roomCode = data.roomCode || 'ROOM1';
    this.baseHp = 20;

    // 🪙 Сохранение/перенос золота и статов героя
    this.gold = data.gold !== undefined ? data.gold : 350;
    this.savedHeroStats = data.heroStats || null;

    // --- Система Волн ---
    this.currentWave = 1;
    this.maxWaves = 15;
    this.mobsLeftInWave = 0;
    this.isWaveActive = false;
  }

  create() {
    const { width, height } = this.scale;

    // 1. Фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);

    // 2. Сетка
    this.drawGrid(width, height);

    // 3. Дорожка
    const pathY = Math.floor((height / 2) / this.GRID_SIZE) * this.GRID_SIZE;
    this.add.rectangle(width / 2, pathY + this.GRID_SIZE / 2, width, this.GRID_SIZE, 0x334155).setDepth(1);

    // 4. База
    const baseX = Math.floor((width - 60) / this.GRID_SIZE) * this.GRID_SIZE + this.GRID_SIZE / 2;
    this.base = this.add.rectangle(baseX, pathY + this.GRID_SIZE / 2, this.GRID_SIZE, this.GRID_SIZE * 2, 0xef4444).setDepth(2);
    this.add.text(baseX, pathY + this.GRID_SIZE / 2, 'БАЗА', { fontSize: '14px', color: '#fff', style: 'bold' }).setOrigin(0.5).setDepth(3);

    // 5. Игрок
    this.hero = new Hero(this, 120, pathY - this.GRID_SIZE, this.heroId);
    this.hero.setDepth(10);

    // ⚡ Восстанавливаем сохранённый прогресс героя
    if (this.savedHeroStats) {
      this.hero.level = this.savedHeroStats.level || this.hero.level;
      this.hero.damage = this.savedHeroStats.damage || this.hero.damage;
      this.hero.speed = this.savedHeroStats.speed || this.hero.speed;
      this.hero.activeBuffs = this.savedHeroStats.buffs || [];
    }

    // Группы
    this.enemies = this.add.group();
    this.towers = [];
    this.otherPlayers = {};

    // HUD (Интерфейс)
    this.hudHp = this.add.text(30, 20, `❤️ База HP: ${this.baseHp}`, { fontSize: '18px', color: '#ef4444' }).setScrollFactor(0).setDepth(300);
    this.hudGold = this.add.text(220, 20, `🪙 Золото: ${this.gold}`, { fontSize: '18px', color: '#f59e0b' }).setScrollFactor(0).setDepth(300);
    this.hudWave = this.add.text(400, 20, `🌊 Волна: ${this.currentWave}/${this.maxWaves} (Lvl ${this.level})`, { fontSize: '18px', color: '#3b82f6' }).setScrollFactor(0).setDepth(300);

    // 6. Слоты постройки
    this.createGridBuildSlots([
      { col: 4, row: Math.floor(pathY / this.GRID_SIZE) - 1 },
      { col: 7, row: Math.floor(pathY / this.GRID_SIZE) + 1 },
      { col: 10, row: Math.floor(pathY / this.GRID_SIZE) - 1 },
      { col: 13, row: Math.floor(pathY / this.GRID_SIZE) + 1 }
    ]);

    // --- MULTIPLAYER ---
    socketClient.joinRoom(this.roomCode, this.heroId);

    socketClient.socket.on('newPlayer', (info) => this.addOtherPlayer(info.id, info));
    socketClient.socket.on('playerMoved', ({ id, x, y }) => {
      if (this.otherPlayers[id]) this.otherPlayers[id].setPosition(x, y);
    });
    socketClient.socket.on('towerBuilt', ({ x, y, type }) => {
      const tower = new Tower(this, x, y, type);
      tower.setDepth(5);
      this.towers.push(tower);
    });
    socketClient.socket.on('playerDisconnected', (id) => {
      if (this.otherPlayers[id]) {
        if (this.otherPlayers[id].label) this.otherPlayers[id].label.destroy();
        this.otherPlayers[id].destroy();
        delete this.otherPlayers[id];
      }
    });

    // Старт волн
    this.startNextWave();

    // Управление
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyQ.on('down', () => {
      const pointer = this.input.activePointer;
      this.hero.useSkill(pointer.worldX, pointer.worldY);
      socketClient.sendSkill(this.roomCode, pointer.worldX, pointer.worldY, this.heroId);
    });

    this.input.manager.canvas.oncontextmenu = (e) => e.preventDefault();
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) this.hero.attack(pointer.worldX, pointer.worldY);
    });

    this.isMobile = !this.sys.game.device.os.desktop;
    if (this.isMobile) this.createMobileControls();
  }

  // 🎲 УНИКАЛЬНЫЙ СОСТАВ ВОЛН ДЛЯ КАЖДОГО УРОВНЯ И ВОЛНЫ
  getWaveComposition(wave, level) {
    const presetsByLevel = {
      // 🟢 LEVEL 1 PRESETS
      1: {
        1:  [ { type: 'orc', count: 15 }, { type: 'elf', count: 15 } ],
        2:  [ { type: 'dwarf', count: 20 }, { type: 'orc', count: 10 } ],
        3:  [ { type: 'goblin', count: 25 }, { type: 'elf', count: 10 } ],
        4:  [ { type: 'orc', count: 15 }, { type: 'dwarf', count: 15 } ],
        5:  [ { type: 'goblin', count: 20 }, { type: 'orc', count: 15 }, { type: 'elf', count: 10 } ],
        6:  [ { type: 'dwarf', count: 25 }, { type: 'elf', count: 15 } ],
        7:  [ { type: 'goblin', count: 30 }, { type: 'orc', count: 20 } ],
        8:  [ { type: 'orc', count: 20 }, { type: 'dwarf', count: 20 }, { type: 'elf', count: 10 } ],
        9:  [ { type: 'goblin', count: 25 }, { type: 'dwarf', count: 15 }, { type: 'elf', count: 15 } ],
        10: [ { type: 'orc', count: 15 }, { type: 'dwarf', count: 15 }, { type: 'boss', count: 1 } ], // 👑 БОСС С 10 ВОЛНЫ!
        11: [ { type: 'goblin', count: 35 }, { type: 'elf', count: 20 } ],
        12: [ { type: 'dwarf', count: 30 }, { type: 'orc', count: 20 } ],
        13: [ { type: 'goblin', count: 25 }, { type: 'orc', count: 20 }, { type: 'elf', count: 20 } ],
        14: [ { type: 'dwarf', count: 35 }, { type: 'elf', count: 25 } ],
        15: [ { type: 'orc', count: 20 }, { type: 'dwarf', count: 20 }, { type: 'boss', count: 2 } ]
      },

      // 🔵 LEVEL 2 PRESETS (Другие составы)
      2: {
        1:  [ { type: 'goblin', count: 30 }, { type: 'dwarf', count: 10 } ],
        2:  [ { type: 'elf', count: 25 }, { type: 'orc', count: 15 } ],
        3:  [ { type: 'dwarf', count: 25 }, { type: 'goblin', count: 15 } ],
        4:  [ { type: 'elf', count: 20 }, { type: 'dwarf', count: 20 } ],
        5:  [ { type: 'orc', count: 30 }, { type: 'goblin', count: 20 } ],
        6:  [ { type: 'goblin', count: 40 } ],
        7:  [ { type: 'dwarf', count: 30 }, { type: 'elf', count: 20 } ],
        8:  [ { type: 'orc', count: 25 }, { type: 'dwarf', count: 25 } ],
        9:  [ { type: 'elf', count: 30 }, { type: 'goblin', count: 25 } ],
        10: [ { type: 'dwarf', count: 25 }, { type: 'elf', count: 20 }, { type: 'boss', count: 1 } ], // 👑 БОСС С 10 ВОЛНЫ!
        11: [ { type: 'orc', count: 35 }, { type: 'goblin', count: 25 } ],
        12: [ { type: 'dwarf', count: 40 } ],
        13: [ { type: 'elf', count: 35 }, { type: 'orc', count: 25 } ],
        14: [ { type: 'goblin', count: 50 }, { type: 'dwarf', count: 20 } ],
        15: [ { type: 'dwarf', count: 30 }, { type: 'elf', count: 25 }, { type: 'boss', count: 3 } ]
      }
    };

    // Динамическая ротация для уровней 3+
    if (!presetsByLevel[level] || !presetsByLevel[level][wave]) {
      const types = ['goblin', 'orc', 'dwarf', 'elf'];
      const primaryType = types[(level - 1) % types.length];
      const secondaryType = types[level % types.length];
      const isBossWave = wave >= 10 && wave % 5 === 0;

      return [
        { type: primaryType, count: 20 + wave + level * 2 },
        { type: secondaryType, count: 15 + wave + level * 2 },
        ...(isBossWave ? [{ type: 'boss', count: Math.floor(wave / 5) }] : [])
      ];
    }

    return presetsByLevel[level][wave];
  }

  startNextWave() {
    if (this.currentWave > this.maxWaves) {
      alert(`ПОБЕДА! Уровень ${this.level} пройден!`);

      // 💾 Сохраняем прогресс для перехода на следующий уровень
      const playerData = {
        roomCode: this.roomCode,
        heroId: this.heroId,
        gold: this.gold,
        heroStats: {
          level: this.hero.level || 1,
          damage: this.hero.damage || 25,
          speed: this.hero.speed || 160,
          buffs: this.hero.activeBuffs || []
        },
        level: this.level + 1
      };

      this.scene.start('MapScene', playerData);
      return;
    }

    this.isWaveActive = true;
    this.hudWave.setText(`🌊 Волна: ${this.currentWave}/${this.maxWaves} (Lvl ${this.level})`);

    const composition = this.getWaveComposition(this.currentWave, this.level);
    this.spawnQueue = [];

    composition.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push(group.type);
      }
    });

    this.mobsLeftInWave = this.spawnQueue.length;

    this.waveTimer = this.time.addEvent({
      delay: 1500,
      callback: () => {
        if (this.spawnQueue.length > 0) {
          const nextEnemyType = this.spawnQueue.shift();
          this.spawnEnemy(nextEnemyType);
        } else {
          this.waveTimer.remove();
        }
      },
      loop: true
    });
  }

  spawnEnemy(type) {
    const pathY = Math.floor((this.scale.height / 2) / this.GRID_SIZE) * this.GRID_SIZE + this.GRID_SIZE / 2;
    const enemy = new Enemy(this, 0, pathY, this.currentWave, this.level, type);
    enemy.setDepth(4);
    this.enemies.add(enemy);
  }

  drawGrid(width, height) {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1e293b, 0.6);
    for (let x = 0; x <= width; x += this.GRID_SIZE) {
      graphics.moveTo(x, 0); graphics.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += this.GRID_SIZE) {
      graphics.moveTo(0, y); graphics.lineTo(width, y);
    }
    graphics.strokePath();
  }

  createGridBuildSlots(slots) {
    slots.forEach(s => {
      const x = s.col * this.GRID_SIZE + this.GRID_SIZE / 2;
      const y = s.row * this.GRID_SIZE + this.GRID_SIZE / 2;

      const slot = this.add.rectangle(x, y, this.GRID_SIZE - 8, this.GRID_SIZE - 8, 0x1e293b)
        .setStrokeStyle(2, 0x3b82f6).setInteractive({ useHandCursor: true }).setDepth(2);

      const plusText = this.add.text(x, y, '+', { fontSize: '24px', color: '#3b82f6' }).setOrigin(0.5).setDepth(3);

      slot.on('pointerdown', (pointer) => {
        if (pointer.leftButtonDown() || this.isMobile) {
          this.openBuildMenu(slot, plusText, x, y);
        }
      });
    });
  }

  openBuildMenu(slot, plusText, x, y) {
    if (this.activeMenu) this.activeMenu.destroy();
    const menuBg = this.add.container(x, y - 50).setDepth(200);

    const zeusBtn = this.createMenuButton(-80, 0, '⚡ 100', 0x06b6d4, () => this.buildTower(slot, plusText, x, y, 'zeus', Tower.PRICES.zeus));
    const techiesBtn = this.createMenuButton(-25, 0, '💣 150', 0xf59e0b, () => this.buildTower(slot, plusText, x, y, 'techies', Tower.PRICES.techies));
    const svenBtn = this.createMenuButton(30, 0, '⚔️ 120', 0x3b82f6, () => this.buildTower(slot, plusText, x, y, 'sven', Tower.PRICES.sven));
    const archerBtn = this.createMenuButton(85, 0, '🏹 110', 0x10b981, () => this.buildTower(slot, plusText, x, y, 'archer', Tower.PRICES.archer));

    menuBg.add([zeusBtn, techiesBtn, svenBtn, archerBtn]);
    this.activeMenu = menuBg;
  }

  createMenuButton(offsetX, offsetY, label, color, onClick) {
    const btnGroup = this.add.container(offsetX, offsetY);
    const bg = this.add.rectangle(0, 0, 50, 30, color, 0.95).setInteractive({ useHandCursor: true });
    const txt = this.add.text(0, 0, label, { fontSize: '10px', color: '#fff', style: 'bold' }).setOrigin(0.5);

    bg.on('pointerdown', (p) => {
      if (Phaser.Input.Pointer.prototype.stopPropagation) p.stopPropagation();
      onClick();
      if (this.activeMenu) this.activeMenu.destroy();
    });

    btnGroup.add([bg, txt]);
    return btnGroup;
  }

  buildTower(slot, plusText, x, y, type, price) {
    if (this.gold < price) {
      this.hudGold.setColor('#ef4444');
      this.time.delayedCall(500, () => this.hudGold.setColor('#f59e0b'));
      return;
    }

    this.gold -= price;
    this.hudGold.setText(`🪙 Золото: ${this.gold}`);

    const tower = new Tower(this, x, y, type);
    tower.setDepth(5);
    this.towers.push(tower);

    socketClient.sendBuildTower(this.roomCode, x, y, type);

    slot.destroy();
    plusText.destroy();
  }

  addOtherPlayer(id, info) {
    const color = info.heroId === 'sf' ? 0xd97706 : (info.heroId === 'tb' ? 0x7c3aed : 0x3b82f6);
    const other = this.add.circle(info.x || 120, info.y || 200, 18, color).setDepth(10);
    const label = this.add.text(info.x || 120, (info.y || 200) - 25, 'P2 (Co-op)', { fontSize: '11px', color: '#60a5fa' }).setOrigin(0.5).setDepth(11);
    
    other.label = label;
    this.otherPlayers[id] = other;
  }

  createMobileControls() {
    const { height, width } = this.scale;

    this.joyBase = this.add.circle(120, height - 120, 60, 0xffffff, 0.2).setScrollFactor(0).setDepth(400);
    this.joyStick = this.add.circle(120, height - 120, 30, 0xffffff, 0.5).setScrollFactor(0).setDepth(401);

    this.joyVector = { x: 0, y: 0 };
    this.joyBase.setInteractive();

    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown && pointer.x < width / 2) {
        const dist = Phaser.Math.Distance.Between(this.joyBase.x, this.joyBase.y, pointer.x, pointer.y);
        const angle = Phaser.Math.Angle.Between(this.joyBase.x, this.joyBase.y, pointer.x, pointer.y);
        const maxDist = 50;
        const clampDist = Math.min(dist, maxDist);

        this.joyStick.x = this.joyBase.x + Math.cos(angle) * clampDist;
        this.joyStick.y = this.joyBase.y + Math.sin(angle) * clampDist;
        this.joyVector.x = (this.joyStick.x - this.joyBase.x) / maxDist;
        this.joyVector.y = (this.joyStick.y - this.joyBase.y) / maxDist;
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (pointer.x < width / 2) {
        this.joyStick.x = this.joyBase.x;
        this.joyStick.y = this.joyBase.y;
        this.joyVector = { x: 0, y: 0 };
      }
    });

    const attackBtn = this.add.circle(width - 100, height - 100, 40, 0xef4444, 0.8)
      .setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(400);
    this.add.text(width - 100, height - 100, '⚔️', { fontSize: '28px' }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

    attackBtn.on('pointerdown', () => this.hero.attack(this.hero.x + 100, this.hero.y));

    const skillBtn = this.add.circle(width - 180, height - 70, 35, 0x8b5cf6, 0.8)
      .setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(400);
    this.add.text(width - 180, height - 70, '✨ Q', { fontSize: '20px', color: '#fff', style: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

    skillBtn.on('pointerdown', () => {
      this.hero.useSkill(this.hero.x + 120, this.hero.y);
      socketClient.sendSkill(this.roomCode, this.hero.x + 120, this.hero.y, this.heroId);
    });
  }

  update() {
    if (!this.hero) return;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown) dx = -1;
    if (this.cursors.right.isDown) dx = 1;
    if (this.cursors.up.isDown) dy = -1;
    if (this.cursors.down.isDown) dy = 1;

    if (this.isMobile && (this.joyVector.x !== 0 || this.joyVector.y !== 0)) {
      dx = this.joyVector.x;
      dy = this.joyVector.y;
    }

    this.hero.moveByVector(dx, dy);

    if (this.hero.body.velocity.x !== 0 || this.hero.body.velocity.y !== 0) {
      socketClient.sendMovement(this.roomCode, this.hero.x, this.hero.y);
    }

    this.towers.forEach(t => t.update(this.enemies));
    this.enemies.getChildren().forEach(e => e.update());

    if (this.isWaveActive && this.mobsLeftInWave === 0 && this.enemies.countActive() === 0) {
      this.isWaveActive = false;
      this.currentWave++;
      this.time.delayedCall(3000, () => this.startNextWave());
    }
  }

  damageBase(amount) {
    this.baseHp -= amount;
    this.hudHp.setText(`❤️ База HP: ${Math.max(0, this.baseHp)}`);

    if (this.baseHp <= 0) {
      alert('ПОРАЖЕНИЕ! База уничтожена.');
      this.scene.start('MapScene', { roomCode: this.roomCode, heroId: this.heroId });
    }
  }
}