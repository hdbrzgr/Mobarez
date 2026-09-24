/* Static game content. Every number the server trusts lives here or in
 * engine.ts; the client only reads these tables for display. */

export type Stat =
  | 'strength'
  | 'agility'
  | 'vitality'
  | 'luck'
  | 'charisma'
  | 'intelligence';
export type Slot =
  | 'weapon'
  | 'shield'
  | 'helmet'
  | 'armor'
  | 'gloves'
  | 'boots'
  | 'ring'
  | 'amulet';
export type Gender = 'female' | 'male';
export type Quality = 0 | 1 | 2 | 3 | 4;
export type Bonus = Partial<
  Record<Stat | 'damage' | 'armor' | 'hp' | 'block', number>
>;

export const STATS: Stat[] = [
  'strength',
  'agility',
  'vitality',
  'luck',
  'charisma',
  'intelligence',
];
export const STAT_NAMES: Record<Stat, string> = {
  strength: 'قدرت',
  agility: 'چابکی',
  vitality: 'استقامت',
  luck: 'بخت',
  charisma: 'فرّه',
  intelligence: 'خرد',
};
export const STAT_COPY: Record<Stat, string> = {
  strength: 'آسیب هر ضربه و شانس سد کردن ضربهٔ حریف را بالا می‌برد.',
  agility: 'شانس جاخالی دادن از ضربه‌های حریف را بالا می‌برد.',
  vitality: 'هر امتیاز ۷ سلامتی بیشینه می‌افزاید.',
  luck: 'شانس ضربهٔ بحرانی با آسیب ۱٫۷ برابر را بالا می‌برد.',
  charisma: 'شانس ضربت دوگانه در یک دور را بالا می‌برد.',
  intelligence: 'بازیابی سلامتی، اثر خوراک و تجربهٔ نبرد را بیشتر می‌کند.',
};
export const BONUS_NAMES: Record<keyof Bonus, string> = {
  ...STAT_NAMES,
  damage: 'آسیب',
  armor: 'زره',
  hp: 'سلامتی',
  block: 'سد',
};
export const SLOTS: Slot[] = [
  'weapon',
  'shield',
  'helmet',
  'armor',
  'gloves',
  'boots',
  'ring',
  'amulet',
];
export const SLOT_NAMES: Record<Slot, string> = {
  weapon: 'سلاح',
  shield: 'سپر',
  helmet: 'کلاه‌خود',
  armor: 'زره',
  gloves: 'دستکش',
  boots: 'موزه',
  ring: 'انگشتر',
  amulet: 'گردن‌آویز',
};
export const QUALITY_NAMES = [
  'ساده',
  'فیروزه',
  'لاجورد',
  'ارغوان',
  'کهربا',
] as const;
export const QUALITY_MULT = [1, 1.15, 1.32, 1.52, 1.76] as const;
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

/* ---------- Item bases: ten tiers per slot ---------- */

export const TIER_LEVELS = [1, 5, 10, 16, 23, 31, 40, 50, 62, 75] as const;
export type ItemBase = {
  id: string;
  name: string;
  slot: Slot;
  tier: number;
  level: number;
  /** Weapon damage range. */
  min?: number;
  max?: number;
  armor?: number;
  block?: number;
  hp?: number;
  stats?: Partial<Record<Stat, number>>;
  art?: string;
};

const BASE_NAMES: Record<Slot, string[]> = {
  weapon: [
    'شمشیر آهنی',
    'شمشیر مفرغی پارس',
    'شمشیر پولادین',
    'تیغ هندی',
    'شمشیر گوهرنشان',
    'شمشیر خسروانی',
    'تیغ خورشید',
    'تیغ آذرخش',
    'تیغ زرین سام',
    'تیغ پرِ سیمرغ',
  ],
  shield: [
    'سپر چوبی',
    'سپر چرمی گرد',
    'سپر مفرغی',
    'سپر شیرنشان',
    'سپر پولادین',
    'سپر زرکوب',
    'سپر اژدهاکش',
    'سپر آفتاب',
    'سپر کوه‌پیکر',
    'سپر سیمرغ',
  ],
  helmet: [
    'کلاه نمدی',
    'کلاه‌خود چرمی',
    'کلاه‌خود مفرغی',
    'خود پولادین',
    'خود پرنشان',
    'خود زرین',
    'خود دیوسار',
    'خود شیرسر',
    'خود اژدهاسر',
    'تاج‌خود سیمرغ',
  ],
  armor: [
    'جوشن چرمی',
    'زره پولکی',
    'جوشن چرم گاومیش',
    'زره زنجیری',
    'زره فلس‌دار',
    'جوشن سواران',
    'جوشن نگهبان',
    'ببربیان',
    'زره اژدهاپوست',
    'جوشن سیمرغ',
  ],
  gloves: [
    'دستکش پشمی',
    'دستکش چرمی',
    'بازوبند مفرغی',
    'دستکش حلقه‌بافت',
    'بازوبند پولادین',
    'دستکش شیرچنگ',
    'بازوبند زرین',
    'دستکش دیوبند',
    'بازوبند اژدها',
    'دستکش سیمرغ',
  ],
  boots: [
    'پاپوش نمدی',
    'موزهٔ چرمی',
    'موزهٔ سواری',
    'موزهٔ میخ‌دار',
    'موزهٔ پولادین',
    'موزهٔ کوه‌نورد',
    'موزهٔ باد',
    'موزهٔ زرین',
    'موزهٔ ابرپیما',
    'موزهٔ سیمرغ',
  ],
  ring: [
    'انگشتر مسی',
    'انگشتر عقیق',
    'انگشتر فیروزه',
    'انگشتر لعل',
    'انگشتر زمرد',
    'انگشتر یاقوت',
    'انگشتر مهرنشان',
    'انگشتر شب‌چراغ',
    'انگشتر جم',
    'انگشتر سیمرغ',
  ],
  amulet: [
    'گردن‌آویز مهره',
    'نشان سرو',
    'گردن‌آویز شیر و خورشید',
    'گردن‌آویز لاجورد',
    'نشان کاوه',
    'نشان سیمرغ',
    'گردن‌آویز آناهیتا',
    'گردن‌آویز البرز',
    'گردن‌آویز جام جم',
    'گردن‌آویز فرّ کیانی',
  ],
};

