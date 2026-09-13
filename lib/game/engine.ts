import {
  COOLDOWN_MS,
  DUNGEON,
  ENEMIES,
  ENERGY_MS,
  HEAL_MS,
  INVENTORY_CAP,
  ITEMS,
  MAX_ENERGY,
  QUESTS,
  REGIONS,
  type Enemy,
  type Slot,
  type Stat,
} from './content';
export type BattleRound = {
  round: number;
  dealt: number;
  taken: number;
  critical: boolean;
  dodged: boolean;
  playerHp: number;
  enemyHp: number;
};
export type Battle = {
  id: string;
  enemy: string;
  enemyId: string;
  won: boolean;
  gold: number;
  xp: number;
  loot: string | null;
  rounds: BattleRound[];
  at: number;
  dungeon: boolean;
};
export type GameState = {
  name: string;
  level: number;
  xp: number;
  gold: number;
  hp: number;
  energy: number;
  energyAt: number;
  healAt: number;
  cooldownUntil: number;
  stats: Record<Stat, number>;
  inventory: string[];
  equipment: Record<Slot, string | null>;
  food: number;
  wins: number;
  training: number;
  defeated: string[];
  claimed: string[];
  dungeonStage: number;
  dungeonClears: number;
  history: Battle[];
  lastActionId: string | null;
};
export type Action =
  | { type: 'fight'; enemyId: string }
  | { type: 'dungeon' }
  | { type: 'train'; stat: Stat }
  | { type: 'equip'; itemId: string }
  | { type: 'unequip'; slot: Slot }
  | { type: 'buy'; itemId: string }
  | { type: 'sell'; itemId: string }
  | { type: 'heal' }
  | { type: 'claim'; questId: string }
  | { type: 'rename'; name: string };
