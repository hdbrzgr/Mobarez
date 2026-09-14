export type Stat = 'strength' | 'agility' | 'vitality' | 'luck';
export type Slot = 'weapon' | 'armor' | 'charm';
export type Gender = 'female' | 'male';
export type Item = {
  id: string;
  name: string;
  slot: Slot;
  attack: number;
  armor: number;
  vitality: number;
  rarity: 'common' | 'rare' | 'epic';
  price: number;
};
export const STAT_NAMES: Record<Stat, string> = {
  strength: 'قدرت',
  agility: 'چابکی',
  vitality: 'استقامت',
  luck: 'بخت',
};
export const SLOT_NAMES: Record<Slot, string> = {
  weapon: 'سلاح',
  armor: 'زره',
  charm: 'نشان',
};
export const GENDERS: Gender[] = ['female', 'male'];
export const GENDER_NAMES: Record<Gender, string> = {
  female: 'زن',
  male: 'مرد',
};
export const COSTUMES = [
  {
    id: 'travel',
    name: 'جامهٔ سفر',
    description: 'جامهٔ سادهٔ سفر با شنل کوتاه؛ فقط ظاهر را تغییر می‌دهد.',
  },
  {
    id: 'ceremonial',
    name: 'ردای آیینی',
    description: 'ردای سرخ و زرین آیین پهلوانی؛ فقط ظاهر را تغییر می‌دهد.',
  },
] as const;
export type CostumeId = (typeof COSTUMES)[number]['id'];
export const STARTER_COSTUME_IDS: CostumeId[] = ['travel', 'ceremonial'];
export const ITEMS: Item[] = [
  {
    id: 'iron-blade',
    name: 'شمشیر آهنی',
    slot: 'weapon',
    attack: 4,
    armor: 0,
    vitality: 0,
    rarity: 'common',
    price: 65,
  },
  {
    id: 'leather',
    name: 'جوشن چرمی',
    slot: 'armor',
    attack: 0,
    armor: 3,
    vitality: 0,
    rarity: 'common',
    price: 55,
  },
  {
    id: 'bronze-blade',
    name: 'شمشیر مفرغی پارس',
    slot: 'weapon',
    attack: 9,
    armor: 0,
    vitality: 0,
    rarity: 'rare',
    price: 180,
  },
  {
    id: 'scale',
    name: 'زره پولکی',
    slot: 'armor',
    attack: 0,
    armor: 8,
    vitality: 10,
    rarity: 'rare',
    price: 170,
  },
  {
    id: 'cypress',
    name: 'نشان سرو',
    slot: 'charm',
    attack: 2,
    armor: 2,
    vitality: 15,
    rarity: 'rare',
    price: 120,
  },
  {
    id: 'sun-blade',
    name: 'تیغ خورشید',
    slot: 'weapon',
    attack: 17,
    armor: 0,
    vitality: 0,
    rarity: 'epic',
    price: 430,
  },
  {
    id: 'guardian',
    name: 'جوشن نگهبان',
    slot: 'armor',
    attack: 0,
    armor: 13,
    vitality: 25,
    rarity: 'epic',
    price: 400,
  },
  {
    id: 'simorgh',
    name: 'نشان سیمرغ',
    slot: 'charm',
    attack: 5,
    armor: 4,
    vitality: 30,
    rarity: 'epic',
    price: 360,
  },
];
export type Enemy = {
  id: string;
  name: string;
  subtitle: string;
  level: number;
  hp: number;
  attack: number;
  armor: number;
  gold: number;
  xp: number;
  art: number;
  region: number;
};
export const ENEMIES: Enemy[] = [
  {
    id: 'wolf',
    name: 'گرگ خاکستری',
    subtitle: 'نگهبان خاموش دشت',
    level: 1,
    hp: 44,
    attack: 8,
    armor: 1,
    gold: 38,
    xp: 30,
    art: 0,
    region: 0,
  },
  {
    id: 'bandit',
    name: 'راهزن کاروان',
    subtitle: 'کمین در راه شاهی',
    level: 2,
    hp: 68,
    attack: 12,
    armor: 3,
    gold: 55,
    xp: 45,
    art: 1,
    region: 0,
  },
  {
    id: 'captain',
    name: 'سالار راهزنان',
    subtitle: 'فرمانروای گردنه',
    level: 3,
    hp: 98,
    attack: 16,
    armor: 5,
    gold: 85,
    xp: 70,
    art: 2,
    region: 0,
  },
  {
    id: 'forest-wolf',
    name: 'گرگ هیرکانی',
    subtitle: 'ردپا در مه جنگل',
    level: 3,
    hp: 100,
    attack: 17,
    armor: 5,
    gold: 90,
    xp: 75,
    art: 0,
    region: 1,
  },
  {
    id: 'forest-bandit',
    name: 'کمین‌گر جنگل',
    subtitle: 'سایه‌ای میان درختان',
    level: 4,
    hp: 128,
    attack: 20,
    armor: 7,
    gold: 110,
    xp: 90,
    art: 1,
    region: 1,
  },
  {
    id: 'forest-chief',
    name: 'سردار تبعیدی',
    subtitle: 'آخرین نگهبان دژ سبز',
    level: 5,
    hp: 155,
    attack: 24,
    armor: 9,
    gold: 140,
    xp: 115,
    art: 2,
    region: 1,
  },
  {
    id: 'mountain-wolf',
    name: 'گرگ سپید البرز',
    subtitle: 'زوزه در گذرگاه برفی',
    level: 5,
    hp: 160,
    attack: 25,
    armor: 10,
    gold: 150,
    xp: 120,
    art: 0,
    region: 2,
  },
  {
    id: 'mountain-bandit',
    name: 'یاغی کوهستان',
    subtitle: 'شمشیرزن گردنه‌های بلند',
    level: 6,
    hp: 195,
    attack: 29,
    armor: 12,
    gold: 180,
    xp: 145,
    art: 1,
    region: 2,
  },
  {
    id: 'mountain-chief',
    name: 'سالار دژ سنگی',
    subtitle: 'آخرین آزمون پهلوان',
    level: 7,
    hp: 230,
    attack: 34,
    armor: 15,
    gold: 220,
    xp: 180,
    art: 2,
    region: 2,
  },
];
export const REGIONS = [
  {
    name: 'دشت‌های پارس',
    level: 1,
    subtitle: 'در سایهٔ کوه‌های زاگرس، راه‌های کهن دیگر امن نیستند.',
    description: 'شمشیرت را بردار؛ کاروان‌ها چشم‌انتظار تو هستند.',
    mood: 'parsa',
  },
  {
    name: 'جنگل‌های هیرکانی',
    level: 3,
    subtitle: 'مه در میان درختان کهن می‌پیچد و راه را پنهان می‌کند.',
    description: 'به دل جنگل برو و راز دژ متروک را کشف کن.',
    mood: 'forest',
  },
  {
    name: 'کوهستان البرز',
    level: 5,
    subtitle: 'در آن سوی ابرها، دژ سنگی بر گذرگاه فرمان می‌راند.',
    description: 'نام یک پهلوان در سخت‌ترین راه‌ها ساخته می‌شود.',
    mood: 'mountain',
  },
];
export const DUNGEON: Enemy[] = [
  {
    id: 'dungeon-guard',
    name: 'دژبان فراموش‌شده',
    subtitle: 'تالار نخست',
    level: 3,
    hp: 105,
    attack: 17,
    armor: 5,
    gold: 90,
    xp: 70,
    art: 1,
    region: 0,
  },
  {
    id: 'dungeon-champion',
    name: 'پهلوان نفرین‌شده',
    subtitle: 'تالار دوم',
    level: 4,
    hp: 140,
    attack: 21,
    armor: 8,
    gold: 120,
    xp: 95,
    art: 2,
    region: 0,
  },
  {
    id: 'dungeon-div',
    name: 'دیو دژ خاموش',
    subtitle: 'تالار پایانی',
    level: 5,
    hp: 190,
    attack: 26,
    armor: 10,
    gold: 240,
    xp: 170,
    art: 2,
    region: 0,
  },
];
export const QUESTS = [
  {
    id: 'first',
    name: 'نخستین گام',
    description: 'در یک لشکرکشی پیروز شو.',
    target: 1,
    kind: 'wins',
    gold: 60,
    xp: 20,
  },
  {
    id: 'road',
    name: 'امنیت راه شاهی',
    description: 'سه پیروزی در لشکرکشی‌ها به دست بیاور.',
    target: 3,
    kind: 'wins',
    gold: 120,
    xp: 45,
  },
  {
    id: 'training',
    name: 'آهن در آتش',
    description: 'سه بار ویژگی‌های خود را تمرین بده.',
    target: 3,
    kind: 'training',
    gold: 100,
    xp: 40,
  },
  {
    id: 'captain',
    name: 'پایان راهزنان',
    description: 'سالار راهزنان پارس را شکست بده.',
    target: 1,
    kind: 'captain',
    gold: 180,
    xp: 75,
  },
  {
    id: 'dungeon',
    name: 'روشنایی در تاریکی',
    description: 'هر سه تالار دژ خاموش را پاک‌سازی کن.',
    target: 1,
    kind: 'dungeon',
    gold: 300,
    xp: 140,
  },
] as const;
export const MAX_ENERGY = 12;
export const ENERGY_MS = 60_000;
export const HEAL_MS = 30_000;
export const COOLDOWN_MS = 8_000;
export const INVENTORY_CAP = 40;
export const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