const WEAPON_ART = [
  'iron-blade',
  'bronze-blade',
  'iron-blade',
  'iron-blade',
  'bronze-blade',
  'bronze-blade',
  'sun-blade',
  'sun-blade',
  'sun-blade',
  'sun-blade',
];
const ARMOR_ART = [
  'leather',
  'scale',
  'leather',
  'scale',
  'scale',
  'scale',
  'guardian',
  'guardian',
  'guardian',
  'guardian',
];
const AMULET_ART = [
  undefined,
  'cypress',
  'cypress',
  'cypress',
  'cypress',
  'simorgh',
  'simorgh',
  'simorgh',
  'simorgh',
  'simorgh',
];
/** Legacy ids from save version 1 keep their names and art. */
const LEGACY_IDS: Partial<Record<Slot, Record<number, string>>> = {
  weapon: { 0: 'iron-blade', 1: 'bronze-blade', 6: 'sun-blade' },
  armor: { 0: 'leather', 1: 'scale', 6: 'guardian' },
  amulet: { 1: 'cypress', 5: 'simorgh' },
};
const RING_STATS: Stat[] = [
  'luck',
  'agility',
  'charisma',
  'intelligence',
  'luck',
  'agility',
  'charisma',
  'intelligence',
  'luck',
  'charisma',
];

function makeBase(slot: Slot, tier: number): ItemBase {
  const l = TIER_LEVELS[tier];
  const id = LEGACY_IDS[slot]?.[tier] ?? `${slot}-${tier}`;
  const b: ItemBase = {
    id,
    name: BASE_NAMES[slot][tier],
    slot,
    tier,
    level: l,
  };
  const r = (n: number) => Math.max(1, Math.round(n));
  if (slot === 'weapon') {
    b.min = r(2 + 1.55 * l);
    b.max = r(4 + 2.35 * l);
    b.art = WEAPON_ART[tier];
  } else if (slot === 'armor') {
    b.armor = r(6 + 4.6 * l);
    b.hp = tier > 0 ? r(4 + 1.2 * l) : undefined;
    b.art = ARMOR_ART[tier];
  } else if (slot === 'shield') {
    b.armor = r(3 + 2.6 * l);
    b.block = r(3 + 0.9 * l);
  } else if (slot === 'helmet') {
    b.armor = r(2 + 2 * l);
    b.hp = r(3 + 1.6 * l);
  } else if (slot === 'gloves') {
    b.armor = r(1 + 1.3 * l);
    b.stats = { strength: r(1 + 0.25 * l) };
  } else if (slot === 'boots') {
    b.armor = r(1 + 1.5 * l);
    b.stats = { agility: r(1 + 0.25 * l) };
  } else if (slot === 'ring') {
    b.stats = { [RING_STATS[tier]]: r(2 + 0.4 * l), vitality: r(0.2 * l) };
  } else {
    b.hp = r(10 + 5 * l);
    b.armor = tier > 0 ? r(1 + 0.6 * l) : undefined;
    b.art = AMULET_ART[tier];
  }
  return b;
}

export const ITEM_BASES: ItemBase[] = SLOTS.flatMap((slot) =>
  TIER_LEVELS.map((_, tier) => makeBase(slot, tier)),
);
export const BASE_BY_ID = new Map(ITEM_BASES.map((b) => [b.id, b]));

/* ---------- Affixes ---------- */

export type Affix = {
  id: string;
  name: string;
  level: number;
  /** Value = round(k × (1 + itemLevel × per)). */
  effects: { key: keyof Bonus; k: number; per: number }[];
  bannedSlots?: Slot[];
};

export const PREFIXES: Affix[] = [
  {
    id: 'sharp',
    name: 'تیز',
    level: 1,
    effects: [{ key: 'damage', k: 1, per: 0.32 }],
    bannedSlots: ['shield', 'armor', 'boots'],
  },
  {
    id: 'hard',
    name: 'سخت',
    level: 1,
    effects: [{ key: 'armor', k: 2, per: 0.6 }],
  },
  {
    id: 'light',
    name: 'سبک',
    level: 3,
    effects: [{ key: 'agility', k: 1, per: 0.3 }],
    bannedSlots: ['armor'],
  },
  {
    id: 'fiery',
    name: 'آتشین',
    level: 5,
    effects: [
      { key: 'damage', k: 1, per: 0.22 },
      { key: 'strength', k: 1, per: 0.18 },
    ],
    bannedSlots: ['ring', 'amulet'],
  },
  {
    id: 'steel',
    name: 'پولادین',
    level: 5,
    effects: [
      { key: 'armor', k: 2, per: 0.45 },
      { key: 'vitality', k: 1, per: 0.18 },
    ],
  },
  {
    id: 'golden',
    name: 'زرین',
    level: 8,
    effects: [
      { key: 'luck', k: 1, per: 0.2 },
      { key: 'charisma', k: 1, per: 0.2 },
    ],
    bannedSlots: ['boots', 'shield'],
  },
  {
    id: 'sunny',
    name: 'خورشیدی',
    level: 15,
    effects: [
      { key: 'damage', k: 1, per: 0.2 },
      { key: 'charisma', k: 1, per: 0.22 },
    ],
    bannedSlots: ['shield'],
  },
  {
    id: 'simorghi',
    name: 'سیمرغی',
    level: 20,
    effects: [
      { key: 'hp', k: 3, per: 0.6 },
      { key: 'intelligence', k: 1, per: 0.25 },
    ],
  },
  {
    id: 'alborzi',
    name: 'البرزی',
    level: 25,
    effects: [
      { key: 'armor', k: 2, per: 0.4 },
      { key: 'vitality', k: 1, per: 0.2 },
      { key: 'hp', k: 3, per: 0.4 },
    ],
  },
  {
    id: 'dragon',
    name: 'اژدهایی',
    level: 30,
    effects: [
      { key: 'damage', k: 1, per: 0.28 },
      { key: 'strength', k: 1, per: 0.25 },
    ],
    bannedSlots: ['ring', 'amulet'],
  },
  {
    id: 'stormy',
    name: 'توفانی',
    level: 35,
    effects: [
      { key: 'agility', k: 1, per: 0.3 },
      { key: 'damage', k: 1, per: 0.15 },
    ],
    bannedSlots: ['armor'],
  },
  {
    id: 'moonlit',
    name: 'ماه‌گون',
    level: 45,
    effects: [
      { key: 'luck', k: 1, per: 0.28 },
      { key: 'intelligence', k: 1, per: 0.28 },
    ],
    bannedSlots: ['boots'],
  },
  {
    id: 'div-slayer',
    name: 'دیوافکن',
    level: 50,
    effects: [
      { key: 'strength', k: 2, per: 0.3 },
      { key: 'damage', k: 1, per: 0.3 },
    ],
    bannedSlots: ['ring', 'amulet'],
  },
  {
    id: 'royal',
    name: 'شاهانه',
    level: 58,
    effects: [
      { key: 'strength', k: 1, per: 0.15 },
      { key: 'agility', k: 1, per: 0.15 },
      { key: 'vitality', k: 1, per: 0.15 },
      { key: 'luck', k: 1, per: 0.15 },
      { key: 'charisma', k: 1, per: 0.15 },
      { key: 'intelligence', k: 1, per: 0.15 },
    ],
  },
];

