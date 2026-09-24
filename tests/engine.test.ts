import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  arenaRivals,
  baseOf,
  dailyMissions,
  derived,
  enemyUnlocked,
  expeditionEnemy,
  GameError,
  itemStats,
  itemValue,
  marketPrice,
  marketStock,
  newGame,
  normalizeSave,
  playableGame,
  playerCombatant,
  questProgress,
  regenerate,
  rollItem,
  seeded,
  sellPrice,
  simulate,
  titleUnlocked,
  transition,
  upgradeCost,
  xpGoal,
  type GameState,
} from '../lib/game/engine';
import {
  COSTUMES,
  DUNGEONS,
  ENEMIES,
  ENEMY_BY_ID,
  EXPEDITION_MAX,
  EXPEDITION_MS,
  ITEM_BASES,
  PACKAGE_MS,
  PREFIXES,
  QUESTS,
  SUFFIXES,
  SLOTS,
} from '../lib/game/content';
import { PROFILES, run } from '../scripts/simulate';

const start = Date.UTC(2026, 8, 1, 8);
const stable = () => 0.5;
const rng = (seed: number) => seeded(seed);
const fight = (s: GameState, enemyId: string, at = start, r = stable) =>
  transition(s, { type: 'fight', enemyId }, at, r);

void test('starter wins the first expedition, loot goes to packages, input is not mutated', () => {
  const s = playableGame(start);
  const r = fight(s, 'wolf');
  assert.ok(r.battle?.won);
  assert.equal(r.state.expPoints, EXPEDITION_MAX - 1);
  assert.equal(r.state.counters.wins, 1);
  assert.ok(r.state.gold > 350);
  assert.equal(r.state.packages.length, 1, 'first kill always drops');
  assert.equal(r.state.honour, 1);
  assert.equal(s.gold, 350);
  assert.equal(s.expPoints, EXPEDITION_MAX);
  assert.ok(enemyUnlocked(r.state, ENEMY_BY_ID.get('bandit')!));
});

void test('seeded first encounters consistently support a new player', () => {
  let wins = 0;
  for (let seed = 1; seed <= 250; seed++) {
    const r = fight(playableGame(start), 'wolf', start, rng(seed));
    if (r.battle?.won) wins++;
    assert.ok(r.state.hp >= 1);
  }
  assert.ok(wins >= 245, `${wins}/250 wins`);
});

void test('locked enemies, regions, dungeons and arena are rejected', () => {
  const s = playableGame(start);
  for (const action of [
    { type: 'fight', enemyId: 'captain' },
    { type: 'fight', enemyId: 'forest-wolf' },
    { type: 'fight', enemyId: 'invented' },
    { type: 'dungeon', dungeonId: 'silent-fort' },
    { type: 'dungeon', dungeonId: 'nowhere' },
    { type: 'arena', index: 0 },
  ] as const)
    assert.throws(() => transition(s, action, start, stable), GameError);
});

void test('cooldown, points, work and low health block fights', () => {
  const r = fight(playableGame(start), 'wolf');
  assert.throws(() => fight(r.state, 'wolf', start + 1000), GameError);
  const empty = playableGame(start);
  empty.expPoints = 0;
  assert.throws(() => fight(empty, 'wolf'), GameError);
  const hurt = playableGame(start);
  hurt.hp = 5;
  assert.throws(() => fight(hurt, 'wolf'), GameError);
  const working = transition(
    playableGame(start),
    { type: 'work', jobId: 'stable', hours: 1 },
    start,
  ).state;
  assert.throws(() => fight(working, 'wolf', start + 60_000), GameError);
});

void test('points and health regenerate over time up to their caps', () => {
  const s = playableGame(start);
  s.expPoints = 2;
  s.expAt = start;
  s.hp = 10;
  s.healAt = start;
  const r = regenerate(s, start + EXPEDITION_MS * 2 + 5000);
  assert.equal(r.expPoints, 4);
  assert.equal(r.expAt, start + 2 * EXPEDITION_MS);
  assert.ok(r.hp > 10);
  const capped = regenerate(s, start + 1000 * EXPEDITION_MS);
  assert.equal(capped.expPoints, EXPEDITION_MAX);
  assert.equal(capped.hp, derived(capped).maxHp);
});

