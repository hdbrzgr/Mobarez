import {
  ARENA_COOLDOWN_MS,
  BAG_UPGRADES,
  BASE_BY_ID,
  BLESSING_MS,
  BLESSINGS,
  COSTUMES,
  DAILY_COUNT,
  DAILY_TEMPLATES,
  DAY_OFFSET_MS,
  DUNGEON_BY_ID,
  DUNGEON_COOLDOWN_MS,
  DUNGEON_MAX,
  DUNGEON_MS,
  DUNGEONS,
  EARNED_TITLES,
  ENEMIES,
  ENEMY_BY_ID,
  EXPEDITION_COOLDOWN_MS,
  EXPEDITION_MAX,
  EXPEDITION_MS,
  FOODS,
  HARD_LEVEL_BONUS,
  HEAL_MS,
  HISTORY_CAP,
  ITEM_BASES,
  JOBS,
  LEVEL_CAP,
  MARKET_PERIOD_MS,
  MARKET_SIZE,
  PACKAGE_CAP,
  PACKAGE_MS,
  PREFIX_BY_ID,
  PREFIXES,
  QUALITY_MULT,
  QUESTS,
  RANK_TITLES,
  REGIONS,
  RIVAL_EPITHETS,
  RIVAL_NAMES,
  SLOTS,
  STARTER_COSTUME_IDS,
  STATS,
  SUFFIX_BY_ID,
  SUFFIXES,
  TIER_LEVELS,
  WORK_HOURS,
  fa,
  regionLevel,
  type Affix,
  type BlessingId,
  type DailyKind,
  type Enemy,
  type FoodId,
  type Gender,
  type ItemBase,
  type JobId,
  type Profile,
  type Quality,
  type Quest,
  type Slot,
  type Stat,
  type TitleBonus,
} from './content';

/* ================= Types ================= */

export type ItemInstance = {
  uid: string;
  base: string;
  level: number;
  quality: Quality;
  prefix?: string;
  suffix?: string;
  upgrade: number;
};
export type Package = { item: ItemInstance; at: number; source: string };
export type BattleRound = {
  round: number;
  /** Damage the hero dealt this round (0 when the strike missed). */
  dealt: number;
  taken: number;
  critical: boolean;
  double: boolean;
  missed: boolean;
  dodged: boolean;
  blocked: boolean;
  enemyCritical: boolean;
  playerHp: number;
  enemyHp: number;
};
export type BattleKind = 'expedition' | 'dungeon' | 'arena';
export type Battle = {
  id: string;
  kind: BattleKind;
  enemy: string;
  enemyId: string;
  enemyLevel: number;
  enemyMaxHp: number;
  playerMaxHp: number;
  won: boolean;
  gold: number;
  xp: number;
  honour: number;
  fame: number;
  loot: ItemInstance | null;
  levelUp: boolean;
  rounds: BattleRound[];
  at: number;
  /** Kept for version-1 reports. */
  dungeon?: boolean;
};
export type CharacterAppearance = {
  gender: Gender | null;
  activeCostumeId: string | null;
};
export type DungeonProgress = {
  stage: number;
  hard: boolean;
  clears: number;
  hardClears: number;
};
export type Work = { jobId: JobId; start: number; until: number; gold: number };
export type Counters = {
  wins: number;
  losses: number;
  bossKills: number;
  training: number;
  arenaWins: number;
  arenaLosses: number;
  dungeonStages: number;
  dungeonClears: number;
  hardClears: number;
  workHours: number;
  worksDone: number;
  upgrades: number;
  smelted: number;
  goldEarned: number;
  itemsFound: number;
};
export type Daily = {
  day: number;
  level: number;
  region: number;
  progress: Record<DailyKind, number>;
  claimed: number[];
};
export type GameState = {
  saveVersion: 2;
  seed: number;
  nextUid: number;
  characterCreated: boolean;
  appearance: CharacterAppearance;
  ownedCostumeIds: string[];
  name: string;
  level: number;
  xp: number;
  gold: number;
  dust: number;
  honour: number;
  fame: number;
  hp: number;
  healAt: number;
  expPoints: number;
  expAt: number;
  dungeonPoints: number;
  dungeonAt: number;
  cooldowns: { expedition: number; dungeon: number; arena: number };
  stats: Record<Stat, number>;
  equipment: Record<Slot, ItemInstance | null>;
  bag: ItemInstance[];
  bagSize: number;
  packages: Package[];
  food: Record<FoodId, number>;
  blessings: Partial<Record<BlessingId, number>>;
  work: Work | null;
  counters: Counters;
  kills: Record<string, number>;
  dungeons: Record<string, DungeonProgress>;
  claimed: string[];
  daily: Daily;
  arena: { round: number };
  market: { period: number; level: number; nonce: number; bought: number[] };
  activeTitleId: string | null;
  history: Battle[];
  lastActionId: string | null;
};
export type Action =
  | { type: 'fight'; enemyId: string }
  | { type: 'dungeon'; dungeonId: string; hard?: boolean }
  | { type: 'dungeonReset'; dungeonId: string }
  | { type: 'arena'; index: number }
  | { type: 'train'; stat: Stat }
  | { type: 'equip'; uid: string }
  | { type: 'unequip'; slot: Slot }
  | { type: 'sell'; uid: string }
  | { type: 'smelt'; uid: string }
  | { type: 'upgrade'; uid: string }
  | { type: 'refine'; uid: string }
  | { type: 'take'; uid: string }
  | { type: 'takeAll' }
  | { type: 'bulkPackages'; mode: 'sell' | 'smelt'; maxQuality: number }
  | { type: 'buy'; index: number }
  | { type: 'refreshMarket' }
  | { type: 'buyFood'; foodId: FoodId; count: number }
  | { type: 'eat'; foodId: FoodId }
  | { type: 'blessing'; blessingId: BlessingId }
  | { type: 'work'; jobId: JobId; hours: number }
  | { type: 'cancelWork' }
  | { type: 'buyBag' }
  | { type: 'claim'; questId: string }
  | { type: 'claimDaily'; index: number }
  | { type: 'setTitle'; titleId: string | null }
  | { type: 'rename'; name: string }
  | { type: 'createCharacter'; gender: Gender; name: string }
  | { type: 'setGender'; gender: Gender }
  | { type: 'wearCostume'; costumeId: string | null };
export class GameError extends Error {}

/* ================= Random helpers ================= */