export const SUFFIXES: Affix[] = [
  {
    id: 'lucky',
    name: 'بخت‌آور',
    level: 1,
    effects: [{ key: 'luck', k: 1, per: 0.3 }],
    bannedSlots: ['boots'],
  },
  {
    id: 'mighty',
    name: 'نیرومند',
    level: 1,
    effects: [{ key: 'strength', k: 1, per: 0.3 }],
    bannedSlots: ['ring', 'amulet'],
  },
  {
    id: 'steadfast',
    name: 'پایدار',
    level: 3,
    effects: [{ key: 'vitality', k: 1, per: 0.3 }],
  },
  {
    id: 'fleet',
    name: 'گریزپا',
    level: 5,
    effects: [{ key: 'agility', k: 1, per: 0.3 }],
    bannedSlots: ['armor'],
  },
  {
    id: 'glorious',
    name: 'فرّه‌مند',
    level: 8,
    effects: [{ key: 'charisma', k: 1, per: 0.3 }],
    bannedSlots: ['shield'],
  },
  {
    id: 'wise',
    name: 'خردمند',
    level: 8,
    effects: [{ key: 'intelligence', k: 1, per: 0.3 }],
  },
  {
    id: 'lifegiving',
    name: 'جان‌بخش',
    level: 12,
    effects: [{ key: 'hp', k: 4, per: 0.8 }],
  },
  {
    id: 'guarding',
    name: 'نگاهبان',
    level: 15,
    effects: [
      { key: 'block', k: 1, per: 0.25 },
      { key: 'armor', k: 1, per: 0.3 },
    ],
  },
  {
    id: 'invulnerable',
    name: 'رویین‌تن',
    level: 20,
    effects: [
      { key: 'armor', k: 2, per: 0.4 },
      { key: 'hp', k: 3, per: 0.4 },
    ],
  },
  {
    id: 'lionheart',
    name: 'شیردل',
    level: 25,
    effects: [
      { key: 'strength', k: 1, per: 0.22 },
      { key: 'charisma', k: 1, per: 0.22 },
    ],
    bannedSlots: ['ring', 'amulet', 'shield'],
  },
  {
    id: 'keen',
    name: 'تیزهوش',
    level: 30,
    effects: [
      { key: 'intelligence', k: 1, per: 0.22 },
      { key: 'luck', k: 1, per: 0.22 },
    ],
    bannedSlots: ['boots'],
  },
  {
    id: 'fearless',
    name: 'بی‌باک',
    level: 40,
    effects: [
      { key: 'damage', k: 1, per: 0.22 },
      { key: 'strength', k: 1, per: 0.2 },
    ],
    bannedSlots: ['ring', 'amulet'],
  },
  {
    id: 'eternal',
    name: 'جاودان',
    level: 55,
    effects: [
      { key: 'vitality', k: 1, per: 0.22 },
      { key: 'hp', k: 4, per: 0.5 },
      { key: 'intelligence', k: 1, per: 0.15 },
    ],
  },
];
export const PREFIX_BY_ID = new Map(PREFIXES.map((a) => [a.id, a]));
export const SUFFIX_BY_ID = new Map(SUFFIXES.map((a) => [a.id, a]));

/* ---------- Opponents ---------- */

export type Profile = 'beast' | 'warrior' | 'brute' | 'boss' | 'mystic';
export type Enemy = {
  id: string;
  name: string;
  subtitle: string;
  level: number;
  profile: Profile;
  art: number;
  region: number;
  boss?: boolean;
};

export const REGIONS = [
  {
    name: 'دشت‌های پارس',
    subtitle: 'در سایهٔ کوه‌های زاگرس، راه‌های کهن دیگر امن نیستند.',
    description: 'شمشیرت را بردار؛ کاروان‌ها چشم‌انتظار تو هستند.',
    mood: 'parsa',
  },
  {
    name: 'جنگل‌های هیرکانی',
    subtitle: 'مه در میان درختان کهن می‌پیچد و راه را پنهان می‌کند.',
    description: 'به دل جنگل برو و راز دژ متروک را کشف کن.',
    mood: 'forest',
  },
  {
    name: 'کوهستان البرز',
    subtitle: 'در آن سوی ابرها، دژ سنگی بر گذرگاه فرمان می‌راند.',
    description: 'نام یک پهلوان در سخت‌ترین راه‌ها ساخته می‌شود.',
    mood: 'mountain',
  },
  {
    name: 'کویر لوت',
    subtitle: 'ریگ‌های روان، کاروان‌ها و رازهایشان را فرو می‌بلعند.',
    description: 'آب کم است و دشمن بسیار؛ توشهٔ کافی بردار.',
    mood: 'desert',
  },
  {
    name: 'کرانهٔ کارون',
    subtitle: 'نیزارها و مرداب‌ها زیر آفتاب سوزان زمزمه می‌کنند.',
    description: 'غول مفرغی بر گذرگاه رود نگهبانی می‌دهد.',
    mood: 'river',
  },
  {
    name: 'دشت سیستان',
    subtitle: 'باد صد و بیست روزه، گرد و خاک و افسانه‌های رستم را می‌آورد.',
    description: 'زادگاه پهلوانان، اکنون در چنگ اکوان دیو است.',
    mood: 'sistan',
  },
  {
    name: 'مازندران و دیلمان',
    subtitle: 'جنگل‌های تاریک، جادوگران و دیوان را پناه داده‌اند.',
    description: 'راه هفت‌خوان از اینجا می‌گذرد؛ دیو سپید در انتظار است.',
    mood: 'mazandaran',
  },
  {
    name: 'دماوند',
    subtitle: 'کوه آتشین بر زنجیرهای کهن ایستاده است.',
    description: 'سایهٔ ضحاک هنوز از دل کوه برمی‌خیزد.',
    mood: 'damavand',
  },
  {
    name: 'کوه قاف',
    subtitle: 'آن سوی جهان شناخته، جایی که افسانه‌ها زاده می‌شوند.',
    description: 'تنها بزرگ‌ترین پهلوانان به قاف رسیده‌اند.',
    mood: 'qaf',
  },
] as const;

