const HEROES_DATABASE = [
  {
    id: 'meepo',
    name: 'Meepo',
    primaryAttr: 'DEX', // Ловкость/Геомантия
    color: 0x8b5cf6,   // Фиолетово-земляной
    baseHp: 580,
    baseDamage: 36,
    attackSpeed: 1.4,
    moveSpeed: 175,
    skill: 'Divided We Stand (Призыв клона-копии)'
  },
  {
    id: 'sf',
    name: 'Shadow Fiend',
    primaryAttr: 'INT', // Магия душ / Агилити
    color: 0xef4444,   // Огненно-красный
    baseHp: 480,
    baseDamage: 40,
    attackSpeed: 1.3,
    moveSpeed: 165,
    skill: 'Shadowraze & Souls (Займы душ + Урон по области)'
  },
  {
    id: 'tb',
    name: 'Terrorblade',
    primaryAttr: 'AGI', // Ловкость
    color: 0x06b6d4,   // Демонический голубой/бирюзовый
    baseHp: 520,
    baseDamage: 48,
    attackSpeed: 1.5,
    moveSpeed: 180,
    skill: 'Metamorphosis (Превращение в дальний бой + Мега-урон)'
  }
];

module.exports = HEROES_DATABASE;