export function hash(...parts: (string | number)[]) {
  let h = 2166136261 >>> 0;
  for (const ch of parts.join('|')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T>(list: readonly T[], random: () => number) =>
  list[Math.min(list.length - 1, Math.floor(random() * list.length))];
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

/* ================= Economy curves ================= */

export const dayIndex = (now: number) =>
  Math.floor((now + DAY_OFFSET_MS) / 86_400_000);
export const marketPeriod = (now: number) =>
  Math.floor((now + DAY_OFFSET_MS) / MARKET_PERIOD_MS);
export const enemyXp = (level: number) =>
  Math.round(10 + 4 * level + 0.05 * level * level);
export const enemyGold = (level: number) =>
  Math.round(6 + 3.2 * level + 0.1 * level * level);
export function xpGoal(level: number) {
  return Math.round(enemyXp(level) * (2 + 2.2 * level + 0.05 * level * level));
}
export function trainCost(s: GameState, stat: Stat) {
  return Math.round(8 + 0.4 * Math.pow(s.stats[stat], 1.85));
}
export const statCap = (level: number) => 20 + level * 5;
export const foodPrice = (s: GameState, foodId: FoodId) =>
  Math.round((10 + 3 * s.level) * FOODS.find((f) => f.id === foodId)!.price);
export const blessingPrice = (s: GameState, id: BlessingId) =>
  Math.round((20 + 8 * s.level) * BLESSINGS.find((b) => b.id === id)!.price);
export const marketRefreshPrice = (s: GameState) => 20 + 10 * s.level;
export const workRate = (level: number) =>
  Math.round(15 + 5 * level + 0.06 * level * level);
export function workPay(level: number, jobId: JobId, hours: number) {
  const job = JOBS.find((j) => j.id === jobId)!;
  return Math.round(workRate(level) * job.rate * hours);
}

/* ================= Items ================= */

const QUALITY_VALUE = [1, 1.7, 2.8, 4.5, 7];
const SMELT_DUST = [1, 2, 4, 7, 12];
export const baseOf = (item: ItemInstance) => BASE_BY_ID.get(item.base)!;
export const prefixOf = (item: ItemInstance) =>
  item.prefix ? PREFIX_BY_ID.get(item.prefix) : undefined;
export const suffixOf = (item: ItemInstance) =>
  item.suffix ? SUFFIX_BY_ID.get(item.suffix) : undefined;

export function itemName(item: ItemInstance) {
  const parts = [baseOf(item).name];
  const p = prefixOf(item),
    x = suffixOf(item);
  if (p) parts.push(p.name);
  if (x) parts.push(x.name);
  return parts.join(' ') + (item.upgrade ? ` +${fa(item.upgrade)}` : '');
}

export type ItemStats = {
  min: number;
  max: number;
  armor: number;
  block: number;
  hp: number;
  damage: number;
  stats: Record<Stat, number>;
};
export function itemStats(item: ItemInstance): ItemStats {
  const b = baseOf(item);
  const m = QUALITY_MULT[item.quality] * (1 + 0.06 * item.upgrade);
  const r = (n: number) => Math.round(n * m);
  const out: ItemStats = {
    min: r(b.min ?? 0),
    max: r(b.max ?? 0),
    armor: r(b.armor ?? 0),
    block: r(b.block ?? 0),
    hp: r(b.hp ?? 0),
    damage: 0,
    stats: {
      strength: 0,
      agility: 0,
      vitality: 0,
      luck: 0,
      charisma: 0,
      intelligence: 0,
    },
  };
  for (const [k, v] of Object.entries(b.stats ?? {}))
    out.stats[k as Stat] += r(v);
  for (const affix of [prefixOf(item), suffixOf(item)]) {
    if (!affix) continue;
    for (const fx of affix.effects) {
      const v = r(fx.k * (1 + item.level * fx.per));
      if (fx.key === 'damage') out.damage += v;
      else if (fx.key === 'armor') out.armor += v;
      else if (fx.key === 'hp') out.hp += v;
      else if (fx.key === 'block') out.block += v;
      else out.stats[fx.key] += v;
    }
  }
  return out;
}
export function itemValue(item: ItemInstance) {
  const l = item.level;
  const affixes = (item.prefix ? 1 : 0) + (item.suffix ? 1 : 0);
  return Math.round(
    (15 + 5 * l + 0.5 * l * l) *
      QUALITY_VALUE[item.quality] *
      (1 + 0.25 * affixes) *
      (1 + 0.1 * item.upgrade),
  );
}
export const sellPrice = (item: ItemInstance) =>
  Math.max(1, Math.floor(itemValue(item) * 0.25));
export const smeltDust = (item: ItemInstance) =>
  Math.round(
    (1 + item.level * 0.25) *
      SMELT_DUST[item.quality] *
      (1 + item.upgrade * 0.2),
  );
export function upgradeCost(item: ItemInstance) {
  const plain = itemValue({ ...item, upgrade: 0 });
  return {
    gold: Math.round(plain * 0.2 * (item.upgrade + 1)),
    dust: Math.round((2 + item.level * 0.3) * (item.upgrade + 1)),
  };
}
export function refineCost(item: ItemInstance) {
  return {
    gold: Math.round(itemValue(item) * 0.8 * (item.quality + 1)),
    dust: Math.round((5 + item.level) * Math.pow(2, item.quality)),
  };
}
export const MAX_UPGRADE = 10;

const SLOT_WEIGHTS: [Slot, number][] = [
  ['weapon', 16],
  ['shield', 11],
  ['helmet', 12],
  ['armor', 14],
  ['gloves', 12],
  ['boots', 12],
  ['ring', 11],
  ['amulet', 10],
];
function rollSlot(random: () => number): Slot {
  let n = random() * 98;
  for (const [slot, w] of SLOT_WEIGHTS) {
    if ((n -= w) < 0) return slot;
  }
  return 'amulet';
}
function affixFits(a: Affix, slot: Slot, level: number) {
  return a.level <= level && !a.bannedSlots?.includes(slot);
}
export function tierFor(level: number) {
  let t = 0;
  TIER_LEVELS.forEach((l, i) => {
    if (l <= level) t = i;
  });
  return t;
}
export function rollItem(
  s: GameState,
  level: number,
  random: () => number,
  options: { minQuality?: number; qualityBoost?: number; slot?: Slot } = {},
): ItemInstance {
  level = clamp(Math.round(level), 1, LEVEL_CAP);
  const slot = options.slot ?? rollSlot(random);
  let tier = tierFor(level);
  if (tier > 0 && random() < 0.3) tier--;
  const base = ITEM_BASES.find((b) => b.slot === slot && b.tier === tier)!;
  const prefixes = PREFIXES.filter((a) => affixFits(a, slot, level));
  const suffixes = SUFFIXES.filter((a) => affixFits(a, slot, level));
  const prefix = random() < 0.35 ? pick(prefixes, random)?.id : undefined;
  const suffix = random() < 0.35 ? pick(suffixes, random)?.id : undefined;
  const roll = random() * 100;
  let quality = roll < 2 ? 3 : roll < 10 ? 2 : roll < 36 ? 1 : 0;
  if (roll < 0.4) quality = 4;
  quality += options.qualityBoost ?? 0;
  if (prefix || suffix) quality = Math.max(1, quality);
  quality = clamp(Math.max(quality, options.minQuality ?? 0), 0, 4);
  return {
    uid: `i${s.nextUid++}`,
    base: base.id,
    level,
    quality: quality as Quality,
    ...(prefix ? { prefix } : {}),
    ...(suffix ? { suffix } : {}),
    upgrade: 0,
  };
}
function baseItem(s: GameState, base: ItemBase): ItemInstance {
  return {
    uid: `i${s.nextUid++}`,
    base: base.id,
    level: base.level,
    quality: 0,
    upgrade: 0,
  };
}

/* ================= Market / arena / missions ================= */

export function marketStock(s: GameState): ItemInstance[] {
  const random = seeded(
    hash('market', s.seed, s.market.period, s.market.nonce, s.market.level),
  );
  const shadow = { nextUid: 0 } as GameState;
  const slots: Slot[] = [
    'weapon',
    'weapon',
    'shield',
    'helmet',
    'armor',
    'armor',
    'gloves',
    'boots',
    'ring',
    'amulet',
  ];
  const out: ItemInstance[] = [];
  for (let i = 0; i < MARKET_SIZE; i++) {
    const level = clamp(
      s.market.level - 2 + Math.floor(random() * 4),
      1,
      LEVEL_CAP,
    );
    const item = rollItem(shadow, level, random, {
      slot: slots[i] ?? rollSlot(random),
    });
    if (item.quality > 2) item.quality = 2;
    item.uid = `m${i}`;
    out.push(item);
  }
  return out;
}
export const marketPrice = (item: ItemInstance) =>
  Math.round(itemValue(item) * 1.1);

export type Rival = {
  index: number;
  id: string;
  name: string;
  level: number;
};
export function arenaRivals(s: GameState): Rival[] {
  const random = seeded(hash('arena', s.seed, s.arena.round));
  return [-2, -1, 0, 1, 2].map((offset, index) => {
    const level = clamp(
      s.level + offset + Math.floor(random() * 2),
      1,
      LEVEL_CAP,
    );
    return {
      index,
      id: `rival-${index}`,
      name: `${pick(RIVAL_NAMES, random)} ${pick(RIVAL_EPITHETS, random)}`,
      level,
    };
  });
}

export type DailyMission = {
  index: number;
  kind: DailyKind;
  name: string;
  text: string;
  target: number;
  progress: number;
  gold: number;
  xp: number;
  honour: number;
  claimed: boolean;
};
export function dailyMissions(s: GameState): DailyMission[] {
  const random = seeded(hash('daily', s.seed, s.daily.day));
  const pool = [...DAILY_TEMPLATES];
  const out: DailyMission[] = [];
  const hasDungeon = s.daily.level >= DUNGEONS[0].level;
  const regionName = REGIONS[s.daily.region].name;
  while (out.length < DAILY_COUNT && pool.length) {
    const total = pool.reduce((a, t) => a + t.weight, 0);
    let n = random() * total;
    let i = 0;
    while (i < pool.length - 1 && (n -= pool[i].weight) >= 0) i++;
    const t = pool.splice(i, 1)[0];
    if (t.kind === 'dungeon' && !hasDungeon) continue;
    if (t.kind === 'bosses' && s.daily.level < 4) continue;
    const [lo, hi] = t.targets;
    const target = lo + Math.floor(random() * (hi - lo + 1));
    const effort = target / hi;
    const index = out.length;
    out.push({
      index,
      kind: t.kind,
      name: t.name,
      text: t.text(target, regionName),
      target,
      progress: Math.min(target, s.daily.progress[t.kind] ?? 0),
      gold: Math.round(enemyGold(s.daily.level) * (6 + 10 * effort)),
      xp: Math.round(enemyXp(s.daily.level) * (2 + 4 * effort)),
      honour: Math.round(10 + 20 * effort),
      claimed: s.daily.claimed.includes(index),
    });
  }
  return out;
}

/* ================= Titles ================= */

export function rankTitle(honour: number) {
  return [...RANK_TITLES].reverse().find((t) => honour >= t.honour)!;
}
export function titleUnlocked(s: GameState, id: string): boolean {
  const rank = RANK_TITLES.find((t) => t.id === id);
  if (rank) return s.honour >= rank.honour;
  const k = (e: string) => s.kills[e] ?? 0;
  const dc = (d: string) => s.dungeons[d]?.clears ?? 0;
  switch (id) {
    case 'first-step':
      return s.claimed.includes('first');
    case 'simorgh-keeper':
      return dc('silent-fort') > 0;
    case 'road-warden':
      return k('captain') >= 25;
    case 'storyteller':
      return s.counters.wins >= 500;
    case 'glorious':
      return s.honour >= RANK_TITLES[4].honour;
    case 'arena-lion':
      return s.counters.arenaWins >= 100;
    case 'div-bane':
      return k('white-div') > 0;
    case 'seven-labours':
      return DUNGEONS.filter((d) => dc(d.id) > 0).length >= 7;
    case 'smith-friend':
      return s.counters.upgrades >= 50;
    case 'rich':
      return s.counters.goldEarned >= 500_000;
    case 'tireless':
      return s.counters.workHours >= 200;
    case 'dragon-slayer':
      return (s.dungeons['dragon-lair']?.hardClears ?? 0) > 0;
    case 'qaf-conqueror':
      return k('div-king') > 0;
  }
  return false;
}
export function activeTitle(s: GameState) {
  const chosen =
    s.activeTitleId && titleUnlocked(s, s.activeTitleId)
      ? [...RANK_TITLES, ...EARNED_TITLES].find((t) => t.id === s.activeTitleId)
      : undefined;
  return chosen ?? rankTitle(s.honour);
}

/* ================= Derived stats ================= */

export type Combatant = {
  name: string;
  level: number;
  hp: number;
  min: number;
  max: number;
  armor: number;
  agility: number;
  luck: number;
  block: number;
  charisma: number;
};
export const chance = (rating: number, level: number, scale: number) =>
  (scale * rating) / (rating + 12 + 4 * level);
const reduction = (armor: number, attackerLevel: number) =>
  Math.min(0.75, armor / (armor + 40 + 18 * attackerLevel));

export function blessed(s: GameState, id: BlessingId, now: number) {
  return (s.blessings[id] ?? 0) > now;
}

export function derived(s: GameState, now = 0) {
  const gear = SLOTS.map((slot) => s.equipment[slot]).filter(
    (i): i is ItemInstance => !!i,
  );
  const title: TitleBonus = activeTitle(s).bonus;
  const pct = (k: keyof TitleBonus) => 1 + (title[k] ?? 0) / 100;
  const totals = { ...s.stats };
  let armor = 0,
    hpBonus = 0,
    flatDamage = 0,
    block = 0;
  let min = 1,
    max = 2;
  for (const item of gear) {
    const st = itemStats(item);
    for (const stat of STATS) totals[stat] += st.stats[stat];
    armor += st.armor;
    hpBonus += st.hp;
    flatDamage += st.damage;
    block += st.block;
    if (baseOf(item).slot === 'weapon') {
      min = st.min;
      max = st.max;
    }
  }
  for (const stat of STATS) totals[stat] = Math.round(totals[stat] * pct(stat));
  const strBonus = Math.floor(totals.strength * 0.3) + flatDamage;
  const dmgMult = pct('damage') * (blessed(s, 'mehr', now) ? 1.1 : 1);
  armor = Math.round(
    armor * pct('armor') * (blessed(s, 'tir', now) ? 1.15 : 1),
  );
  const maxHp = Math.round(
    (40 + totals.vitality * 7 + s.level * 8 + hpBonus) * pct('hp'),
  );
  const intFactor =
    totals.intelligence / (totals.intelligence + 30 + 5 * s.level);
  return {
    totals,
    min: Math.round((min + strBonus) * dmgMult),
    max: Math.round((max + strBonus) * dmgMult),
    /** Average damage, kept for summaries. */
    attack: Math.round(((min + max) / 2 + strBonus) * dmgMult),
    armor,
    maxHp,
    blockRating: Math.floor(totals.strength / 2) + block,
    dodge: chance(totals.agility, s.level, 0.4),
    crit: chance(totals.luck, s.level, 0.45),
    block: chance(Math.floor(totals.strength / 2) + block, s.level, 0.45),
    double: chance(totals.charisma, s.level, 0.35),
    reduction: reduction(armor, s.level),
    regen:
      maxHp *
      (0.012 + 0.018 * intFactor) *
      (blessed(s, 'anahita', now) ? 2 : 1),
    foodBonus:
      1 + totals.intelligence / (totals.intelligence + 50 + 5 * s.level),
    xpBonus: 1 + 0.2 * intFactor + (blessed(s, 'bahram', now) ? 0.15 : 0),
  };
}
export function playerCombatant(s: GameState, now = 0): Combatant {
  const d = derived(s, now);
  return {
    name: s.name,
    level: s.level,
    hp: s.hp,
    min: d.min,
    max: d.max,
    armor: d.armor,
    agility: d.totals.agility,
    luck: d.totals.luck,
    block: d.blockRating,
    charisma: d.totals.charisma,
  };
}

const PROFILES: Record<
  Profile | 'rival',
  {
    hp: number;
    dmg: number;
    armor: number;
    agi: number;
    luck: number;
    block: number;
    cha: number;
  }
> = {
  beast: {
    hp: 0.9,
    dmg: 1,
    armor: 0.6,
    agi: 1.4,
    luck: 1.1,
    block: 0.5,
    cha: 1,
  },
  warrior: { hp: 1, dmg: 1, armor: 1.2, agi: 1, luck: 1, block: 1.4, cha: 1 },
  brute: {
    hp: 1.35,
    dmg: 1.1,
    armor: 0.9,
    agi: 0.6,
    luck: 0.9,
    block: 1,
    cha: 0.8,
  },
  mystic: {
    hp: 0.9,
    dmg: 1.12,
    armor: 0.8,
    agi: 1,
    luck: 1.4,
    block: 0.8,
    cha: 1.4,
  },
  boss: {
    hp: 1.9,
    dmg: 1.3,
    armor: 1.3,
    agi: 1.15,
    luck: 1.15,
    block: 1.2,
    cha: 1.15,
  },
  rival: {
    hp: 1.1,
    dmg: 1.02,
    armor: 1.1,
    agi: 1.1,
    luck: 1.1,
    block: 1.1,
    cha: 1.1,
  },
};
export function enemyCombatant(
  name: string,
  level: number,
  profile: Profile | 'rival',
  scale = 1,
): Combatant {
  const p = PROFILES[profile];
  const L = level;
  const avg = (5 + 2.5 * L + 0.05 * L * L) * p.dmg * scale;
  return {
    name,
    level: L,
    hp: Math.round((30 + 20 * L + 0.4 * L * L) * p.hp * scale),
    min: Math.max(1, Math.round(avg * 0.8)),
    max: Math.max(2, Math.round(avg * 1.2)),
    armor: Math.round((2 + 3.2 * L) * p.armor),
    agility: Math.round((4 + 2.4 * L) * p.agi),
    luck: Math.round((3 + 1.8 * L) * p.luck),
    block: Math.round((2 + 1 * L) * p.block),
    charisma: Math.round((3 + 1.6 * L) * p.cha),
  };
}
export const DUNGEON_SCALE = 1.1;
export function dungeonEnemy(d: string, stage: number, hard: boolean) {
  const e = DUNGEON_BY_ID.get(d)!.stages[stage];
  return enemyCombatant(
    e.name,
    e.level + (hard ? HARD_LEVEL_BONUS : 0),
    e.profile,
    DUNGEON_SCALE,
  );
}
export const expeditionEnemy = (e: Enemy) =>
  enemyCombatant(e.name, e.level, e.profile);
export const rivalCombatant = (r: Rival) =>
  enemyCombatant(r.name, r.level, 'rival');

/* ================= Combat ================= */

export function simulate(
  hero: Combatant,
  foe: Combatant,
  random: () => number,
) {
  let hp = hero.hp,
    foeHp = foe.hp;
  const rounds: BattleRound[] = [];
  const heroCrit = Math.min(0.45, chance(hero.luck, foe.level, 0.45)),
    heroDouble = Math.min(0.35, chance(hero.charisma, foe.level, 0.35)),
    heroDodge = Math.min(0.4, chance(hero.agility, foe.level, 0.4)),
    heroBlock = Math.min(0.45, chance(hero.block, foe.level, 0.45)),
    foeCrit = Math.min(0.45, chance(foe.luck, hero.level, 0.45)),
    foeDouble = Math.min(0.35, chance(foe.charisma, hero.level, 0.35)),
    foeDodge = Math.min(0.4, chance(foe.agility, hero.level, 0.4)),
    foeBlock = Math.min(0.45, chance(foe.block, hero.level, 0.45)),
    heroRed = reduction(hero.armor, foe.level),
    foeRed = reduction(foe.armor, hero.level);
  const strike = (
    a: Combatant,
    crit: number,
    red: number,
    dodge: number,
    block: number,
  ) => {
    if (random() < dodge)
      return { dmg: 0, crit: false, missed: true, blocked: false };
    const isCrit = random() < crit;
    const blocked = random() < block;
    const raw = a.min + random() * (a.max - a.min);
    const dmg = Math.max(
      1,
      Math.round(raw * (isCrit ? 1.7 : 1) * (1 - red) * (blocked ? 0.5 : 1)),
    );
    return { dmg, crit: isCrit, missed: false, blocked };
  };
  for (let r = 1; r <= 25 && hp > 0 && foeHp > 0; r++) {
    let dealt = 0,
      critical = false,
      missed = false,
      double = false;
    const first = strike(hero, heroCrit, foeRed, foeDodge, foeBlock);
    dealt += first.dmg;
    critical = first.crit;
    missed = first.missed;
    foeHp = Math.max(0, foeHp - first.dmg);
    if (foeHp > 0 && random() < heroDouble) {
      const second = strike(hero, heroCrit, foeRed, foeDodge, foeBlock);
      double = true;
      dealt += second.dmg;
      critical ||= second.crit;
      foeHp = Math.max(0, foeHp - second.dmg);
    }
    let taken = 0,
      dodged = false,
      blocked = false,
      enemyCritical = false;
    if (foeHp > 0) {
      const hits = random() < foeDouble ? 2 : 1;
      for (let i = 0; i < hits && hp > 0; i++) {
        const blow = strike(foe, foeCrit, heroRed, heroDodge, heroBlock);
        taken += blow.dmg;
        dodged ||= blow.missed;
        blocked ||= blow.blocked;
        enemyCritical ||= blow.crit;
        hp = Math.max(0, hp - blow.dmg);
      }
    }
    rounds.push({
      round: r,
      dealt,
      taken,
      critical,
      double,
      missed,
      dodged,
      blocked,
      enemyCritical,
      playerHp: hp,
      enemyHp: foeHp,
    });
  }
  // After the last round the fighter who lost less of their life wins.
  const won =
    foeHp === 0 || (hp > 0 && foeHp / foe.hp < hp / Math.max(1, hero.hp));
  return { won, hp, foeHp, rounds };
}

/* ================= State lifecycle ================= */

const emptyCounters = (): Counters => ({
  wins: 0,
  losses: 0,
  bossKills: 0,
  training: 0,
  arenaWins: 0,
  arenaLosses: 0,
  dungeonStages: 0,
  dungeonClears: 0,
  hardClears: 0,
  workHours: 0,
  worksDone: 0,
  upgrades: 0,
  smelted: 0,
  goldEarned: 0,
  itemsFound: 0,
});
const emptyDailyProgress = (): Record<DailyKind, number> => ({
  wins: 0,
  regionWins: 0,
  bosses: 0,
  dungeon: 0,
  arena: 0,
  training: 0,
  forge: 0,
  workHours: 0,
});
const emptyEquipment = (): Record<Slot, ItemInstance | null> => ({
  weapon: null,
  shield: null,
  helmet: null,
  armor: null,
  gloves: null,
  boots: null,
  ring: null,
  amulet: null,
});

export function newGame(now = Date.now(), seed?: number): GameState {
  const s: GameState = {
    saveVersion: 2,
    seed: seed ?? hash('seed', now, Math.random()),
    nextUid: 1,
    characterCreated: false,
    appearance: { gender: null, activeCostumeId: null },
    ownedCostumeIds: [...STARTER_COSTUME_IDS],
    name: 'پهلوان تازه‌نفس',
    level: 1,
    xp: 0,
    gold: 350,
    dust: 0,
    honour: 0,
    fame: 0,
    hp: 0,
    healAt: now,
    expPoints: EXPEDITION_MAX,
    expAt: now,
    dungeonPoints: DUNGEON_MAX,
    dungeonAt: now,
    cooldowns: { expedition: 0, dungeon: 0, arena: 0 },
    stats: {
      strength: 10,
      agility: 8,
      vitality: 10,
      luck: 5,
      charisma: 5,
      intelligence: 5,
    },
    equipment: emptyEquipment(),
    bag: [],
    bagSize: 40,
    packages: [],
    food: { bread: 3, kebab: 0, sharbat: 0 },
    blessings: {},
    work: null,
    counters: emptyCounters(),
    kills: {},
    dungeons: {},
    claimed: [],
    daily: {
      day: dayIndex(now),
      level: 1,
      region: 0,
      progress: emptyDailyProgress(),
      claimed: [],
    },
    arena: { round: 0 },
    market: { period: marketPeriod(now), level: 1, nonce: 0, bought: [] },
    activeTitleId: null,
    history: [],
    lastActionId: null,
  };
  s.equipment.weapon = baseItem(s, BASE_BY_ID.get('iron-blade')!);
  s.equipment.armor = baseItem(s, BASE_BY_ID.get('leather')!);
  s.hp = derived(s).maxHp;
  return s;
}

const knownCostumes = new Set<string>(COSTUMES.map((c) => c.id));
type LegacyState = {
  saveVersion?: number;
  energy?: number;
  energyAt?: number;
  cooldownUntil?: number;
  inventory?: unknown;
  equipment?: Record<string, unknown>;
  food?: unknown;
  wins?: number;
  training?: number;
  defeated?: unknown;
  dungeonStage?: number;
  dungeonClears?: number;
  stats?: Partial<Record<Stat, number>>;
};

function migrateV1(raw: Record<string, unknown>, now: number): GameState {
  const old = raw as LegacyState & Record<string, unknown>;
  const s = newGame(
    typeof old.energyAt === 'number' ? old.energyAt : now,
    hash(
      'legacy',
      typeof old.name === 'string' ? old.name : '',
      Number(old.energyAt ?? 0),
    ),
  );
  s.name = typeof old.name === 'string' ? old.name : s.name;
  s.level = clamp(Number(old.level) || 1, 1, LEVEL_CAP);
  s.xp = Math.max(0, Number(old.xp) || 0);
  s.gold = Math.max(0, Number(old.gold) || 0);
  s.stats = { ...s.stats, ...old.stats };
  for (const stat of STATS)
    s.stats[stat] = Math.max(1, Math.round(Number(s.stats[stat]) || 5));
  s.expPoints = clamp(
    Math.round(((Number(old.energy) || 0) / 12) * EXPEDITION_MAX),
    0,
    EXPEDITION_MAX,
  );
  s.expAt = now;
  s.food.bread = clamp(Number(old.food) || 0, 0, 99);
  s.counters.wins = Number(old.wins) || 0;
  s.counters.training = Number(old.training) || 0;
  s.counters.dungeonClears = Number(old.dungeonClears) || 0;
  if (Array.isArray(old.defeated))
    for (const id of old.defeated)
      if (typeof id === 'string' && ENEMY_BY_ID.has(id)) s.kills[id] = 1;
  s.dungeons['silent-fort'] = {
    stage: clamp(Number(old.dungeonStage) || 0, 0, 2),
    hard: false,
    clears: Number(old.dungeonClears) || 0,
    hardClears: 0,
  };
  if (Array.isArray(old.claimed))
    s.claimed = old.claimed.filter(
      (id): id is string =>
        typeof id === 'string' && QUESTS.some((q) => q.id === id),
    );
  // Items: equipped ids first, remaining inventory into the bag.
  const inventory = Array.isArray(old.inventory)
    ? old.inventory.filter((id): id is string => typeof id === 'string')
    : [];
  s.equipment = emptyEquipment();
  const legacySlots: [string, Slot][] = [
    ['weapon', 'weapon'],
    ['armor', 'armor'],
    ['charm', 'amulet'],
  ];
  for (const [from, to] of legacySlots) {
    const id = old.equipment?.[from];
    const base = typeof id === 'string' ? BASE_BY_ID.get(id) : undefined;
    if (base && base.slot === to) {
      s.equipment[to] = baseItem(s, base);
      const i = inventory.indexOf(base.id);
      if (i >= 0) inventory.splice(i, 1);
    }
  }
  const quality: Record<string, Quality> = {
    'bronze-blade': 1,
    scale: 1,
    cypress: 1,
    'sun-blade': 2,
    guardian: 2,
    simorgh: 2,
  };
  for (const id of inventory) {
    const base = BASE_BY_ID.get(id);
    if (!base || s.bag.length >= s.bagSize) continue;
    const item = baseItem(s, base);
    // Version-1 items were balanced for levels 1–7.
    item.level = Math.min(item.level, 7);
    item.quality = quality[id] ?? 0;
    s.bag.push(item);
  }
  for (const slot of SLOTS) {
    const item = s.equipment[slot];
    if (!item) continue;
    item.level = Math.min(item.level, 7);
    item.quality = quality[item.base] ?? 0;
  }
  s.history = [];
  s.characterCreated = raw.characterCreated === true;
  s.appearance = (raw.appearance as CharacterAppearance) ?? s.appearance;
  s.ownedCostumeIds = (raw.ownedCostumeIds as string[]) ?? s.ownedCostumeIds;
  s.lastActionId = (raw.lastActionId as string | null) ?? null;
  s.hp = clamp(Number(old.hp) || 1, 1, derived(s).maxHp);
  return s;
}

export function normalizeSave(input: GameState, now = Date.now()): GameState {
  const raw = input as unknown as Record<string, unknown>;
  const s =
    raw.saveVersion === 2
      ? structuredClone(input)
      : migrateV1(structuredClone(raw), now);
  const ap = raw.appearance as
    | { gender?: unknown; activeCostumeId?: unknown }
    | undefined;
  const gender =
    ap?.gender === 'female' || ap?.gender === 'male' ? ap.gender : null;
  const owned = [
    ...new Set([
      ...(Array.isArray(raw.ownedCostumeIds)
        ? raw.ownedCostumeIds.filter(
            (id): id is string =>
              typeof id === 'string' && knownCostumes.has(id),
          )
        : []),
      ...STARTER_COSTUME_IDS,
    ]),
  ];
  const costume =
    typeof ap?.activeCostumeId === 'string' &&
    owned.includes(ap.activeCostumeId)
      ? ap.activeCostumeId
      : null;
  s.appearance = { gender, activeCostumeId: costume };
  s.ownedCostumeIds = owned;
  s.characterCreated = raw.characterCreated === true && gender !== null;
  s.counters = { ...emptyCounters(), ...s.counters };
  s.daily.progress = { ...emptyDailyProgress(), ...s.daily.progress };
  s.food = Object.assign({ bread: 0, kebab: 0, sharbat: 0 }, s.food);
  return s;
}

export function playableGame(
  now = Date.now(),
  gender: Gender = 'female',
  seed = 7,
): GameState {
  return transition(
    newGame(now, seed),
    { type: 'createCharacter', gender, name: 'پهلوان تازه‌نفس' },
    now,
  ).state;
}

export function returningForAppearance(s: GameState) {
  return (
    !s.characterCreated &&
    (s.level > 1 ||
      s.counters.wins > 0 ||
      s.xp > 0 ||
      s.claimed.length > 0 ||
      s.counters.training > 0 ||
      s.gold !== 350 ||
      s.history.length > 0)
  );
}

export function highestRegion(s: GameState) {
  let r = 0;
  REGIONS.forEach((_, i) => {
    if (s.level >= regionLevel(i)) r = i;
  });
  return r;
}

/** Applies every time-based effect up to `now`. Pure and idempotent. */
export function regenerate(input: GameState, now = Date.now()): GameState {
  const s = structuredClone(input);
  const tick = (
    value: number,
    at: number,
    max: number,
    ms: number,
  ): [number, number] => {
    if (value >= max) return [value, now];
    const ticks = Math.max(0, Math.floor((now - at) / ms));
    if (!ticks) return [value, at];
    const next = Math.min(max, value + ticks);
    return [next, next >= max ? now : at + ticks * ms];
  };
  [s.expPoints, s.expAt] = tick(
    s.expPoints,
    s.expAt,
    EXPEDITION_MAX,
    EXPEDITION_MS,
  );
  [s.dungeonPoints, s.dungeonAt] = tick(
    s.dungeonPoints,
    s.dungeonAt,
    DUNGEON_MAX,
    DUNGEON_MS,
  );
  // Work finishes on its own; wages land when the shift ends.
  if (s.work && s.work.until <= now) {
    const hours = Math.round((s.work.until - s.work.start) / 3_600_000);
    s.gold += s.work.gold;
    s.counters.goldEarned += s.work.gold;
    s.counters.workHours += hours;
    s.counters.worksDone++;
    progressDaily(s, s.work.until, 'workHours', hours);
    s.work = null;
  }
  const d = derived(s, now);
  if (s.hp >= d.maxHp) {
    s.hp = d.maxHp;
    s.healAt = now;
  } else {
    const ticks = Math.max(0, Math.floor((now - s.healAt) / HEAL_MS));
    if (ticks) {
      s.hp = Math.min(d.maxHp, Math.round(s.hp + ticks * d.regen));
      s.healAt = s.hp >= d.maxHp ? now : s.healAt + ticks * HEAL_MS;
    }
  }
  // Unopened packages expire into coins.
  const keep: Package[] = [];
  for (const p of s.packages) {
    if (now - p.at >= PACKAGE_MS) {
      const g = sellPrice(p.item);
      s.gold += g;
      s.counters.goldEarned += g;
    } else keep.push(p);
  }
  s.packages = keep;
  rollDaily(s, now);
  const period = marketPeriod(now);
  if (s.market.period !== period)
    s.market = { period, level: s.level, nonce: 0, bought: [] };
  for (const id of Object.keys(s.blessings) as BlessingId[])
    if ((s.blessings[id] ?? 0) <= now) delete s.blessings[id];
  return s;
}
function rollDaily(s: GameState, now: number) {
  const day = dayIndex(now);
  if (s.daily.day !== day)
    s.daily = {
      day,
      level: s.level,
      region: highestRegion(s),
      progress: emptyDailyProgress(),
      claimed: [],
    };
}
function progressDaily(s: GameState, now: number, kind: DailyKind, n = 1) {
  rollDaily(s, now);
  s.daily.progress[kind] += n;
}

/* ================= Rules helpers ================= */

export function enemyUnlocked(s: GameState, e: Enemy) {
  const list = ENEMIES.filter((a) => a.region === e.region);
  const index = list.findIndex((a) => a.id === e.id);
  return (
    s.level >= regionLevel(e.region) &&
    (index === 0 || (s.kills[list[index - 1].id] ?? 0) > 0)
  );
}
export function dungeonUnlocked(s: GameState, dungeonId: string) {
  const d = DUNGEON_BY_ID.get(dungeonId);
  return !!d && s.level >= d.level;
}
export function dungeonProgress(s: GameState, id: string): DungeonProgress {
  return s.dungeons[id] ?? { stage: 0, hard: false, clears: 0, hardClears: 0 };
}
export function questProgress(s: GameState, q: Quest) {
  switch (q.kind) {
    case 'wins':
      return s.counters.wins;
    case 'training':
      return s.counters.training;
    case 'kill':
      return Math.min(1, s.kills[q.ref!] ?? 0);
    case 'dungeon':
      return Math.min(1, s.dungeons[q.ref!]?.clears ?? 0);
    case 'level':
      return s.level;
    case 'arena':
      return s.counters.arenaWins;
    case 'work':
      return q.id === 'work-1' ? s.counters.worksDone : s.counters.workHours;
    case 'upgrade':
      return s.counters.upgrades;
    case 'honour':
      return s.honour;
    case 'bosses':
      return s.counters.bossKills;
    case 'hard':
      return s.counters.hardClears;
  }
}
/** Experience multiplier for fighting far below your level. */
export function xpScale(playerLevel: number, enemyLevel: number) {
  const gap = playerLevel - enemyLevel;
  if (gap <= 2) return Math.min(1.25, 1 + Math.max(0, -gap) * 0.05);
  return Math.max(0.1, 1 - (gap - 2) * 0.15);
}
export const minFightHp = (maxHp: number) =>
  Math.max(10, Math.ceil(maxHp * 0.1));

function awardXp(s: GameState, xp: number) {
  const before = s.level;
  s.xp += xp;
  while (s.level < LEVEL_CAP && s.xp >= xpGoal(s.level)) {
    s.xp -= xpGoal(s.level);
    s.level++;
    s.stats.strength++;
    s.stats.vitality++;
  }
  if (s.level >= LEVEL_CAP) s.xp = Math.min(s.xp, xpGoal(s.level));
  if (s.level > before) s.hp = derived(s).maxHp;
  return s.level > before;
}
function earn(s: GameState, gold: number) {
  s.gold += gold;
  s.counters.goldEarned += gold;
}
function requireGold(s: GameState, cost: number) {
  if (s.gold < cost)
    throw new GameError(
      `سکهٔ کافی نداری؛ ${fa(cost)} سکه لازم است. با لشکرکشی، کار یا مأموریت‌ها سکه به دست بیاور.`,
    );
  s.gold -= cost;
}
function requireDust(s: GameState, cost: number) {
  if (s.dust < cost)
    throw new GameError(
      `غبار گوهر کافی نداری؛ ${fa(cost)} لازم است. وسایل اضافه را در آهنگری گداز کن.`,
    );
  s.dust -= cost;
}
function addPackage(
  s: GameState,
  item: ItemInstance,
  source: string,
  now: number,
) {
  s.counters.itemsFound++;
  if (s.packages.length >= PACKAGE_CAP) {
    // Oldest package is sold to make room.
    const old = s.packages.shift()!;
    earn(s, sellPrice(old.item));
  }
  s.packages.push({ item, at: now, source });
}
type Where =
  | { loc: 'bag'; index: number; item: ItemInstance }
  | { loc: 'pkg'; index: number; item: ItemInstance }
  | { loc: 'equip'; slot: Slot; item: ItemInstance };
export function findItem(s: GameState, uid: unknown): Where | null {
  if (typeof uid !== 'string') return null;
  let i = s.bag.findIndex((x) => x.uid === uid);
  if (i >= 0) return { loc: 'bag', index: i, item: s.bag[i] };
  i = s.packages.findIndex((p) => p.item.uid === uid);
  if (i >= 0) return { loc: 'pkg', index: i, item: s.packages[i].item };
  for (const slot of SLOTS)
    if (s.equipment[slot]?.uid === uid)
      return { loc: 'equip', slot, item: s.equipment[slot]! };
  return null;
}
function removeItem(s: GameState, w: Where) {
  if (w.loc === 'bag') s.bag.splice(w.index, 1);
  else if (w.loc === 'pkg') s.packages.splice(w.index, 1);
  else s.equipment[w.slot] = null;
}
function parseGender(value: unknown): Gender {
  if (value === 'female' || value === 'male') return value;
  throw new GameError('برای ادامه، جنسیت پهلوانت را انتخاب کن.');
}
function parseName(value: unknown) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (
    name.length < 2 ||
    name.length > 24 ||
    name
      .split('')
      .some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127) ||
    /[<>]/.test(name)
  )
    throw new GameError('نام پهلوان باید بین ۲ تا ۲۴ نویسه باشد.');
  return name;
}
export function previewEquipment(
  input: GameState,
  slot: Slot,
  item: ItemInstance | null,
): GameState {
  const s = structuredClone(input);
  s.equipment[slot] = item;
  return s;
}
export function previewCostume(
  input: GameState,
  costumeId: string | null,
): GameState {
  const s = structuredClone(input);
  s.appearance = { ...s.appearance, activeCostumeId: costumeId };
  return s;
}
function requireIdle(s: GameState, now: number) {
  if (s.work && s.work.until > now)
    throw new GameError(
      'پهلوانت سر کار است. کار را لغو کن یا تا پایان نوبت صبر کن.',
    );
}
function requireHealth(s: GameState) {
  const max = derived(s).maxHp;
  if (s.hp < minFightHp(max))
    throw new GameError(
      `سلامتی‌ات کمتر از ${fa(minFightHp(max))} است. خوراک بخور یا برای بازیابی صبر کن.`,
    );
}