const e = (
  id: string,
  name: string,
  subtitle: string,
  level: number,
  profile: Profile,
  art: number,
  region: number,
  boss = false,
): Enemy => ({ id, name, subtitle, level, profile, art, region, boss });

export const ENEMIES: Enemy[] = [
  e('wolf', 'گرگ خاکستری', 'نگهبان خاموش دشت', 1, 'beast', 0, 0),
  e('bandit', 'راهزن کاروان', 'کمین در راه شاهی', 2, 'warrior', 1, 0),
  e('lion', 'شیر دشت ارژن', 'فرمانروای علفزار', 3, 'beast', 0, 0),
  e('captain', 'سالار راهزنان', 'فرمانروای گردنه', 4, 'boss', 2, 0, true),
  e('forest-wolf', 'گرگ هیرکانی', 'ردپا در مه جنگل', 5, 'beast', 0, 1),
  e('forest-bandit', 'کمین‌گر جنگل', 'سایه‌ای میان درختان', 6, 'warrior', 1, 1),
  e('tiger', 'ببر مازندران', 'چشمانی زرد در تاریکی', 7, 'beast', 0, 1),
  e(
    'forest-chief',
    'سردار تبعیدی',
    'آخرین نگهبان دژ سبز',
    9,
    'boss',
    2,
    1,
    true,
  ),
  e(
    'mountain-wolf',
    'گرگ سپید البرز',
    'زوزه در گذرگاه برفی',
    10,
    'beast',
    0,
    2,
  ),
  e(
    'mountain-bandit',
    'یاغی کوهستان',
    'شمشیرزن گردنه‌های بلند',
    12,
    'warrior',
    1,
    2,
  ),
  e('eagle', 'عقاب سیاه البرز', 'سایه‌ای بر فراز صخره', 13, 'beast', 0, 2),
  e(
    'mountain-chief',
    'سالار دژ سنگی',
    'فرمانروای گذرگاه',
    15,
    'boss',
    2,
    2,
    true,
  ),
  e('viper', 'افعی شاخدار', 'خزنده در زیر ریگ', 16, 'beast', 0, 3),
  e('raider', 'غارتگر ریگزار', 'شترسوار بی‌نشان', 18, 'warrior', 1, 3),
  e('ghoul', 'غول بیابان', 'فریبندهٔ مسافران گمشده', 20, 'brute', 2, 3),
  e('sand-lord', 'سالار ریگ روان', 'فرمانروای توفان شن', 22, 'boss', 2, 3, true),
  e('buffalo', 'گاومیش خشمگین', 'شاخ‌هایی به تیزی نیزه', 23, 'brute', 0, 4),
  e('river-pirate', 'رهزن کارون', 'کمین‌گر نیزار', 25, 'warrior', 1, 4),
  e('marsh-div', 'دیو مرداب', 'برخاسته از لجن کهن', 27, 'mystic', 2, 4),
  e(
    'colossus',
    'غول مفرغی',
    'نگهبان بی‌خواب گذرگاه رود',
    30,
    'boss',
    2,
    4,
    true,
  ),
  e('gando', 'گاندو', 'تمساح کهن هامون', 31, 'beast', 0, 5),
  e('hamoun-rebel', 'یاغی هامون', 'سوار بی‌پروای نیزار', 33, 'warrior', 1, 5),
  e('wind-div', 'دیو باد', 'زادهٔ باد صد و بیست روزه', 36, 'mystic', 2, 5),
  e(
    'akvan',
    'اکوان دیو',
    'گورخری که پهلوان را به دریا افکند',
    39,
    'boss',
    2,
    5,
    true,
  ),
  e('bear', 'خرس سیاه دیلمان', 'غرشی در دل جنگل', 41, 'brute', 0, 6),
  e('mercenary', 'مزدور تیغ‌زن', 'شمشیری برای هر خریدار', 44, 'warrior', 1, 6),
  e('sorcerer', 'جادوگر مازندران', 'سرایندهٔ طلسم‌های تاریک', 46, 'mystic', 2, 6),
  e('white-div', 'دیو سپید', 'خوان هفتم', 49, 'boss', 2, 6, true),
  e('drake', 'اژدهابچه', 'زادهٔ گدازه', 51, 'beast', 0, 7),
  e('lava-giant', 'غول گدازه', 'از دل آتشفشان', 54, 'brute', 2, 7),
  e('div-marshal', 'سپهبد دیوان', 'فرماندهٔ لشکر تاریکی', 57, 'warrior', 1, 7),
  e(
    'zahhak-shadow',
    'سایهٔ ضحاک',
    'مارهای شانه هنوز گرسنه‌اند',
    61,
    'boss',
    2,
    7,
    true,
  ),
  e('griffin', 'شیردال', 'نیمی شیر، نیمی عقاب', 63, 'beast', 0, 8),
  e('qaf-giant', 'غول قاف', 'کوه‌پیکر و کهنسال', 66, 'brute', 2, 8),
  e('div-guard', 'نگهبان دیوشاه', 'تیغ‌دار دروازهٔ قاف', 69, 'warrior', 1, 8),
  e('div-king', 'دیوشاه قاف', 'آخرین افسانه', 73, 'boss', 2, 8, true),
];
export const ENEMY_BY_ID = new Map(ENEMIES.map((x) => [x.id, x]));
export const regionLevel = (region: number) =>
  ENEMIES.find((x) => x.region === region)!.level;

/* ---------- Dungeons ---------- */

export type Dungeon = {
  id: string;
  name: string;
  region: number;
  level: number;
  description: string;
  stages: Enemy[];
};
const stage = (
  id: string,
  name: string,
  subtitle: string,
  level: number,
  profile: Profile,
  art: number,
  boss = false,
) => e(id, name, subtitle, level, profile, art, -1, boss);

