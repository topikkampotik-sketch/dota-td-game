const BIOMES = ['Зеленые Леса', 'Пустыня Смерти', 'Ледяной Пик', 'Вулканические Земли', 'Арены Тьмы'];

function getLevelConfig(levelNumber) {
  const biomeIndex = Math.floor((levelNumber - 1) / 20) % BIOMES.length;
  const isBossLevel = levelNumber % 5 === 0;

  return {
    level: levelNumber,
    biome: BIOMES[biomeIndex],
    isBossLevel: isBossLevel,
    wavesCount: isBossLevel ? 3 : 5,
    hpMultiplier: 1 + (levelNumber * 0.15),
    goldReward: 100 + (levelNumber * 20),
    bossName: isBossLevel ? `МЕГА-БОСС ${BIOMES[biomeIndex].toUpperCase()}` : null
  };
}

module.exports = { getLevelConfig, BIOMES };