const CARDS_DATABASE = [
  // 🔴 СИЛА (STR)
  { id: 'str_1', type: 'STR', rarity: 'Common', name: 'Сила Великана', desc: '+150 HP и +10% к базовому урону.', stat: 'hp', val: 150 },
  { id: 'str_2', type: 'STR', rarity: 'Common', name: 'Вампиризм WK', desc: '+15% вампиризма от физических атак.', stat: 'lifesteal', val: 0.15 },
  { id: 'str_3', type: 'STR', rarity: 'Common', name: 'Толстая Шкура', desc: '+5 к броне и +50 HP.', stat: 'armor', val: 5 },
  { id: 'str_4', type: 'STR', rarity: 'Rare', name: 'Чешуя Дракона', desc: '+12 к броне и регенерация +15 HP/сек.', stat: 'regen', val: 15 },
  { id: 'str_5', type: 'STR', rarity: 'Rare', name: 'Молот Топора', desc: 'При ударе 20% шанс оглушить врага на 1 сек.', stat: 'stun_chance', val: 0.20 },
  { id: 'str_6', type: 'STR', rarity: 'Rare', name: 'Щит Авангарда', desc: 'Блокирует 30 единиц входящего урона.', stat: 'damage_block', val: 30 },
  { id: 'str_7', type: 'STR', rarity: 'Epic', name: 'Огненный Доспех', desc: 'Наносит 50 урона/сек всем врагам вокруг вас.', stat: 'aura_burn', val: 50 },
  { id: 'str_8', type: 'STR', rarity: 'Epic', name: 'Ярость Берсерка', desc: '+1% к урону за каждые потерянные 2% HP.', stat: 'berserk', val: 0.01 },
  { id: 'str_9', type: 'STR', rarity: 'Epic', name: 'Армагеддон', desc: 'При падении HP ниже 30% срабатывает огненный взрыв.', stat: 'retaliate_nova', val: 400 },
  { id: 'str_10', type: 'STR', rarity: 'Legendary', name: 'Сердце Тарраски', desc: '+800 HP и мгновенная регенерация 4% max HP/сек.', stat: 'heart_regen', val: 0.04 },
  { id: 'str_11', type: 'STR', rarity: 'Legendary', name: 'Aegis of the Immortal', desc: 'Воскрешает с 100% HP (1 раз за уровень).', stat: 'aegis', val: 1 },

  // 🟢 ЛОВКОСТЬ (AGI)
  { id: 'agi_1', type: 'AGI', rarity: 'Common', name: 'Стремительность', desc: '+20% к скорости атаки и +15% к скорости бега.', stat: 'attack_speed', val: 0.20 },
  { id: 'agi_2', type: 'AGI', rarity: 'Common', name: 'Крит Phantom', desc: '+18% шанс нанести x2.2 критический урон.', stat: 'crit', val: 0.18 },
  { id: 'agi_3', type: 'AGI', rarity: 'Common', name: 'Острые Стрелы', desc: '+20 к плоскому урону с атак.', stat: 'flat_damage', val: 20 },
  { id: 'agi_4', type: 'AGI', rarity: 'Rare', name: 'Уклонение Riki', desc: '+25% шанс полностью уклониться от удара.', stat: 'evasion', val: 0.25 },
  { id: 'agi_5', type: 'AGI', rarity: 'Rare', name: 'Ядовитые Клинки', desc: 'Атаки отравляют врага: 25 урона/сек в течение 3 сек.', stat: 'poison_dot', val: 25 },
  { id: 'agi_6', type: 'AGI', rarity: 'Rare', name: 'Маска Безумия (MoM)', desc: '+50% скорости атаки, но -5 к броне.', stat: 'mom_frenzy', val: 0.50 },
  { id: 'agi_7', type: 'AGI', rarity: 'Epic', name: 'Теневые Клинки', desc: 'Каждый 4-й удар наносит +200% урона по площади.', stat: 'cleave', val: 2.0 },
  { id: 'agi_8', type: 'AGI', rarity: 'Epic', name: 'Призрачный Шаг', desc: '+35% к скорости бега и прохождение сквозь врагов.', stat: 'phase_walk', val: 0.35 },
  { id: 'agi_9', type: 'AGI', rarity: 'Epic', name: 'Манта (Manta Style)', desc: 'При атаке с вероятностью 15% спавнит иллюзию.', stat: 'illusion_spawn', val: 0.15 },
  { id: 'agi_10', type: 'AGI', rarity: 'Legendary', name: 'Бабочка (Butterfly)', desc: '+35% уклонения, +45% скорости атаки, +30% урона.', stat: 'butterfly', val: 0.35 },
  { id: 'agi_11', type: 'AGI', rarity: 'Legendary', name: 'Рапира (Divine Rapier)', desc: '+250 к урону атак.', stat: 'rapier_dmg', val: 250 },

  // 🔵 ИНТЕЛЛЕКТ (INT)
  { id: 'int_1', type: 'INT', rarity: 'Common', name: 'Молния Zeus', desc: '30% шанс при атаке выпустить молнию по 3 врагам.', stat: 'lightning', val: 120 },
  { id: 'int_2', type: 'INT', rarity: 'Common', name: 'Ледяной Замедлитель', desc: 'Атаки замедляют движение врагов на 35%.', stat: 'slow', val: 0.35 },
  { id: 'int_3', type: 'INT', rarity: 'Common', name: 'Магический Импульс', desc: '+25% к урону заклинаниями.', stat: 'spell_amp', val: 0.25 },
  { id: 'int_4', type: 'INT', rarity: 'Rare', name: 'Взрыв Ogre Magic', desc: '20% шанс застанить врага и нанести 250 мага урона.', stat: 'multicast', val: 250 },
  { id: 'int_5', type: 'INT', rarity: 'Rare', name: 'Кольцо Маны', desc: 'Каждые 8 секунд восстанавливает 30% здоровья.', stat: 'mana_heal', val: 0.30 },
  { id: 'int_6', type: 'INT', rarity: 'Rare', name: 'Проклятие Некролита', desc: 'Враги рядом теряют 1.5% max HP в секунду.', stat: 'heartstopper', val: 0.015 },
  { id: 'int_7', type: 'INT', rarity: 'Epic', name: 'Нова Смерти', desc: 'Каждые 5 секунд выпускает кольцо на 350 урона.', stat: 'nova_pulse', val: 350 },
  { id: 'int_8', type: 'INT', rarity: 'Epic', name: 'Безмолвие (Orchid)', desc: 'Атаки накладывают на врага безмолвие на 3 сек.', stat: 'silence', val: 3 },
  { id: 'int_9', type: 'INT', rarity: 'Epic', name: 'Сфера Дискорда', desc: 'Снижает сопротивление магии всех врагов на 30%.', stat: 'veil_debuff', val: 0.30 },
  { id: 'int_10', type: 'INT', rarity: 'Legendary', name: 'Refresher Orb', desc: 'Сбрасывает перезарядку абилок и +50% к магии.', stat: 'refresher', val: 0.50 },
  { id: 'int_11', type: 'INT', rarity: 'Legendary', name: 'Aghanims Scepter', desc: 'Усиливает все способности и даёт ультимейт-эффект.', stat: 'scepter', val: 1 },

  // 🟣 CO-OP (КОМАНДНЫЕ)
  { id: 'coop_1', type: 'COOP', rarity: 'Common', name: 'Аура Лидера', desc: '+15% к урону и скорости атаки ОБОИМ игрокам.', stat: 'team_damage', val: 0.15 },
  { id: 'coop_2', type: 'COOP', rarity: 'Common', name: 'Общий Щит', desc: '+5 к броне обоим игрокам.', stat: 'team_armor', val: 5 },
  { id: 'coop_3', type: 'COOP', rarity: 'Rare', name: 'Аура Владмира', desc: '+12% вампиризма и +15% урона для команды.', stat: 'vlads_aura', val: 0.12 },
  { id: 'coop_4', type: 'COOP', rarity: 'Rare', name: 'Сапоги Ускорения', desc: '+25% к скорости передвижения обоим героям.', stat: 'team_speed', val: 0.25 },
  { id: 'coop_5', type: 'COOP', rarity: 'Epic', name: 'Совместный Алхимик', desc: '+50% больше золота за убийства обоим игрокам.', stat: 'team_gold', val: 0.50 },
  { id: 'coop_6', type: 'COOP', rarity: 'Epic', name: 'Аура Тотема', desc: 'Восстанавливает обоим игрокам +12 HP/сек.', stat: 'team_regen', val: 12 },
  { id: 'coop_7', type: 'COOP', rarity: 'Legendary', name: 'Душевная Связь', desc: 'При смерти напарника воскрешает его с 50% HP.', stat: 'revive_bond', val: 1 },
  { id: 'coop_8', type: 'COOP', rarity: 'Legendary', name: 'Командный Кираса', desc: '+40% скорости атаки и +10 брони обоим героям.', stat: 'cuirass_aura', val: 0.40 }
];

module.exports = CARDS_DATABASE;