export const DUNGEONS: Dungeon[] = [
  {
    id: 'silent-fort',
    name: 'دژ خاموش',
    region: 0,
    level: 3,
    description: 'در تالارهای متروک دژ، سایه‌ای کهن بیدار شده است.',
    stages: [
      stage('dungeon-guard', 'دژبان فراموش‌شده', 'تالار نخست', 3, 'warrior', 1),
      stage('dungeon-champion', 'پهلوان نفرین‌شده', 'تالار دوم', 4, 'warrior', 2),
      stage('dungeon-div', 'دیو دژ خاموش', 'تالار پایانی', 5, 'boss', 2, true),
    ],
  },
  {
    id: 'black-div-cave',
    name: 'غار دیو سیاه',
    region: 1,
    level: 8,
    description: 'دیو سیاه، کشندهٔ سیامک، در ژرفای جنگل خفته است.',
    stages: [
      stage('cave-bats', 'خفاش‌های غار', 'دهانهٔ غار', 8, 'beast', 0),
      stage('cave-warden', 'نگهبان غار', 'گذرگاه تنگ', 9, 'warrior', 1),
      stage('cave-brute', 'دیوچهٔ سنگ‌انداز', 'تالار چکه', 10, 'brute', 2),
      stage('black-div', 'دیو سیاه', 'ژرفای غار', 11, 'boss', 2, true),
    ],
  },
  {
    id: 'dragon-lair',
    name: 'کنام اژدها',
    region: 2,
    level: 14,
    description: 'خوان سوم: اژدهایی که در تاریکی بر پهلوانان می‌تازد.',
    stages: [
      stage('lair-snakes', 'مارهای کنام', 'سنگلاخ', 14, 'beast', 0),
      stage('lair-cultist', 'پرستار اژدها', 'پلکان گوگرد', 15, 'mystic', 1),
      stage('lair-whelp', 'بچه‌اژدها', 'آشیانه', 16, 'beast', 0),
      stage(
        'lair-dragon',
        'اژدهای خوان سوم',
        'ژرفای کنام',
        18,
        'boss',
        2,
        true,
      ),
    ],
  },
  {
    id: 'cursed-caravanserai',
    name: 'کاروانسرای نفرین‌شده',
    region: 3,
    level: 21,
    description: 'کاروانی که هرگز نرسید؛ ارواحش هنوز بار می‌زنند.',
    stages: [
      stage('cs-guard', 'نگهبان بی‌سر', 'دروازه', 21, 'warrior', 1),
      stage('cs-ghoul', 'غول انبار', 'انبار ادویه', 22, 'brute', 2),
      stage('cs-sorcerer', 'ساربان جادو', 'حیاط', 23, 'mystic', 1),
      stage('cs-lord', 'کاروان‌سالار نفرین‌شده', 'شاه‌نشین', 25, 'boss', 2, true),
    ],
  },
  {
    id: 'sunken-cistern',
    name: 'آب‌انبار غرق‌شده',
    region: 4,
    level: 28,
    description: 'زیر شهر کهن، آب سیاه راز غول مفرغی را نگه داشته است.',
    stages: [
      stage('ci-leech', 'زالوی غول‌آسا', 'پله‌های نمور', 28, 'beast', 0),
      stage('ci-smuggler', 'قاچاقچی زیرزمین', 'گذرگاه آب', 29, 'warrior', 1),
      stage('ci-div', 'دیو آب', 'مخزن', 31, 'mystic', 2),
      stage('ci-guardian', 'پاسدار مفرغی', 'دل آب‌انبار', 33, 'boss', 2, true),
    ],
  },
  {
    id: 'burnt-city',
    name: 'ویرانه‌های شهر سوخته',
    region: 5,
    level: 37,
    description: 'شهری که پنج هزار سال پیش سوخت و هنوز خاکسترش گرم است.',
    stages: [
      stage('bc-jackals', 'شغال‌های خاکستر', 'بارو', 37, 'beast', 0),
      stage('bc-looter', 'گورکن غارتگر', 'گورستان', 38, 'warrior', 1),
      stage('bc-ash-div', 'دیو خاکستر', 'کارگاه سفال', 40, 'mystic', 2),
      stage('bc-king', 'شاه خاکستر', 'کاخ سوخته', 42, 'boss', 2, true),
    ],
  },
  {
    id: 'white-div-well',
    name: 'چاه دیو سپید',
    region: 6,
    level: 47,
    description: 'کاووس و یارانش در این چاه به بند کشیده شدند.',
    stages: [
      stage('wd-sorceress', 'زن جادو', 'چشمهٔ فریب', 47, 'mystic', 1),
      stage('wd-arzhang', 'ارژنگ دیو', 'اردوگاه دیوان', 48, 'warrior', 2),
      stage('wd-guards', 'پاسداران چاه', 'دهانهٔ چاه', 50, 'brute', 2),
      stage('wd-white', 'دیو سپید بیدار', 'ژرفای چاه', 53, 'boss', 2, true),
    ],
  },
  {
    id: 'zahhak-prison',
    name: 'زندان ضحاک',
    region: 7,
    level: 58,
    description: 'فریدون ضحاک را در دماوند به بند کشید؛ بندها سست شده‌اند.',
    stages: [
      stage('zp-serpent', 'مار شانه', 'غار ورودی', 58, 'beast', 0),
      stage('zp-jailer', 'زندانبان دیو', 'دالان زنجیر', 60, 'warrior', 1),
      stage('zp-magus', 'جادوگر ضحاک', 'تالار آتش', 62, 'mystic', 2),
      stage('zp-zahhak', 'ضحاک ماردوش', 'بند دماوند', 65, 'boss', 2, true),
    ],
  },
  {
    id: 'qaf-hall',
    name: 'تالار دیوشاه',
    region: 8,
    level: 74,
    description: 'بلندترین تالار جهان، جایی که دیوشاه گنج‌های کیانی را انباشته.',
    stages: [
      stage('qh-griffins', 'شیردالان پاسدار', 'ایوان باد', 74, 'beast', 0),
      stage('qh-giant', 'غول دروازه', 'دروازهٔ سنگی', 76, 'brute', 2),
      stage('qh-sorcerer', 'جادوگر قاف', 'برج طلسم', 78, 'mystic', 1),
      stage('qh-king', 'دیوشاه بیدار', 'تخت قاف', 80, 'boss', 2, true),
    ],
  },
];
export const DUNGEON_BY_ID = new Map(DUNGEONS.map((d) => [d.id, d]));
/** Advanced dungeon enemies are this many levels stronger. */
export const HARD_LEVEL_BONUS = 6;

/* ---------- Town ---------- */

export const FOODS = [
  { id: 'bread', name: 'نان و پنیر', heal: 0.25, price: 1 },
  { id: 'kebab', name: 'کباب کوبیده', heal: 0.5, price: 2.2 },
  { id: 'sharbat', name: 'شربت بیدمشک', heal: 1, price: 4.8 },
] as const;
export type FoodId = (typeof FOODS)[number]['id'];