void test('packages move to the bag, sell, smelt and expire into coins', () => {
  let s = fight(playableGame(start), 'wolf').state;
  const uid = s.packages[0].item.uid;
  s = transition(s, { type: 'take', uid }, start).state;
  assert.equal(s.packages.length, 0);
  assert.equal(s.bag[0].uid, uid);
  const gold = s.gold;
  s = transition(s, { type: 'sell', uid }, start).state;
  assert.equal(s.gold, gold + sellPrice(s.history[0].loot!));
  assert.equal(s.bag.length, 0);

  const t = fight(playableGame(start), 'wolf').state;
  const smelted = transition(
    t,
    { type: 'smelt', uid: t.packages[0].item.uid },
    start,
  ).state;
  assert.ok(smelted.dust > 0);

  const expired = regenerate(t, start + PACKAGE_MS + 1);
  assert.equal(expired.packages.length, 0);
  assert.equal(expired.gold, t.gold + sellPrice(t.packages[0].item));
});

void test('equipping swaps with the bag, respects wear level and cannot duplicate items', () => {
  let s = playableGame(start);
  const item = rollItem(s, 1, rng(3), { slot: 'weapon' });
  s.bag.push(item);
  const old = s.equipment.weapon!;
  s = transition(s, { type: 'equip', uid: item.uid }, start).state;
  assert.equal(s.equipment.weapon!.uid, item.uid);
  assert.equal(s.bag.length, 1);
  assert.equal(s.bag[0].uid, old.uid);
  assert.throws(
    () => transition(s, { type: 'equip', uid: item.uid }, start),
    GameError,
  );
  assert.throws(
    () => transition(s, { type: 'sell', uid: item.uid }, start),
    GameError,
  );
  const high = rollItem(s, 30, rng(4), { slot: 'helmet' });
  s.bag.push(high);
  assert.throws(
    () => transition(s, { type: 'equip', uid: high.uid }, start),
    GameError,
  );
  s = transition(s, { type: 'unequip', slot: 'weapon' }, start).state;
  assert.equal(s.equipment.weapon, null);
  assert.equal(derived(s).min, Math.floor(s.stats.strength * 0.3) + 1);
});

void test('market stock is deterministic, priced by the server and sold once', () => {
  let s = playableGame(start);
  s.gold = 100_000;
  const a = marketStock(s),
    b = marketStock(structuredClone(s));
  assert.deepEqual(a, b);
  const price = marketPrice(a[0]);
  s = transition(s, { type: 'buy', index: 0 }, start).state;
  assert.equal(s.gold, 100_000 - price);
  assert.equal(s.bag.length, 1);
  assert.throws(
    () => transition(s, { type: 'buy', index: 0 }, start),
    GameError,
  );
  assert.throws(
    () => transition(s, { type: 'buy', index: 99 }, start),
    GameError,
  );
  const later = regenerate(s, start + 6 * 3_600_000);
  assert.notDeepEqual(marketStock(later), a);
  assert.equal(later.market.bought.length, 0);
});

void test('forge upgrades and refines with gold and dust, capped', () => {
  let s = playableGame(start);
  s.gold = 1_000_000;
  s.dust = 10_000;
  const uid = s.equipment.weapon!.uid;
  const before = itemStats(s.equipment.weapon!).max;
  const cost = upgradeCost(s.equipment.weapon!);
  s = transition(s, { type: 'upgrade', uid }, start).state;
  assert.equal(s.equipment.weapon!.upgrade, 1);
  assert.equal(s.dust, 10_000 - cost.dust);
  assert.ok(itemStats(s.equipment.weapon!).max >= before);
  for (let i = 1; i < 10; i++)
    s = transition(s, { type: 'upgrade', uid }, start).state;
  assert.throws(
    () => transition(s, { type: 'upgrade', uid }, start),
    GameError,
  );
  for (let i = 0; i < 4; i++)
    s = transition(s, { type: 'refine', uid }, start).state;
  assert.equal(s.equipment.weapon!.quality, 4);
  assert.throws(() => transition(s, { type: 'refine', uid }, start), GameError);
  const poor = playableGame(start);
  assert.throws(
    () =>
      transition(
        poor,
        { type: 'upgrade', uid: poor.equipment.armor!.uid },
        start,
      ),
    GameError,
  );
});

void test('training is capped by level and charged in gold', () => {
  let s = playableGame(start);
  s.gold = 0;
  assert.throws(
    () => transition(s, { type: 'train', stat: 'charisma' }, start),
    GameError,
  );
  s.gold = 1_000_000;
  s = transition(s, { type: 'train', stat: 'charisma' }, start).state;
  assert.equal(s.stats.charisma, 6);
  s.stats.luck = 25;
  assert.throws(
    () => transition(s, { type: 'train', stat: 'luck' }, start),
    GameError,
  );
  assert.throws(
    () => transition(s, { type: 'train', stat: 'magic' as 'luck' }, start),
    GameError,
  );
});