export class GameError extends Error {}
export function newGame(now = Date.now()): GameState {
  return {
    name: 'پهلوان تازه‌نفس',
    level: 1,
    xp: 0,
    gold: 350,
    hp: 120,
    energy: MAX_ENERGY,
    energyAt: now,
    healAt: now,
    cooldownUntil: 0,
    stats: { strength: 10, agility: 8, vitality: 10, luck: 5 },
    inventory: ['iron-blade', 'leather'],
    equipment: { weapon: 'iron-blade', armor: 'leather', charm: null },
    food: 3,
    wins: 0,
    training: 0,
    defeated: [],
    claimed: [],
    dungeonStage: 0,
    dungeonClears: 0,
    history: [],
    lastActionId: null,
  };
}
export function derived(s: GameState) {
  const gear = Object.values(s.equipment)
    .map((id) => ITEMS.find((i) => i.id === id))
    .filter((i) => !!i);
  return {
    attack:
      s.stats.strength +
      gear.reduce((a, i) => a + i.attack, 0) +
      (s.level - 1) * 2,
    armor: 2 + gear.reduce((a, i) => a + i.armor, 0),
    maxHp: 60 + s.stats.vitality * 6 + gear.reduce((a, i) => a + i.vitality, 0),
    dodge: Math.min(0.3, s.stats.agility * 0.008),
    crit: Math.min(0.35, s.stats.luck * 0.012),
  };
}
export function xpGoal(level: number) {
  return 80 + (level - 1) * 45;
}
export function trainCost(s: GameState, stat: Stat) {
  return 18 + Math.floor(s.stats[stat] * 1.8);
}
export function regenerate(input: GameState, now = Date.now()): GameState {
  const s = structuredClone(input),
    max = derived(s).maxHp;
  const energyTicks = Math.max(0, Math.floor((now - s.energyAt) / ENERGY_MS));
  if (s.energy >= MAX_ENERGY) {
    s.energyAt = now;
  } else if (energyTicks) {
    s.energy = Math.min(MAX_ENERGY, s.energy + energyTicks);
    s.energyAt =
      s.energy === MAX_ENERGY ? now : s.energyAt + energyTicks * ENERGY_MS;
  }
  const healTicks = Math.max(0, Math.floor((now - s.healAt) / HEAL_MS));
  if (s.hp >= max) {
    s.hp = max;
    s.healAt = now;
  } else if (healTicks) {
    s.hp = Math.min(max, s.hp + healTicks * 6);
    s.healAt = s.hp === max ? now : s.healAt + healTicks * HEAL_MS;
  }
  return s;
}
export function questProgress(s: GameState, q: (typeof QUESTS)[number]) {
  if (q.kind === 'wins') return s.wins;
  if (q.kind === 'training') return s.training;
  if (q.kind === 'captain') return Number(s.defeated.includes('captain'));
  return s.dungeonClears;
}
export function enemyUnlocked(s: GameState, e: Enemy) {
  const list = ENEMIES.filter((a) => a.region === e.region);
  const index = list.findIndex((a) => a.id === e.id);
  return (
    s.level >= REGIONS[e.region].level &&
    (index === 0 || s.defeated.includes(list[index - 1].id))
  );
}
function awardXp(s: GameState, xp: number) {
  s.xp += xp;
  while (s.xp >= xpGoal(s.level)) {
    s.xp -= xpGoal(s.level);
    s.level++;
    s.stats.strength++;
    s.stats.vitality++;
    s.hp = derived(s).maxHp;
  }
}
function requireGold(s: GameState, cost: number) {
  if (s.gold < cost)
    throw new GameError(
      'سکهٔ کافی نداری. با لشکرکشی یا دریافت پاداش مأموریت‌ها سکه به دست بیاور.',
    );
  s.gold -= cost;
}
function addItem(s: GameState, id: string) {
  if (s.inventory.length < INVENTORY_CAP) {
    s.inventory.push(id);
    return id;
  }
  const item = ITEMS.find((i) => i.id === id)!;
  s.gold += Math.floor(item.price * 0.4);
  return null;
}
export function transition(
  input: GameState,
  action: Action,
  now = Date.now(),
  random: () => number = Math.random,
): { state: GameState; message: string; battle?: Battle } {
  const s = regenerate(input, now);
  let message = 'انجام شد.';
  if (action.type === 'fight' || action.type === 'dungeon') {
    const dungeon = action.type === 'dungeon';
    const e = dungeon
      ? DUNGEON[s.dungeonStage]
      : ENEMIES.find((e) => e.id === action.enemyId);
    if (!e) throw new GameError('حریف پیدا نشد.');
    if (dungeon && s.level < 3)
      throw new GameError('دژ خاموش از سطح ۳ باز می‌شود.');
    if (!dungeon && !enemyUnlocked(s, e))
      throw new GameError('ابتدا حریف قبلی را شکست بده و به سطح لازم برس.');
    if (now < s.cooldownUntil)
      throw new GameError('کمی صبر کن؛ هنوز برای نبرد بعدی آماده نیستی.');
    if (s.energy < (dungeon ? 2 : 1))
      throw new GameError('انرژی کافی نداری. هر دقیقه یک انرژی بازیابی می‌شود.');
    if (s.hp < 20)
      throw new GameError(
        'سلامتی‌ات کمتر از ۲۰ است. غذا بخور یا برای بازیابی صبر کن.',
      );
    s.energy -= dungeon ? 2 : 1;
    s.cooldownUntil = now + COOLDOWN_MS;
    const d = derived(s);
    let hp = e.hp;
    const rounds: BattleRound[] = [];
    for (let r = 1; r <= 20 && hp > 0 && s.hp > 0; r++) {
      const critical = random() < d.crit;
      const dealt = Math.max(
        1,
        Math.round(
          d.attack * (0.85 + random() * 0.3) * (critical ? 1.65 : 1) -
            e.armor * 0.55,
        ),
      );
      hp = Math.max(0, hp - dealt);
      const dodged = hp > 0 && random() < d.dodge;
      const taken =
        hp <= 0 || dodged
          ? 0
          : Math.max(
              1,
              Math.round(e.attack * (0.85 + random() * 0.3) - d.armor * 0.6),
            );
      s.hp = Math.max(0, s.hp - taken);
      rounds.push({
        round: r,
        dealt,
        taken,
        critical,
        dodged,
        playerHp: s.hp,
        enemyHp: hp,
      });
    }
    const won = hp === 0;
    s.hp = Math.max(1, s.hp);
    let gold = 0,
      xp = 5,
      loot: string | null = null;
    if (won) {
      gold = e.gold + Math.floor(random() * Math.ceil(e.gold * 0.3));
      xp = e.xp;
      s.gold += gold;
      if (!dungeon) s.wins++;
      const first = !s.defeated.includes(e.id);
      if (first) s.defeated.push(e.id);
      if (dungeon) {
        s.dungeonStage++;
        if (s.dungeonStage === DUNGEON.length) {
          s.dungeonStage = 0;
          s.dungeonClears++;
          loot = addItem(s, 'simorgh');
        }
      }
      if (!loot && (first || random() < 0.5)) {
        const pool = ITEMS.filter((i) =>
          e.level >= 5
            ? true
            : e.level >= 3
              ? i.rarity !== 'epic'
              : i.rarity === 'common' || i.id === 'cypress',
        );
        loot = addItem(
          s,
          pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]
            .id,
        );
      }
    }
    awardXp(s, xp);
    const battle: Battle = {
      id: crypto.randomUUID(),
      enemy: e.name,
      enemyId: e.id,
      won,
      gold,
      xp,
      loot,
      rounds,
      at: now,
      dungeon,
    };
    s.history = [battle, ...s.history].slice(0, 20);
    message = won
      ? 'پیروزی! پاداش نبرد به دارایی‌هایت اضافه شد.'
      : 'این بار شکست خوردی. تجهیزاتت را بهتر کن و دوباره برگرد.';
    return { state: s, message, battle };
  }
  if (action.type === 'train') {
    if (!Object.hasOwn(s.stats, action.stat))
      throw new GameError('ویژگی نامعتبر است.');
    requireGold(s, trainCost(s, action.stat));
    s.stats[action.stat]++;
    if (action.stat === 'vitality') s.hp += 6;
    s.training++;
    message = 'تمرین تمام شد. یک امتیاز به ویژگی‌ات اضافه شد.';
  } else if (action.type === 'equip') {
    const item = ITEMS.find((i) => i.id === action.itemId);
    if (!item || !s.inventory.includes(item.id))
      throw new GameError('این وسیله در کوله‌پشتی تو نیست.');
    s.equipment[item.slot] = item.id;
    s.hp = Math.min(s.hp, derived(s).maxHp);
    message = `${item.name} را پوشیدی.`;
  } else if (action.type === 'unequip') {
    if (!Object.hasOwn(s.equipment, action.slot))
      throw new GameError('جایگاه نامعتبر است.');
    s.equipment[action.slot] = null;
    s.hp = Math.min(s.hp, derived(s).maxHp);
    message = 'وسیله از تن خارج شد و در کوله‌پشتی ماند.';
  } else if (action.type === 'buy') {
    if (action.itemId === 'food') {
      if (s.food >= 99) throw new GameError('خوراک کافی در کوله‌پشتی داری.');
      requireGold(s, 20);
      s.food++;
      message = 'یک خوراک سفر خریدی.';
    } else {
      const item = ITEMS.find((i) => i.id === action.itemId);
      if (!item) throw new GameError('کالا پیدا نشد.');
      if (s.inventory.length >= INVENTORY_CAP)
        throw new GameError('کوله‌پشتی پر است. ابتدا یک وسیله بفروش.');
      requireGold(s, item.price);
      s.inventory.push(item.id);
      message = `${item.name} به کوله‌پشتی اضافه شد.`;
    }
  } else if (action.type === 'sell') {
    const item = ITEMS.find((i) => i.id === action.itemId);
    const index = s.inventory.indexOf(action.itemId);
    if (!item || index === -1) throw new GameError('وسیله پیدا نشد.');
    if (
      Object.values(s.equipment).includes(item.id) &&
      s.inventory.filter((id) => id === item.id).length === 1
    )
      throw new GameError('ابتدا این وسیله را از تن خارج کن.');
    s.inventory.splice(index, 1);
    s.gold += Math.floor(item.price * 0.4);
    message = 'وسیله فروخته شد.';
  } else if (action.type === 'heal') {
    if (s.food < 1) throw new GameError('خوراک نداری. از بازار تهیه کن.');
    if (s.hp >= derived(s).maxHp) throw new GameError('سلامتی‌ات کامل است.');
    s.food--;
    s.hp = Math.min(derived(s).maxHp, s.hp + 60);
    message = 'خوراک سفر تا ۶۰ سلامتی بازیابی کرد.';
  } else if (action.type === 'claim') {
    const q = QUESTS.find((q) => q.id === action.questId);
    if (!q || s.claimed.includes(q.id) || questProgress(s, q) < q.target)
      throw new GameError('این پاداش هنوز آماده نیست یا قبلاً دریافت شده است.');
    s.claimed.push(q.id);
    s.gold += q.gold;
    awardXp(s, q.xp);
    message = 'پاداش مأموریت را دریافت کردی!';
  } else if (action.type === 'rename') {
    const name = typeof action.name === 'string' ? action.name.trim() : '';
    if (
      typeof name !== 'string' ||
      name.length < 2 ||
      name.length > 24 ||
      name
        .split('')
        .some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127) ||
      /[<>]/.test(name)
    )
      throw new GameError('نام پهلوان باید بین ۲ تا ۲۴ نویسه باشد.');
    s.name = name;
    message = 'نام پهلوان ثبت شد.';
  } else throw new GameError('درخواست نامعتبر است.');
  return { state: s, message };
}