export const BLESSINGS = [
  {
    id: 'mehr',
    name: 'برکت مهر',
    description: '۱۰٪ آسیب بیشتر در همهٔ نبردها.',
    price: 6,
  },
  {
    id: 'anahita',
    name: 'برکت آناهیتا',
    description: 'بازیابی سلامتی دو برابر می‌شود.',
    price: 4,
  },
  {
    id: 'bahram',
    name: 'برکت بهرام',
    description: '۱۵٪ تجربهٔ بیشتر از پیروزی‌ها.',
    price: 7,
  },
  {
    id: 'tir',
    name: 'برکت تیر',
    description: '۱۵٪ زره بیشتر.',
    price: 5,
  },
] as const;
export type BlessingId = (typeof BLESSINGS)[number]['id'];
export const BLESSING_MS = 2 * 60 * 60_000;

export const JOBS = [
  {
    id: 'stable',
    name: 'مهتر اصطبل شاهی',
    description: 'تیمار اسبان سواران؛ کاری آرام برای روزهای خستگی.',
    level: 1,
    rate: 1,
  },
  {
    id: 'caravan',
    name: 'نگهبان کاروان',
    description: 'همراهی کاروان ابریشم تا کاروانسرای بعدی.',
    level: 8,
    rate: 1.25,
  },
  {
    id: 'smith',
    name: 'دستیار آهنگر',
    description: 'دمیدن در کوره و چکش‌کاری تیغه‌های نو.',
    level: 18,
    rate: 1.45,
  },
  {
    id: 'envoy',
    name: 'پیک دربار',
    description: 'رساندن نامه‌های مهرشده از شهری به شهر دیگر.',
    level: 35,
    rate: 1.7,
  },
] as const;
export type JobId = (typeof JOBS)[number]['id'];
export const WORK_HOURS = [1, 2, 4, 8] as const;

export const BAG_UPGRADES = [
  { size: 60, level: 8, price: 1500 },
  { size: 80, level: 20, price: 9000 },
  { size: 100, level: 35, price: 40000 },
];

/* ---------- Dungeon companions ---------- */

export type CompanionRole = 'guard' | 'healer' | 'striker';
export const COMPANIONS: {
  id: string;
  name: string;
  role: CompanionRole;
  level: number;
  price: number;
  power: number;
  description: string;
}[] = [
  {
    id: 'bahman',
    name: 'بهمن سپردار',
    role: 'guard',
    level: 8,
    price: 1500,
    power: 0.1,
    description: 'سپر را پیش روی تو می‌گیرد؛ آسیب دریافتی کمتر می‌شود.',
  },
  {
    id: 'paridokht',
    name: 'پریدخت درمانگر',
    role: 'healer',
    level: 14,
    price: 5000,
    power: 0.02,
    description: 'در هر دور بخشی از سلامتی‌ات را بازمی‌گرداند.',
  },
  {
    id: 'sam',
    name: 'سام کماندار',
    role: 'striker',
    level: 20,
    price: 12000,
    power: 0.16,
    description: 'از دور تیر می‌اندازد و در هر دور آسیب می‌زند.',
  },
  {
    id: 'farud',
    name: 'فرود نیزه‌دار',
    role: 'striker',
    level: 30,
    price: 30000,
    power: 0.22,
    description: 'در کنار تو می‌جنگد و نیزه‌اش سنگین است.',
  },
  {
    id: 'gordiyeh',
    name: 'گردیه سوار',
    role: 'guard',
    level: 42,
    price: 70000,
    power: 0.14,
    description: 'سوار زره‌پوشی که بار نبرد را با تو قسمت می‌کند.',
  },
  {
    id: 'rudabeh',
    name: 'رودابه فرزانه',
    role: 'healer',
    level: 50,
    price: 120000,
    power: 0.03,
    description: 'دانش گیاهان کابل را با خود دارد.',
  },
];
export const partySlots = (level: number) =>
  level >= 35 ? 3 : level >= 20 ? 2 : level >= 8 ? 1 : 0;

/* ---------- Titles ---------- */

export type TitleBonus = Partial<
  Record<Stat | 'damage' | 'armor' | 'hp', number>
>;
/** Percent bonuses. Only the active title applies. */
export const RANK_TITLES = [
  { id: 'rank-0', name: 'تازه‌کار', honour: 0, bonus: {} as TitleBonus },
  { id: 'rank-1', name: 'جنگجو', honour: 150, bonus: { luck: 3 } },
  { id: 'rank-2', name: 'سوار', honour: 600, bonus: { agility: 3, luck: 3 } },
  { id: 'rank-3', name: 'پهلوان', honour: 2000, bonus: { strength: 4, hp: 2 } },
  {
    id: 'rank-4',
    name: 'نامدار',
    honour: 5000,
    bonus: { charisma: 6, strength: 3 },
  },
  {
    id: 'rank-5',
    name: 'جهان‌پهلوان',
    honour: 11000,
    bonus: { charisma: 6, damage: 4, hp: 3 },
  },
  {
    id: 'rank-6',
    name: 'افسانه‌ای',
    honour: 22000,
    bonus: { charisma: 8, damage: 5, intelligence: 5, hp: 4 },
  },
];
export const EARNED_TITLES = [
  {
    id: 'first-step',
    name: 'نخستین گام',
    hint: 'پاداش مأموریت «نخستین گام» را بگیر.',
    bonus: { luck: 3 } as TitleBonus,
  },
  {
    id: 'simorgh-keeper',
    name: 'نگاهبان سیمرغ',
    hint: 'دژ خاموش را پاک‌سازی کن.',
    bonus: { vitality: 4 },
  },
  {
    id: 'road-warden',
    name: 'دشت‌بان',
    hint: 'سالار راهزنان را ۲۵ بار شکست بده.',
    bonus: { strength: 4 },
  },
  {
    id: 'storyteller',
    name: 'راوی',
    hint: 'در ۵۰۰ لشکرکشی پیروز شو.',
    bonus: { intelligence: 6 },
  },
  {
    id: 'glorious',
    name: 'فرّه‌مند',
    hint: 'به رتبهٔ نامدار برس.',
    bonus: { charisma: 10 },
  },
  {
    id: 'arena-lion',
    name: 'شیر میدان',
    hint: 'در ۱۰۰ نبرد میدان پیروز شو.',
    bonus: { strength: 5, agility: 3 },
  },
  {
    id: 'div-bane',
    name: 'دیوبند',
    hint: 'دیو سپید را شکست بده.',
    bonus: { damage: 5 },
  },
  {
    id: 'seven-labours',
    name: 'هفت‌خوان',
    hint: 'هفت سیاه‌چال گوناگون را پاک‌سازی کن.',
    bonus: { vitality: 5, hp: 4 },
  },
  {
    id: 'smith-friend',
    name: 'یار آهنگر',
    hint: '۵۰ بار تجهیزات را در آهنگری بهتر کن.',
    bonus: { armor: 6 },
  },
  {
    id: 'rich',
    name: 'گنج‌دار',
    hint: 'روی‌هم ۵۰۰٬۰۰۰ سکه به دست بیاور.',
    bonus: { luck: 6 },
  },
  {
    id: 'tireless',
    name: 'خستگی‌ناپذیر',
    hint: '۲۰۰ ساعت کار کن.',
    bonus: { vitality: 6 },
  },
  {
    id: 'dragon-slayer',
    name: 'اژدهاکش',
    hint: 'اژدهای خوان سوم را در سطح دشوار شکست بده.',
    bonus: { strength: 6, damage: 3 },
  },
  {
    id: 'qaf-conqueror',
    name: 'فاتح قاف',
    hint: 'دیوشاه قاف را شکست بده.',
    bonus: { charisma: 8, damage: 6, hp: 5 },
  },
];