void test('work pays when the shift ends and pays nothing when cancelled', () => {
  const s = transition(
    playableGame(start),
    { type: 'work', jobId: 'stable', hours: 2 },
    start,
  ).state;
  const pay = s.work!.gold;
  assert.ok(pay > 0);
  const done = regenerate(s, start + 2 * 3_600_000);
  assert.equal(done.work, null);
  assert.equal(done.gold, s.gold + pay);
  assert.equal(done.counters.workHours, 2);
  const cancelled = transition(s, { type: 'cancelWork' }, start + 1000).state;
  assert.equal(cancelled.gold, s.gold);
  assert.throws(
    () =>
      transition(
        playableGame(start),
        { type: 'work', jobId: 'envoy', hours: 1 },
        start,
      ),
    GameError,
  );
  assert.throws(
    () =>
      transition(
        playableGame(start),
        { type: 'work', jobId: 'stable', hours: 3 },
        start,
      ),
    GameError,
  );
});

void test('food heals by percent and costs coins', () => {
  let s = playableGame(start);
  s.hp = 10;
  s = transition(s, { type: 'eat', foodId: 'bread' }, start).state;
  assert.ok(s.hp > 10);
  assert.equal(s.food.bread, 2);
  s.food.kebab = 0;
  assert.throws(
    () => transition(s, { type: 'eat', foodId: 'kebab' }, start),
    GameError,
  );
  const gold = s.gold;
  s = transition(
    s,
    { type: 'buyFood', foodId: 'kebab', count: 2 },
    start,
  ).state;
  assert.equal(s.food.kebab, 2);
  assert.ok(s.gold < gold);
  assert.throws(
    () => transition(s, { type: 'buyFood', foodId: 'kebab', count: 0 }, start),
    GameError,
  );
});

void test('dungeon stages persist, bosses guarantee good loot, hard mode needs a clear', () => {
  let s = playableGame(start);
  s.level = 5;
  s.stats.strength = 200;
  s.stats.vitality = 200;
  s.hp = derived(s).maxHp;
  assert.throws(
    () =>
      transition(
        s,
        { type: 'dungeon', dungeonId: 'silent-fort', hard: true },
        start,
        stable,
      ),
    GameError,
  );
  const stages = DUNGEONS[0].stages.length;
  for (let i = 0; i < stages; i++) {
    s = transition(
      s,
      { type: 'dungeon', dungeonId: 'silent-fort' },
      start + i * 30_000,
      stable,
    ).state;
    s.hp = derived(s).maxHp;
  }
  assert.equal(s.dungeons['silent-fort'].clears, 1);
  assert.equal(s.dungeons['silent-fort'].stage, 0);
  assert.ok(s.fame > 0);
  assert.ok(s.packages.some((p) => p.item.quality >= 2));
  assert.equal(
    questProgress(
      s,
      QUESTS.find((q) => q.id === 'dungeon')!,
    ),
    1,
  );
  assert.ok(titleUnlocked(s, 'simorgh-keeper'));
  const hard = transition(
    s,
    { type: 'dungeon', dungeonId: 'silent-fort', hard: true },
    start + 10 * 30_000,
    stable,
  ).state;
  assert.equal(hard.dungeons['silent-fort'].hard, true);
});

void test('arena rivals rotate after each fight and honour cannot go negative', () => {
  const s = playableGame(start);
  s.level = 5;
  const first = arenaRivals(s);
  assert.equal(first.length, 5);
  s.stats.strength = 1;
  s.equipment.weapon = null;
  s.hp = derived(s).maxHp;
  const r = transition(s, { type: 'arena', index: 4 }, start, stable);
  assert.equal(r.battle?.won, false);
  assert.equal(r.state.honour, 0);
  assert.notDeepEqual(arenaRivals(r.state), first);
  assert.throws(
    () => transition(r.state, { type: 'arena', index: 0 }, start + 60_000),
    GameError,
  );
});

void test('daily missions are stable within a day, pay once and reset the next day', () => {
  let s = playableGame(start);
  const a = dailyMissions(s);
  assert.equal(a.length, 4);
  assert.deepEqual(dailyMissions(structuredClone(s)), a);
  assert.throws(
    () => transition(s, { type: 'claimDaily', index: 0 }, start),
    GameError,
  );
  s.daily.progress[a[0].kind] = a[0].target;
  const gold = s.gold;
  s = transition(s, { type: 'claimDaily', index: 0 }, start).state;
  assert.equal(s.gold, gold + a[0].gold);
  assert.throws(
    () => transition(s, { type: 'claimDaily', index: 0 }, start),
    GameError,
  );
  const tomorrow = regenerate(s, start + 86_400_000);
  assert.equal(tomorrow.daily.claimed.length, 0);
  assert.equal(tomorrow.daily.progress[a[0].kind], 0);
});