/* ================= Transition ================= */

export function transition(
  input: GameState,
  action: Action,
  now = Date.now(),
  random: () => number = Math.random,
): { state: GameState; message: string; battle?: Battle } {
  const s = regenerate(normalizeSave(input, now), now);
  if (!action || typeof action !== 'object')
    throw new GameError('درخواست نامعتبر است.');
  if (!s.characterCreated && action.type !== 'createCharacter')
    throw new GameError('ابتدا جنسیت پهلوانت را انتخاب کن.');

  if (
    action.type === 'fight' ||
    action.type === 'dungeon' ||
    action.type === 'arena'
  )
    return battle(s, action, now, random);

  let message = 'انجام شد.';
  switch (action.type) {
    case 'dungeonReset': {
      const p = s.dungeons[action.dungeonId];
      if (!p || p.stage === 0)
        throw new GameError('این سیاه‌چال در جریان نیست.');
      p.stage = 0;
      message = 'از سیاه‌چال بیرون آمدی. پیشرفت تالارها از نو آغاز می‌شود.';
      break;
    }
    case 'train': {
      if (!STATS.includes(action.stat))
        throw new GameError('ویژگی نامعتبر است.');
      if (s.stats[action.stat] >= statCap(s.level))
        throw new GameError(
          `در سطح ${fa(s.level)} این ویژگی بیش از ${fa(statCap(s.level))} تمرین نمی‌شود.`,
        );
      requireGold(s, trainCost(s, action.stat));
      s.stats[action.stat]++;
      if (action.stat === 'vitality') s.hp += 7;
      s.counters.training++;
      progressDaily(s, now, 'training');
      message = 'تمرین تمام شد. یک امتیاز به ویژگی‌ات اضافه شد.';
      break;
    }
    case 'equip': {
      const w = findItem(s, action.uid);
      if (!w || w.loc !== 'bag')
        throw new GameError('این وسیله در کیسهٔ تو نیست.');
      if (w.item.level > s.level)
        throw new GameError(
          `این وسیله از سطح ${fa(w.item.level)} پوشیدنی است.`,
        );
      const slot = baseOf(w.item).slot;
      s.bag.splice(w.index, 1);
      const prev = s.equipment[slot];
      if (prev) s.bag.push(prev);
      s.equipment[slot] = w.item;
      s.hp = Math.min(s.hp, derived(s).maxHp);
      message = `${itemName(w.item)} را پوشیدی.`;
      break;
    }
    case 'unequip': {
      if (!SLOTS.includes(action.slot))
        throw new GameError('جایگاه نامعتبر است.');
      const item = s.equipment[action.slot];
      if (!item) throw new GameError('این جایگاه خالی است.');
      if (s.bag.length >= s.bagSize)
        throw new GameError('کیسه پر است. ابتدا وسیله‌ای بفروش.');
      s.equipment[action.slot] = null;
      s.bag.push(item);
      s.hp = Math.min(s.hp, derived(s).maxHp);
      message = 'وسیله از تن خارج شد و در کیسه ماند.';
      break;
    }
    case 'sell':
    case 'smelt': {
      const w = findItem(s, action.uid);
      if (!w || w.loc === 'equip')
        throw new GameError(
          w ? 'ابتدا این وسیله را از تن خارج کن.' : 'وسیله پیدا نشد.',
        );
      removeItem(s, w);
      if (action.type === 'sell') {
        const g = sellPrice(w.item);
        earn(s, g);
        message = `${itemName(w.item)} به ${fa(g)} سکه فروخته شد.`;
      } else {
        const d = smeltDust(w.item);
        s.dust += d;
        s.counters.smelted++;
        progressDaily(s, now, 'forge');
        message = `${itemName(w.item)} گداخته شد: ${fa(d)} غبار گوهر.`;
      }
      break;
    }
    case 'upgrade':
    case 'refine': {
      const w = findItem(s, action.uid);
      if (!w || w.loc === 'pkg')
        throw new GameError('وسیله باید در کیسه یا بر تن باشد.');
      const item = w.item;
      if (action.type === 'upgrade') {
        if (item.upgrade >= MAX_UPGRADE)
          throw new GameError('این وسیله به بیشترین تقویت رسیده است.');
        const cost = upgradeCost(item);
        if (s.gold < cost.gold) requireGold(s, cost.gold);
        requireDust(s, cost.dust);
        s.gold -= cost.gold;
        item.upgrade++;
        message = `${itemName(item)} تقویت شد.`;
      } else {
        if (item.quality >= 4)
          throw new GameError('این وسیله در بالاترین درجه است.');
        const cost = refineCost(item);
        if (s.gold < cost.gold) requireGold(s, cost.gold);
        requireDust(s, cost.dust);
        s.gold -= cost.gold;
        item.quality = (item.quality + 1) as Quality;
        message = `درجهٔ ${itemName(item)} بالا رفت.`;
      }
      s.counters.upgrades++;
      progressDaily(s, now, 'forge');
      break;
    }
    case 'take': {
      const w = findItem(s, action.uid);
      if (!w || w.loc !== 'pkg') throw new GameError('بسته پیدا نشد.');
      if (s.bag.length >= s.bagSize)
        throw new GameError('کیسه پر است. ابتدا وسیله‌ای بفروش یا گداز کن.');
      s.packages.splice(w.index, 1);
      s.bag.push(w.item);
      message = `${itemName(w.item)} به کیسه رفت.`;
      break;
    }
    case 'takeAll': {
      let n = 0;
      while (s.packages.length && s.bag.length < s.bagSize) {
        s.bag.push(s.packages.pop()!.item);
        n++;
      }
      if (!n)
        throw new GameError(
          s.packages.length ? 'کیسه پر است.' : 'بسته‌ای برای باز کردن نداری.',
        );
      message = `${fa(n)} بسته باز شد.`;
      break;
    }
    case 'bulkPackages': {
      const q = clamp(Math.floor(Number(action.maxQuality)), 0, 4);
      const chosen = s.packages.filter((p) => p.item.quality <= q);
      if (!chosen.length) throw new GameError('بسته‌ای با این درجه نداری.');
      s.packages = s.packages.filter((p) => p.item.quality > q);
      let total = 0;
      for (const p of chosen) {
        if (action.mode === 'smelt') total += smeltDust(p.item);
        else total += sellPrice(p.item);
      }
      if (action.mode === 'smelt') {
        s.dust += total;
        s.counters.smelted += chosen.length;
        progressDaily(s, now, 'forge', chosen.length);
        message = `${fa(chosen.length)} وسیله گداخته شد: ${fa(total)} غبار گوهر.`;
      } else {
        earn(s, total);
        message = `${fa(chosen.length)} وسیله به ${fa(total)} سکه فروخته شد.`;
      }
      break;
    }
    case 'buy': {
      const stock = marketStock(s);
      const index = Number(action.index);
      const item = Number.isInteger(index) ? stock[index] : undefined;
      if (!item) throw new GameError('کالا پیدا نشد.');
      if (s.market.bought.includes(index))
        throw new GameError('این کالا فروخته شده است.');
      if (s.bag.length >= s.bagSize)
        throw new GameError('کیسه پر است. ابتدا وسیله‌ای بفروش.');
      requireGold(s, marketPrice(item));
      s.market.bought.push(index);
      s.bag.push({ ...item, uid: `i${s.nextUid++}` });
      message = `${itemName(item)} به کیسه اضافه شد.`;
      break;
    }
    case 'refreshMarket': {
      requireGold(s, marketRefreshPrice(s));
      s.market = {
        period: s.market.period,
        level: s.level,
        nonce: s.market.nonce + 1,
        bought: [],
      };
      message = 'بازرگانان کالای تازه آوردند.';
      break;
    }
    case 'buyFood': {
      const food = FOODS.find((f) => f.id === action.foodId);
      const count = Math.floor(Number(action.count));
      if (!food || !(count >= 1 && count <= 20))
        throw new GameError('خوراک نامعتبر است.');
      if (s.food[food.id] + count > 50)
        throw new GameError('از این خوراک بیش از ۵۰ عدد نمی‌توان داشت.');
      requireGold(s, foodPrice(s, food.id) * count);
      s.food[food.id] += count;
      message = `${fa(count)} ${food.name} خریدی.`;
      break;
    }
    case 'eat': {
      const food = FOODS.find((f) => f.id === action.foodId);
      if (!food) throw new GameError('خوراک نامعتبر است.');
      if (s.food[food.id] < 1) throw new GameError(`${food.name} نداری.`);
      const d = derived(s, now);
      if (s.hp >= d.maxHp) throw new GameError('سلامتی‌ات کامل است.');
      s.food[food.id]--;
      const heal = Math.round(d.maxHp * food.heal * d.foodBonus);
      s.hp = Math.min(d.maxHp, s.hp + heal);
      s.healAt = now;
      message = `${food.name} خوردی و ${fa(heal)} سلامتی بازیابی شد.`;
      break;
    }
    case 'blessing': {
      const b = BLESSINGS.find((x) => x.id === action.blessingId);
      if (!b) throw new GameError('برکت نامعتبر است.');
      const until = Math.max(now, s.blessings[b.id] ?? 0);
      if (until - now >= 6 * 60 * 60_000)
        throw new GameError('این برکت بیش از هشت ساعت انباشته نمی‌شود.');
      requireGold(s, blessingPrice(s, b.id));
      s.blessings[b.id] = until + BLESSING_MS;
      message = `${b.name} تا دو ساعت دیگر همراه توست.`;
      break;
    }
    case 'work': {
      const job = JOBS.find((j) => j.id === action.jobId);
      const hours = Number(action.hours);
      if (!job || !WORK_HOURS.includes(hours as (typeof WORK_HOURS)[number]))
        throw new GameError('کار نامعتبر است.');
      if (s.level < job.level)
        throw new GameError(`این کار از سطح ${fa(job.level)} در دسترس است.`);
      requireIdle(s, now);
      s.work = {
        jobId: job.id,
        start: now,
        until: now + hours * 3_600_000,
        gold: workPay(s.level, job.id, hours),
      };
      message = `${job.name} را آغاز کردی. مزد در پایان نوبت پرداخت می‌شود.`;
      break;
    }
    case 'cancelWork': {
      if (!s.work) throw new GameError('کاری در جریان نیست.');
      s.work = null;
      message = 'کار لغو شد؛ مزدی پرداخت نشد.';
      break;
    }
    case 'buyBag': {
      const next = BAG_UPGRADES.find((b) => b.size > s.bagSize);
      if (!next) throw new GameError('کیسه‌ات بزرگ‌ترین اندازه را دارد.');
      if (s.level < next.level)
        throw new GameError(
          `کیسهٔ بزرگ‌تر از سطح ${fa(next.level)} فروخته می‌شود.`,
        );
      requireGold(s, next.price);
      s.bagSize = next.size;
      message = `کیسه‌ات اکنون ${fa(next.size)} جا دارد.`;
      break;
    }
    case 'claim': {
      const quest = QUESTS.find((x) => x.id === action.questId);
      if (
        !quest ||
        s.claimed.includes(quest.id) ||
        questProgress(s, quest) < quest.target
      )
        throw new GameError('این پاداش هنوز آماده نیست یا قبلاً دریافت شده است.');
      s.claimed.push(quest.id);
      earn(s, quest.gold);
      awardXp(s, quest.xp);
      message = 'پاداش مأموریت را دریافت کردی!';
      break;
    }
    case 'claimDaily': {
      const mission = dailyMissions(s)[Number(action.index)];
      if (!mission || mission.claimed || mission.progress < mission.target)
        throw new GameError('این مأموریت روزانه هنوز کامل نشده است.');
      s.daily.claimed.push(mission.index);
      earn(s, mission.gold);
      s.honour += mission.honour;
      awardXp(s, mission.xp);
      message = 'پاداش معبد دریافت شد.';
      break;
    }
    case 'setTitle': {
      if (action.titleId !== null && !titleUnlocked(s, action.titleId))
        throw new GameError('این لقب هنوز به دست نیامده است.');
      s.activeTitleId = action.titleId;
      s.hp = Math.min(s.hp, derived(s, now).maxHp);
      message = action.titleId
        ? 'لقب تازه برگزیده شد.'
        : 'لقب رتبه به کار رفت.';
      break;
    }
    case 'rename':
      s.name = parseName(action.name);
      message = 'نام پهلوان ثبت شد.';
      break;
    case 'createCharacter': {
      const gender = parseGender(action.gender);
      const name = parseName(action.name);
      if (s.characterCreated) {
        if (s.appearance.gender === gender && s.name === name)
          message = 'ظاهر پهلوان قبلاً ثبت شده است.';
        else
          throw new GameError(
            'ظاهر پهلوان قبلاً ثبت شده است. برای تغییر جنسیت از ویرایش ظاهر استفاده کن.',
          );
      } else {
        const returning = returningForAppearance(s);
        s.appearance.gender = gender;
        s.name = name;
        s.characterCreated = true;
        message = returning
          ? 'ظاهر پهلوان ثبت شد. پیشرفتت محفوظ است.'
          : 'پهلوانت آماده است. ظاهر و تجهیزات را در بخش پهلوان ببین.';
      }
      break;
    }
    case 'setGender':
      s.appearance.gender = parseGender(action.gender);
      message = 'ظاهر پهلوان به‌روز شد.';
      break;
    case 'wearCostume':
      if (action.costumeId === null) {
        s.appearance.activeCostumeId = null;
        message = 'نمای تجهیزات نمایش داده می‌شود.';
      } else {
        const costume = COSTUMES.find((c) => c.id === action.costumeId);
        if (!costume || !s.ownedCostumeIds.includes(costume.id))
          throw new GameError('این پوشاک در گنجینهٔ تو نیست.');
        s.appearance.activeCostumeId = costume.id;
        message = `${costume.name} را پوشیدی.`;
      }
      break;
    default:
      throw new GameError('درخواست نامعتبر است.');
  }
  return { state: s, message };
}