/* ---------- Story quests ---------- */

export type QuestKind =
  | 'wins'
  | 'training'
  | 'kill'
  | 'dungeon'
  | 'level'
  | 'arena'
  | 'work'
  | 'upgrade'
  | 'honour'
  | 'bosses'
  | 'hard';
export type Quest = {
  id: string;
  name: string;
  description: string;
  kind: QuestKind;
  target: number;
  ref?: string;
  gold: number;
  xp: number;
};
const q = (
  id: string,
  name: string,
  description: string,
  kind: QuestKind,
  target: number,
  gold: number,
  xp: number,
  ref?: string,
): Quest => ({ id, name, description, kind, target, gold, xp, ref });

export const QUESTS: Quest[] = [
  q('first', 'نخستین گام', 'در یک لشکرکشی پیروز شو.', 'wins', 1, 60, 20),
  q(
    'road',
    'امنیت راه شاهی',
    'سه پیروزی در لشکرکشی‌ها به دست بیاور.',
    'wins',
    3,
    120,
    45,
  ),
  q(
    'training',
    'آهن در آتش',
    'سه بار ویژگی‌های خود را تمرین بده.',
    'training',
    3,
    100,
    40,
  ),
  q(
    'captain',
    'پایان راهزنان',
    'سالار راهزنان پارس را شکست بده.',
    'kill',
    1,
    180,
    75,
    'captain',
  ),
  q(
    'dungeon',
    'روشنایی در تاریکی',
    'دژ خاموش را پاک‌سازی کن.',
    'dungeon',
    1,
    300,
    140,
    'silent-fort',
  ),
  q(
    'arena-1',
    'پا به میدان',
    'در میدان یک هماورد را شکست بده.',
    'arena',
    1,
    150,
    60,
  ),
  q('work-1', 'نان بازو', 'یک نوبت کار را به پایان برسان.', 'work', 1, 80, 30),
  q(
    'forge-1',
    'آتش کوره',
    'یک وسیله را در آهنگری تقویت کن.',
    'upgrade',
    1,
    150,
    60,
  ),
  q(
    'forest',
    'مه هیرکانی',
    'سردار تبعیدی را شکست بده.',
    'kill',
    1,
    450,
    260,
    'forest-chief',
  ),
  q('level-10', 'پهلوان جوان', 'به سطح ۱۰ برس.', 'level', 10, 600, 0),
  q(
    'black-div',
    'انتقام سیامک',
    'غار دیو سیاه را پاک‌سازی کن.',
    'dungeon',
    1,
    700,
    400,
    'black-div-cave',
  ),
  q('wins-100', 'صد پیروزی', 'در ۱۰۰ لشکرکشی پیروز شو.', 'wins', 100, 900, 400),
  q(
    'alborz',
    'گذرگاه برفی',
    'سالار دژ سنگی را شکست بده.',
    'kill',
    1,
    1000,
    600,
    'mountain-chief',
  ),
  q(
    'arena-25',
    'آوازهٔ میدان',
    'در ۲۵ نبرد میدان پیروز شو.',
    'arena',
    25,
    1200,
    500,
  ),
  q(
    'dragon',
    'خوان سوم',
    'کنام اژدها را پاک‌سازی کن.',
    'dungeon',
    1,
    1500,
    900,
    'dragon-lair',
  ),
  q('training-50', 'تن پولادین', '۵۰ بار تمرین کن.', 'training', 50, 1500, 600),
  q('level-20', 'پهلوان کارآزموده', 'به سطح ۲۰ برس.', 'level', 20, 2500, 0),
  q(
    'lut',
    'توفان شن',
    'سالار ریگ روان را شکست بده.',
    'kill',
    1,
    2600,
    1500,
    'sand-lord',
  ),
  q(
    'hard-1',
    'راه دشوار',
    'یک سیاه‌چال را در سطح دشوار پاک‌سازی کن.',
    'hard',
    1,
    3000,
    1500,
  ),
  q(
    'caravanserai',
    'کاروان گمشده',
    'کاروانسرای نفرین‌شده را پاک‌سازی کن.',
    'dungeon',
    1,
    3200,
    1800,
    'cursed-caravanserai',
  ),
  q(
    'forge-25',
    'دست آهنگر',
    '۲۵ بار در آهنگری تقویت کن.',
    'upgrade',
    25,
    3500,
    1500,
  ),
  q(
    'honour-2000',
    'آبروی پهلوان',
    'به ۲۰۰۰ آبرو برس.',
    'honour',
    2000,
    4000,
    2000,
  ),
  q(
    'karun',
    'گذرگاه رود',
    'غول مفرغی را شکست بده.',
    'kill',
    1,
    5000,
    2800,
    'colossus',
  ),
  q(
    'wins-1000',
    'هزار پیروزی',
    'در ۱۰۰۰ لشکرکشی پیروز شو.',
    'wins',
    1000,
    6000,
    3000,
  ),
  q(
    'cistern',
    'آب سیاه',
    'آب‌انبار غرق‌شده را پاک‌سازی کن.',
    'dungeon',
    1,
    6500,
    3600,
    'sunken-cistern',
  ),
  q('level-30', 'سی سال پهلوانی', 'به سطح ۳۰ برس.', 'level', 30, 8000, 0),
  q(
    'work-100',
    'بازوی خستگی‌ناپذیر',
    '۱۰۰ ساعت کار کن.',
    'work',
    100,
    5000,
    2500,
  ),
  q(
    'akvan',
    'اکوان دیو',
    'اکوان دیو را شکست بده.',
    'kill',
    1,
    10000,
    5500,
    'akvan',
  ),
  q(
    'bosses-100',
    'شکارچی سالاران',
    '۱۰۰ سالار منطقه را شکست بده.',
    'bosses',
    100,
    9000,
    5000,
  ),
  q(
    'burnt',
    'خاکستر گرم',
    'ویرانه‌های شهر سوخته را پاک‌سازی کن.',
    'dungeon',
    1,
    12000,
    6500,
    'burnt-city',
  ),
  q(
    'arena-250',
    'سرور میدان',
    'در ۲۵۰ نبرد میدان پیروز شو.',
    'arena',
    250,
    14000,
    7000,
  ),
  q('level-40', 'چهل منزل', 'به سطح ۴۰ برس.', 'level', 40, 16000, 0),
  q(
    'white-div',
    'خوان هفتم',
    'دیو سپید را شکست بده.',
    'kill',
    1,
    20000,
    10000,
    'white-div',
  ),
  q(
    'well',
    'رهایی کاووس',
    'چاه دیو سپید را پاک‌سازی کن.',
    'dungeon',
    1,
    24000,
    12000,
    'white-div-well',
  ),
  q(
    'honour-11000',
    'جهان‌پهلوان',
    'به ۱۱٬۰۰۰ آبرو برس.',
    'honour',
    11000,
    26000,
    12000,
  ),
  q('level-50', 'پنجاه منزل', 'به سطح ۵۰ برس.', 'level', 50, 30000, 0),
  q(
    'zahhak',
    'بند دماوند',
    'سایهٔ ضحاک را شکست بده.',
    'kill',
    1,
    36000,
    18000,
    'zahhak-shadow',
  ),
  q(
    'prison',
    'زنجیرهای کهن',
    'زندان ضحاک را پاک‌سازی کن.',
    'dungeon',
    1,
    42000,
    22000,
    'zahhak-prison',
  ),
  q('level-60', 'شصت منزل', 'به سطح ۶۰ برس.', 'level', 60, 50000, 0),
  q(
    'div-king',
    'آخرین افسانه',
    'دیوشاه قاف را شکست بده.',
    'kill',
    1,
    70000,
    30000,
    'div-king',
  ),
  q(
    'qaf-hall',
    'تخت قاف',
    'تالار دیوشاه را پاک‌سازی کن.',
    'dungeon',
    1,
    90000,
    40000,
    'qaf-hall',
  ),
];