void test('quests pay once, level gains grant stats and full health', () => {
  let s = playableGame(start);
  assert.throws(
    () => transition(s, { type: 'claim', questId: 'first' }, start),
    GameError,
  );
  s = fight(s, 'wolf').state;
  const gold = s.gold;
  s.xp = xpGoal(1) - 1;
  s.hp = 20;
  s = transition(s, { type: 'claim', questId: 'first' }, start).state;
  assert.equal(s.gold, gold + 60);
  assert.equal(s.level, 2);
  assert.equal(s.stats.strength, 11);
  assert.equal(s.hp, derived(s).maxHp);
  assert.throws(
    () => transition(s, { type: 'claim', questId: 'first' }, start),
    GameError,
  );
  assert.ok(titleUnlocked(s, 'first-step'));
  s = transition(s, { type: 'setTitle', titleId: 'first-step' }, start).state;
  assert.equal(s.activeTitleId, 'first-step');
  assert.throws(
    () => transition(s, { type: 'setTitle', titleId: 'qaf-conqueror' }, start),
    GameError,
  );
});

void test('defeat grants no rewards and the hero survives with one health', () => {
  const s = playableGame(start);
  s.stats.strength = 0;
  s.equipment.weapon = null;
  s.hp = 30;
  const r = fight(s, 'wolf');
  assert.equal(r.battle?.won, false);
  assert.equal(r.state.hp, 1);
  assert.equal(r.state.gold, 350);
  assert.equal(r.state.counters.wins, 0);
  assert.equal(r.state.packages.length, 0);
});

void test('content tables are internally consistent', () => {
  assert.equal(ITEM_BASES.length, SLOTS.length * 10);
  for (const b of ITEM_BASES) assert.ok(b.name && b.level >= 1);
  const ids = new Set([
    ...ENEMIES.map((e) => e.id),
    ...DUNGEONS.flatMap((d) => d.stages.map((x) => x.id)),
  ]);
  assert.equal(
    ids.size,
    ENEMIES.length + DUNGEONS.reduce((a, d) => a + d.stages.length, 0),
  );
  for (const q of QUESTS) {
    if (q.kind === 'kill') assert.ok(ENEMY_BY_ID.has(q.ref!), q.id);
    if (q.kind === 'dungeon')
      assert.ok(
        DUNGEONS.some((d) => d.id === q.ref),
        q.id,
      );
  }
  assert.equal(new Set(QUESTS.map((q) => q.id)).size, QUESTS.length);
  for (const a of [...PREFIXES, ...SUFFIXES]) assert.ok(a.effects.length > 0);
  for (const c of COSTUMES) assert.ok(c.id && c.name);
  const s = playableGame(start);
  const r = rng(9);
  for (let i = 0; i < 500; i++) {
    const item = rollItem(s, 1 + Math.floor(r() * 80), r);
    assert.ok(itemValue(item) > 0);
    if (item.prefix || item.suffix) assert.ok(item.quality >= 1);
    const slot = baseOf(item).slot;
    for (const a of [item.prefix, item.suffix]) {
      const affix = [...PREFIXES, ...SUFFIXES].find((x) => x.id === a);
      if (affix)
        assert.ok(!affix.bannedSlots?.includes(slot), `${affix.id} on ${slot}`);
    }
  }
});

void test('regional bosses are tougher than their regular enemies', () => {
  const s = playableGame(start);
  const hero = playerCombatant(s);
  const random = rng(5);
  let wolf = 0,
    captain = 0;
  for (let i = 0; i < 200; i++) {
    if (
      simulate({ ...hero }, expeditionEnemy(ENEMY_BY_ID.get('wolf')!), random)
        .won
    )
      wolf++;
    if (
      simulate(
        { ...hero },
        expeditionEnemy(ENEMY_BY_ID.get('captain')!),
        random,
      ).won
    )
      captain++;
  }
  assert.ok(wolf > 190, `wolf ${wolf}`);
  assert.ok(captain < 60, `captain ${captain}`);
});