function battle(
  s: GameState,
  action: Extract<Action, { type: 'fight' | 'dungeon' | 'arena' }>,
  now: number,
  random: () => number,
): { state: GameState; message: string; battle: Battle } {
  requireIdle(s, now);
  const kind: BattleKind = action.type === 'fight' ? 'expedition' : action.type;
  let foe: Combatant;
  let enemyId: string;
  let boss = false;
  let region = -1;
  let progress: DungeonProgress | undefined;
  let dungeonId = '';
  if (action.type === 'fight') {
    const e = ENEMY_BY_ID.get(action.enemyId);
    if (!e) throw new GameError('حریف پیدا نشد.');
    if (!enemyUnlocked(s, e))
      throw new GameError('ابتدا حریف قبلی را شکست بده و به سطح لازم برس.');
    if (now < s.cooldowns.expedition)
      throw new GameError('کمی صبر کن؛ هنوز برای لشکرکشی بعدی آماده نیستی.');
    if (s.expPoints < 1)
      throw new GameError(
        'امتیاز لشکرکشی نداری. هر ۶ دقیقه یک امتیاز برمی‌گردد.',
      );
    foe = expeditionEnemy(e);
    enemyId = e.id;
    boss = !!e.boss;
    region = e.region;
  } else if (action.type === 'dungeon') {
    const d = DUNGEON_BY_ID.get(action.dungeonId);
    if (!d) throw new GameError('سیاه‌چال پیدا نشد.');
    if (!dungeonUnlocked(s, d.id))
      throw new GameError(`این سیاه‌چال از سطح ${fa(d.level)} باز می‌شود.`);
    if (now < s.cooldowns.dungeon)
      throw new GameError('کمی صبر کن؛ هنوز برای تالار بعدی آماده نیستی.');
    if (s.dungeonPoints < 1)
      throw new GameError(
        'امتیاز سیاه‌چال نداری. هر ۱۲ دقیقه یک امتیاز برمی‌گردد.',
      );
    progress = s.dungeons[d.id] ??= {
      stage: 0,
      hard: false,
      clears: 0,
      hardClears: 0,
    };
    if (progress.stage === 0) {
      if (action.hard && progress.clears < 1)
        throw new GameError('سطح دشوار پس از نخستین پاک‌سازی باز می‌شود.');
      progress.hard = !!action.hard;
    }
    dungeonId = d.id;
    const st = d.stages[progress.stage];
    foe = dungeonEnemy(d.id, progress.stage, progress.hard);
    enemyId = st.id;
    boss = !!st.boss;
  } else {
    const rival = arenaRivals(s)[Number(action.index)];
    if (!rival) throw new GameError('هماورد پیدا نشد.');
    if (s.level < 2) throw new GameError('میدان از سطح ۲ باز می‌شود.');
    if (now < s.cooldowns.arena)
      throw new GameError('هنوز برای نبرد میدان آماده نیستی.');
    foe = rivalCombatant(rival);
    enemyId = rival.id;
  }
  requireHealth(s);

  const hero = playerCombatant(s, now);
  const maxHp = derived(s, now).maxHp;
  const result = simulate(hero, foe, random);
  s.hp = Math.max(1, result.hp);
  s.healAt = now;
  const won = result.won;
  let gold = 0,
    xp = 0,
    honour = 0,
    fame = 0,
    loot: ItemInstance | null = null;
  const xpMult = derived(s, now).xpBonus;

  if (kind === 'expedition') {
    s.expPoints--;
    s.cooldowns.expedition = now + EXPEDITION_COOLDOWN_MS;
    if (won) {
      const first = !(s.kills[enemyId] > 0);
      s.kills[enemyId] = (s.kills[enemyId] ?? 0) + 1;
      s.counters.wins++;
      progressDaily(s, now, 'wins');
      if (region === s.daily.region) progressDaily(s, now, 'regionWins');
      if (boss) {
        s.counters.bossKills++;
        progressDaily(s, now, 'bosses');
      }
      const base = enemyGold(foe.level) * (boss ? 2.2 : 1);
      gold = Math.round(base * (0.85 + random() * 0.3));
      xp = Math.round(
        enemyXp(foe.level) *
          (boss ? 1.8 : 1) *
          xpScale(s.level, foe.level) *
          xpMult,
      );
      honour = boss ? 3 : 1;
      if (first || random() < (boss ? 0.6 : 0.3))
        loot = rollItem(s, foe.level, random, { qualityBoost: boss ? 1 : 0 });
    } else {
      s.counters.losses++;
      xp = Math.round(enemyXp(foe.level) * 0.1);
    }
  } else if (kind === 'dungeon') {
    s.dungeonPoints--;
    s.cooldowns.dungeon = now + DUNGEON_COOLDOWN_MS;
    const d = DUNGEON_BY_ID.get(dungeonId)!;
    const p = progress!;
    if (won) {
      s.kills[enemyId] = (s.kills[enemyId] ?? 0) + 1;
      s.counters.dungeonStages++;
      progressDaily(s, now, 'dungeon');
      gold = Math.round(
        enemyGold(foe.level) * (boss ? 3 : 1.3) * (0.85 + random() * 0.3),
      );
      xp = Math.round(
        enemyXp(foe.level) *
          (boss ? 2 : 1.4) *
          xpScale(s.level, foe.level) *
          xpMult,
      );
      fame = (boss ? 10 : 2) * (p.hard ? 2 : 1);
      if (boss) {
        loot = rollItem(s, foe.level, random, {
          minQuality: p.hard ? 3 : 2,
          qualityBoost: 1,
        });
      } else if (random() < 0.45) {
        loot = rollItem(s, foe.level, random, { qualityBoost: p.hard ? 1 : 0 });
      }
      p.stage++;
      if (p.stage >= d.stages.length) {
        p.stage = 0;
        p.clears++;
        s.counters.dungeonClears++;
        if (p.hard) {
          p.hardClears++;
          s.counters.hardClears++;
        }
      }
    } else {
      xp = Math.round(enemyXp(foe.level) * 0.1);
    }
  } else {
    s.cooldowns.arena = now + ARENA_COOLDOWN_MS;
    s.arena.round++;
    if (won) {
      s.counters.arenaWins++;
      progressDaily(s, now, 'arena');
      gold = Math.round(enemyGold(foe.level) * 1.5 * (0.85 + random() * 0.3));
      xp = Math.round(
        enemyXp(foe.level) * xpScale(s.level, foe.level) * xpMult,
      );
      honour = Math.max(3, 10 + (foe.level - s.level) * 3);
    } else {
      s.counters.arenaLosses++;
      honour = -Math.min(s.honour, 4);
    }
  }
  earn(s, gold);
  s.honour += honour;
  s.fame += fame;
  if (loot) addPackage(s, loot, foe.name, now);
  const levelUp = awardXp(s, xp);
  const record: Battle = {
    id: `${now}-${Math.floor(random() * 1e9).toString(36)}`,
    kind,
    enemy: foe.name,
    enemyId,
    enemyLevel: foe.level,
    enemyMaxHp: foe.hp,
    playerMaxHp: maxHp,
    won,
    gold,
    xp,
    honour,
    fame,
    loot,
    levelUp,
    rounds: result.rounds,
    at: now,
  };
  s.history = [record, ...s.history].slice(0, HISTORY_CAP);
  const message = won
    ? levelUp
      ? `پیروزی! به سطح ${fa(s.level)} رسیدی.`
      : 'پیروزی! پاداش نبرد به دارایی‌هایت اضافه شد.'
    : 'این بار شکست خوردی. تجهیزاتت را بهتر کن و دوباره برگرد.';
  return { state: s, message, battle: record };
}