/* ---------- Daily temple missions ---------- */

export type DailyKind =
  | 'wins'
  | 'regionWins'
  | 'bosses'
  | 'dungeon'
  | 'arena'
  | 'training'
  | 'forge'
  | 'workHours';
export const DAILY_TEMPLATES: {
  kind: DailyKind;
  name: string;
  text: (n: number, region: string) => string;
  targets: [number, number];
  weight: number;
}[] = [
  {
    kind: 'wins',
    name: 'پاسداری راه‌ها',
    text: (n) => `در ${fa(n)} لشکرکشی پیروز شو.`,
    targets: [10, 25],
    weight: 3,
  },
  {
    kind: 'regionWins',
    name: 'پاک‌سازی سرزمین',
    text: (n, r) => `در ${r} ${fa(n)} پیروزی به دست بیاور.`,
    targets: [6, 14],
    weight: 3,
  },
  {
    kind: 'bosses',
    name: 'شکار سالار',
    text: (n) => `${fa(n)} سالار منطقه را شکست بده.`,
    targets: [1, 4],
    weight: 2,
  },
  {
    kind: 'dungeon',
    name: 'فرود به تاریکی',
    text: (n) => `${fa(n)} تالار سیاه‌چال را پشت سر بگذار.`,
    targets: [3, 8],
    weight: 2,
  },
  {
    kind: 'arena',
    name: 'آزمون میدان',
    text: (n) => `در ${fa(n)} نبرد میدان پیروز شو.`,
    targets: [2, 5],
    weight: 2,
  },
  {
    kind: 'training',
    name: 'ورزش باستانی',
    text: (n) => `${fa(n)} بار در تمرین‌گاه تمرین کن.`,
    targets: [2, 5],
    weight: 1,
  },
  {
    kind: 'forge',
    name: 'کار کوره',
    text: (n) => `${fa(n)} بار در آهنگری تقویت یا گداز کن.`,
    targets: [1, 3],
    weight: 1,
  },
  {
    kind: 'workHours',
    name: 'بازوی شهر',
    text: (n) => `${fa(n)} ساعت کار کن.`,
    targets: [2, 8],
    weight: 1,
  },
];
export const DAILY_COUNT = 4;

/* ---------- Arena rivals (NPC gladiators, not players) ---------- */

export const RIVAL_NAMES = [
  'بهزاد',
  'گردآفرید',
  'کاوه',
  'آرش',
  'بانوگشسب',
  'گیو',
  'گودرز',
  'بیژن',
  'منیژه',
  'فرامرز',
  'تهمینه',
  'سهراب',
  'زریر',
  'اسفندیار',
  'پشوتن',
  'نوذر',
  'گرشاسب',
  'نریمان',
  'فرنگیس',
  'جریره',
  'رودابه',
  'سیندخت',
  'شیرین',
  'بهرام',
  'گستهم',
  'بستور',
  'هجیر',
  'رهام',
  'پولادوند',
  'بارمان',
  'قارن',
  'کشواد',
];
export const RIVAL_EPITHETS = [
  'تیغ‌زن',
  'نیزه‌دار',
  'کمان‌کش',
  'گرزدار',
  'سپرکش',
  'سوار',
  'شیرگیر',
  'زره‌پوش',
];

/* ---------- Pacing ---------- */

export const EXPEDITION_MAX = 24;
export const EXPEDITION_MS = 6 * 60_000;
export const DUNGEON_MAX = 12;
export const DUNGEON_MS = 12 * 60_000;
export const EXPEDITION_COOLDOWN_MS = 20_000;
export const DUNGEON_COOLDOWN_MS = 20_000;
export const ARENA_COOLDOWN_MS = 10 * 60_000;
export const HEAL_MS = 60_000;
export const PACKAGE_MS = 7 * 24 * 60 * 60_000;
export const PACKAGE_CAP = 150;
export const HISTORY_CAP = 25;
export const LEVEL_CAP = 80;
/** Iran Standard Time; daily missions and shop stock follow local days. */
export const DAY_OFFSET_MS = 3.5 * 60 * 60_000;
export const MARKET_PERIOD_MS = 6 * 60 * 60_000;
export const MARKET_SIZE = 12;

export const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