void test('version 1 saves migrate items, progress and appearance', () => {
  const legacy = {
    saveVersion: 1,
    characterCreated: true,
    appearance: { gender: 'male', activeCostumeId: 'travel' },
    ownedCostumeIds: ['travel', 'ceremonial'],
    name: 'رستم',
    level: 5,
    xp: 40,
    gold: 880,
    hp: 150,
    energy: 6,
    energyAt: start,
    healAt: start,
    cooldownUntil: 0,
    stats: { strength: 20, agility: 12, vitality: 18, luck: 7 },
    inventory: [
      'iron-blade',
      'leather',
      'bronze-blade',
      'simorgh',
      'bronze-blade',
    ],
    equipment: { weapon: 'bronze-blade', armor: 'leather', charm: 'simorgh' },
    food: 4,
    wins: 12,
    training: 3,
    defeated: ['wolf', 'bandit', 'captain'],
    claimed: ['first', 'road'],
    dungeonStage: 1,
    dungeonClears: 1,
    history: [],
    lastActionId: 'abc',
  };
  const s = normalizeSave(legacy as unknown as GameState, start);
  assert.equal(s.saveVersion, 2);
  assert.equal(s.name, 'رستم');
  assert.equal(s.level, 5);
  assert.equal(s.gold, 880);
  assert.equal(s.stats.charisma, 5);
  assert.equal(s.stats.strength, 20);
  assert.equal(s.equipment.weapon?.base, 'bronze-blade');
  assert.equal(s.equipment.amulet?.base, 'simorgh');
  assert.equal(s.equipment.armor?.base, 'leather');
  assert.deepEqual(s.bag.map((i) => i.base).sort(), [
    'bronze-blade',
    'iron-blade',
  ]);
  assert.equal(s.food.bread, 4);
  assert.equal(s.counters.wins, 12);
  assert.equal(s.kills.captain, 1);
  assert.deepEqual(s.claimed, ['first', 'road']);
  assert.equal(s.dungeons['silent-fort'].stage, 1);
  assert.equal(s.dungeons['silent-fort'].clears, 1);
  assert.equal(s.appearance.gender, 'male');
  assert.equal(s.appearance.activeCostumeId, 'travel');
  assert.equal(s.characterCreated, true);
  assert.equal(s.expPoints, EXPEDITION_MAX / 2);
  // Migrated saves are immediately playable.
  const r = transition(
    s,
    { type: 'fight', enemyId: 'forest-wolf' },
    start,
    stable,
  );
  assert.ok(r.battle);
  // Legacy saves without appearance still need gender selection.
  const bare = normalizeSave(
    {
      ...legacy,
      characterCreated: undefined,
      appearance: undefined,
    } as unknown as GameState,
    start,
  );
  assert.equal(bare.characterCreated, false);
  const done = transition(
    bare,
    { type: 'createCharacter', gender: 'female', name: 'رستم' },
    start,
  ).state;
  assert.equal(done.gold, 880);
});

void test('new saves need a gender first and creation grants nothing extra', () => {
  const fresh = newGame(start, 3);
  assert.equal(fresh.characterCreated, false);
  assert.throws(() => fight(fresh, 'wolf'), GameError);
  const created = transition(
    fresh,
    { type: 'createCharacter', gender: 'female', name: 'آذر' },
    start,
  ).state;
  assert.equal(created.characterCreated, true);
  assert.equal(created.gold, 350);
  assert.equal(created.bag.length, 0);
  assert.throws(
    () =>
      transition(
        created,
        { type: 'createCharacter', gender: 'male', name: 'آذر' },
        start,
      ),
    GameError,
  );
});

void test('gender and costumes change appearance only', () => {
  const female = playableGame(start, 'female');
  const male = playableGame(start, 'male');
  assert.deepEqual(derived(female), derived(male));
  const dressed = transition(
    female,
    { type: 'wearCostume', costumeId: 'ceremonial' },
    start,
  ).state;
  assert.deepEqual(derived(dressed), derived(female));
  assert.throws(
    () =>
      transition(female, { type: 'wearCostume', costumeId: 'invented' }, start),
    GameError,
  );
});

void test('a month of play keeps content ahead of every play style', () => {
  for (const profile of PROFILES) {
    const { rows, final } = run(profile, 30);
    const last = rows.at(-1)!;
    assert.ok(
      last.level >= 30,
      `${profile.name} reached only level ${last.level}`,
    );
    assert.ok(last.level < 75, `${profile.name} reached level ${last.level}`);
    assert.ok(
      !final.kills['div-king'],
      `${profile.name} finished the last boss`,
    );
    assert.ok(
      (final.dungeons['qaf-hall']?.clears ?? 0) === 0,
      `${profile.name} cleared the last dungeon`,
    );
    // Progress keeps moving: every week adds levels.
    for (let d = 7; d < 30; d += 7)
      assert.ok(
        rows[d].level > rows[d - 7].level,
        `${profile.name} stalled in week ${d / 7}`,
      );
  }
});
