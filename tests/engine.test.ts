import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  derived,
  enemyUnlocked,
  GameError,
  newGame,
  questProgress,
  regenerate,
  transition,
} from '../lib/game/engine';
import {
  DUNGEON,
  ENEMIES,
  ENERGY_MS,
  HEAL_MS,
  ITEMS,
  QUESTS,
} from '../lib/game/content';
const start = 1_000_000;
const stable = () => 0.5;
void test('starter can win first expedition and receives persistent rewards without mutating input', () => {
  const s = newGame(start);
  const r = transition(s, { type: 'fight', enemyId: 'wolf' }, start, stable);
  assert.ok(r.battle?.won);
  assert.equal(r.state.energy, 11);
  assert.equal(r.state.wins, 1);
  assert.ok(r.state.gold > 350);
  assert.equal(r.state.history.length, 1);
  assert.equal(r.state.inventory.length, 3);
  assert.equal(s.gold, 350);
  assert.equal(s.energy, 12);
  assert.ok(enemyUnlocked(r.state, ENEMIES[1]));
});
void test('unavailable enemies, regions and dungeons are rejected', () => {
  const s = newGame(start);
  for (const action of [
    { type: 'fight', enemyId: 'captain' },
    { type: 'fight', enemyId: 'forest-wolf' },
    { type: 'dungeon' },
  ] as const)
    assert.throws(() => transition(s, action, start, stable), GameError);
});
void test('cooldown and energy cannot be bypassed by another action', () => {
  const r = transition(
    newGame(start),
    { type: 'fight', enemyId: 'wolf' },
    start,
    stable,
  );
  assert.throws(
    () =>
      transition(
        r.state,
        { type: 'fight', enemyId: 'wolf' },
        start + 1000,
        stable,
      ),
    GameError,
  );
  const s = newGame(start);
  s.energy = 0;
  assert.throws(
    () => transition(s, { type: 'fight', enemyId: 'wolf' }, start, stable),
    GameError,
  );
});
void test('regeneration respects elapsed time, partial intervals and caps', () => {
  const s = newGame(start);
  s.energy = 2;
  s.hp = 10;
  const r = regenerate(s, start + ENERGY_MS * 2 + 5000);
  assert.equal(r.energy, 4);
  assert.equal(r.energyAt, start + 2 * ENERGY_MS);
  assert.equal(r.hp, 34);
  const capped = regenerate(s, start + 100 * ENERGY_MS);
  assert.equal(capped.energy, 12);
  assert.equal(capped.hp, 120);
  assert.equal(regenerate(s, start - 1000).energy, 2);
});
void test('spending, equipment swaps, food and selling enforce inventory ownership', () => {
  let s = newGame(start);
  s = transition(s, { type: 'buy', itemId: 'bronze-blade' }, start).state;
  assert.equal(s.gold, 170);
  assert.equal(derived(s).attack, 14);
  s = transition(s, { type: 'equip', itemId: 'bronze-blade' }, start).state;
  assert.equal(derived(s).attack, 19);
  assert.throws(
    () => transition(s, { type: 'sell', itemId: 'bronze-blade' }, start),
    GameError,
  );
  assert.throws(
    () => transition(s, { type: 'equip', itemId: 'sun-blade' }, start),
    GameError,
  );
  s = transition(s, { type: 'sell', itemId: 'iron-blade' }, start).state;
  assert.equal(s.gold, 196);
  assert.throws(
    () => transition(s, { type: 'buy', itemId: 'sun-blade' }, start),
    GameError,
  );
  assert.throws(() => transition(s, { type: 'heal' }, start), GameError);
  s.hp = 30;
  s = transition(s, { type: 'heal' }, start).state;
  assert.equal(s.hp, 90);
  assert.equal(s.food, 2);
});
void test('quests pay once and cannot be claimed early', () => {
  let s = newGame(start);
  assert.throws(
    () => transition(s, { type: 'claim', questId: 'first' }, start),
    GameError,
  );
  s = transition(s, { type: 'fight', enemyId: 'wolf' }, start, stable).state;
  const before = s.gold;
  s = transition(s, { type: 'claim', questId: 'first' }, start).state;
  assert.equal(s.gold, before + 60);
  assert.throws(
    () => transition(s, { type: 'claim', questId: 'first' }, start),
    GameError,
  );
});
void test('level gains apply stats and refill health even for multiple levels', () => {
  let s = newGame(start);
  s.wins = 3;
  s.xp = 79;
  s.hp = 22;
  s = transition(s, { type: 'claim', questId: 'road' }, start).state;
  assert.equal(s.level, 2);
  assert.equal(s.xp, 44);
  assert.equal(s.stats.strength, 11);
  assert.equal(s.stats.vitality, 11);
  assert.equal(s.hp, derived(s).maxHp);
});
void test('defeat has no victory rewards and player recovers from one health', () => {
  const s = newGame(start);
  s.hp = 20;
  s.stats.strength = 0;
  s.equipment.weapon = null;
  const r = transition(s, { type: 'fight', enemyId: 'wolf' }, start, stable);
  assert.equal(r.battle?.won, false);
  assert.equal(r.state.hp, 1);
  assert.equal(r.state.gold, 350);
  assert.equal(r.state.wins, 0);
  assert.equal(r.state.inventory.length, 2);
  assert.throws(
    () =>
      transition(
        r.state,
        { type: 'fight', enemyId: 'wolf' },
        start + 9000,
        stable,
      ),
    GameError,
  );
  assert.ok(regenerate(r.state, start + 4 * HEAL_MS).hp >= 20);
});
void test('dungeon stages persist, finish with guaranteed relic, and reset for replay', () => {
  let s = newGame(start);
  s.level = 5;
  s.stats.strength = 100;
  s.stats.vitality = 100;
  s.hp = derived(s).maxHp;
  for (let i = 0; i < 3; i++) {
    s = transition(s, { type: 'dungeon' }, start + i * 9000, stable).state;
    assert.equal(s.dungeonStage, (i + 1) % 3);
  }
  assert.equal(s.dungeonClears, 1);
  assert.ok(s.inventory.includes('simorgh'));
  assert.equal(s.energy, 6);
  assert.equal(questProgress(s, QUESTS[4]), 1);
  assert.equal(s.history[0].enemyId, DUNGEON[2].id);
});
void test('full inventory converts loot to coins and duplicate equipped items may be sold safely', () => {
  const s = newGame(start);
  s.inventory = Array(40).fill('iron-blade');
  const r = transition(s, { type: 'fight', enemyId: 'wolf' }, start, stable);
  assert.equal(r.state.inventory.length, 40);
  assert.equal(r.battle?.loot, null);
  assert.ok(r.state.gold > 350 + r.battle!.gold);
  const sold = transition(
    s,
    { type: 'sell', itemId: 'iron-blade' },
    start,
  ).state;
  assert.equal(sold.inventory.length, 39);
  assert.equal(sold.equipment.weapon, 'iron-blade');
});
void test('training cost cannot create negative balance and health tracks equipment capacity', () => {
  let s = newGame(start);
  s.gold = 0;
  assert.throws(
    () => transition(s, { type: 'train', stat: 'strength' }, start),
    GameError,
  );
  s.gold = 1000;
  s = transition(s, { type: 'train', stat: 'vitality' }, start).state;
  assert.equal(s.hp, 126);
  s = transition(s, { type: 'buy', itemId: 'cypress' }, start).state;
  s = transition(s, { type: 'equip', itemId: 'cypress' }, start).state;
  s.hp = derived(s).maxHp;
  s = transition(s, { type: 'unequip', slot: 'charm' }, start).state;
  assert.equal(s.hp, 126);
});
void test('seeded first encounter consistently supports a new player', () => {
  let wins = 0;
  for (let seed = 1; seed <= 250; seed++) {
    let n = seed;
    const rng = () => {
      n = (n * 1664525 + 1013904223) >>> 0;
      return n / 4294967296;
    };
    const r = transition(
      newGame(start),
      { type: 'fight', enemyId: 'wolf' },
      start,
      rng,
    );
    if (r.battle?.won) wins++;
    assert.ok(r.state.hp >= 1);
    assert.ok(r.state.gold >= 0);
  }
  assert.ok(wins >= 245, `${wins}/250 wins`);
});
void test('all items and enemies have valid economy and battle values', () => {
  for (const i of ITEMS)
    assert.ok(i.price > 0 && i.attack >= 0 && i.armor >= 0);
  for (const e of [...ENEMIES, ...DUNGEON])
    assert.ok(e.hp > 0 && e.attack > 0 && e.gold > 0 && e.xp > 0);
});
