/* Month-long pacing simulation. A bot plays the real engine on a schedule and
 * reports progress per day. Run with `npm run simulate`. */
import {
  arenaRivals,
  baseOf,
  dailyMissions,
  derived,
  dungeonProgress,
  dungeonUnlocked,
  enemyUnlocked,
  expeditionEnemy,
  dungeonEnemy,
  enemyCombatant,
  foodPrice,
  itemStats,
  itemValue,
  marketPrice,
  marketStock,
  minFightHp,
  newGame,
  playerCombatant,
  questProgress,
  regenerate,
  rivalCombatant,
  seeded,
  simulate,
  sellPrice,
  smeltDust,
  statCap,
  trainCost,
  transition,
  upgradeCost,
  type Action,
  type Combatant,
  type Party,
  partyOf,
  type GameState,
  type ItemInstance,
} from '../lib/game/engine';
import {
  BAG_UPGRADES,
  COMPANIONS,
  partySlots,
  DUNGEONS,
  ENEMIES,
  JOBS,
  QUESTS,
  REGIONS,
  SLOTS,
  type Stat,
} from '../lib/game/content';

export type Profile = {
  name: string;
  hours: number[];
  arenaPerSession: number;
};
export const PROFILES: Profile[] = [
  { name: 'casual', hours: [8, 21], arenaPerSession: 1 },
  { name: 'engaged', hours: [8, 12, 16, 19, 22], arenaPerSession: 1 },
  {
    name: 'hardcore',
    hours: [7, 8.5, 10, 11.5, 13, 14.5, 16, 17.5, 19, 20.5, 22, 23.5],
    arenaPerSession: 2,
  },
];

let now = 0;
let random = seeded(1);

function act(s: GameState, a: Action) {
  try {
    return transition(s, a, now, random);
  } catch {
    return null;
  }
}

function winRate(s: GameState, foe: Combatant, n = 24, party?: Party) {
  const hero = playerCombatant(s, now);
  hero.hp = derived(s, now).maxHp;
  const r = seeded(foe.level * 97 + s.level);
  let w = 0;
  let hpLoss = 0;
  for (let i = 0; i < n; i++) {
    const res = simulate(
      hero,
      foe,
      r,
      party ? { ...party, maxHp: hero.hp } : undefined,
    );
    if (res.won) w++;
    hpLoss += 1 - res.hp / hero.hp;
  }
  return { rate: w / n, loss: hpLoss / n };
}

const fmt = (w: { rate: number; loss: number }) =>
  `${Math.round(w.rate * 100)}%/-${Math.round(w.loss * 100)}%hp`;

function score(item: ItemInstance) {
  const st = itemStats(item);
  const stats = Object.values(st.stats).reduce((a, b) => a + b, 0);
  return (
    (st.min + st.max) * 1.4 +
    st.armor * 0.6 +
    st.hp * 0.25 +
    stats * 2.2 +
    st.block +
    st.damage * 2.5
  );
}

function manageGear(s: GameState): GameState {
  let r = act(s, { type: 'takeAll' });
  if (r) s = r.state;
  for (const slot of SLOTS) {
    const cur = s.equipment[slot];
    const best = s.bag
      .filter((i) => baseOf(i).slot === slot && i.level <= s.level)
      .sort((a, b) => score(b) - score(a))[0];
    if (best && (!cur || score(best) > score(cur))) {
      r = act(s, { type: 'equip', uid: best.uid });
      if (r) s = r.state;
    }
  }
  // Keep only equipped; smelt high quality, sell the rest.
  for (const item of s.bag) {
    r = act(s, { type: item.quality >= 2 ? 'smelt' : 'sell', uid: item.uid });
    if (r) s = r.state;
  }
  for (const p of s.packages) {
    r = act(s, { type: 'sell', uid: p.item.uid });
    if (r) s = r.state;
  }
  return s;
}

function shop(s: GameState): GameState {
  // Buy a market upgrade when it clearly beats what is worn.
  const stock = marketStock(s);
  stock.forEach((item, index) => {
    if (s.market.bought.includes(index) || item.level > s.level) return;
    const slot = baseOf(item).slot;
    const cur = s.equipment[slot];
    if (cur && score(item) < score(cur) * 1.15) return;
    if (marketPrice(item) > s.gold * 0.5) return;
    const r = act(s, { type: 'buy', index });
    if (r) {
      s = r.state;
      const e = act(s, { type: 'equip', uid: s.bag.at(-1)!.uid });
      if (e) s = e.state;
    }
  });
  return s;
}

function hire(s: GameState): GameState {
  for (const c of COMPANIONS) {
    if (
      !s.companions.includes(c.id) &&
      s.level >= c.level &&
      s.gold > c.price * 2
    ) {
      const r = act(s, { type: 'hireCompanion', companionId: c.id });
      if (r) s = r.state;
    }
  }
  const slots = partySlots(s.level);
  const want = [...s.companions].reverse().slice(0, slots);
  if (want.join() !== s.party.join()) {
    const r = act(s, { type: 'setParty', companionIds: want });
    if (r) s = r.state;
  }
  return s;
}

function spend(s: GameState): GameState {
  s = hire(s);
  // Keep a food reserve, then alternate upgrades and training.
  const need = 6 - s.food.kebab;
  if (need > 0 && s.gold > foodPrice(s, 'kebab') * need * 3) {
    const r = act(s, { type: 'buyFood', foodId: 'kebab', count: need });
    if (r) s = r.state;
  }
  const next = BAG_UPGRADES.find((b) => b.size > s.bagSize);
  if (next && s.level >= next.level && s.gold > next.price * 3) {
    const r = act(s, { type: 'buyBag' });
    if (r) s = r.state;
  }
  const weights: Record<Stat, number> = {
    strength: 1,
    vitality: 0.9,
    agility: 0.7,
    luck: 0.6,
    charisma: 0.55,
    intelligence: 0.4,
  };
  for (let guard = 0; guard < 400; guard++) {
    const stat = (Object.keys(weights) as Stat[])
      .filter((k) => s.stats[k] < statCap(s.level))
      .sort(
        (a, b) => trainCost(s, a) / weights[a] - trainCost(s, b) / weights[b],
      )[0];
    const upItem = SLOTS.map((sl) => s.equipment[sl])
      .filter((i): i is ItemInstance => !!i && i.upgrade < 10)
      .sort((a, b) => upgradeCost(a).gold - upgradeCost(b).gold)[0];
    const trainPrice = stat ? trainCost(s, stat) : Infinity;
    const up = upItem ? upgradeCost(upItem) : null;
    let r = null;
    if (
      up &&
      up.dust <= s.dust &&
      up.gold < trainPrice * 1.5 &&
      up.gold <= s.gold * 0.8
    )
      r = act(s, { type: 'upgrade', uid: upItem!.uid });
    else if (stat && trainPrice <= s.gold * 0.8)
      r = act(s, { type: 'train', stat });
    if (!r) break;
    s = r.state;
  }
  return s;
}

function heal(s: GameState, threshold: number): GameState {
  const max = derived(s, now).maxHp;
  while (s.hp < max * threshold) {
    const food = s.food.kebab > 0 ? 'kebab' : s.food.bread > 0 ? 'bread' : null;
    if (!food) {
      const r = act(s, { type: 'buyFood', foodId: 'kebab', count: 3 });
      if (!r) break;
      s = r.state;
      continue;
    }
    const r = act(s, { type: 'eat', foodId: food });
    if (!r) break;
    s = r.state;
  }
  return s;
}

function claims(s: GameState): GameState {
  for (const q of QUESTS) {
    if (!s.claimed.includes(q.id) && questProgress(s, q) >= q.target) {
      const r = act(s, { type: 'claim', questId: q.id });
      if (r) s = r.state;
    }
  }
  for (const m of dailyMissions(s)) {
    if (!m.claimed && m.progress >= m.target) {
      const r = act(s, { type: 'claimDaily', index: m.index });
      if (r) s = r.state;
    }
  }
  return s;
}

type Stats = { fights: number; wins: number; foodGold: number };

function session(s: GameState, profile: Profile, last: boolean, st: Stats) {
  s = regenerate(s, now);
  if (s.work) {
    const r = act(s, { type: 'cancelWork' });
    if (r) s = r.state;
  }
  s = claims(manageGear(s));
  s = shop(s);
  // Expeditions: toughest enemy the bot reliably beats.
  for (let guard = 0; guard < 60 && s.expPoints > 0; guard++) {
    const goldBefore = s.gold;
    s = heal(s, 0.55);
    st.foodGold += Math.max(0, goldBefore - s.gold);
    const options = ENEMIES.filter((e) => enemyUnlocked(s, e))
      .map((e) => ({ e, w: winRate(s, expeditionEnemy(e)) }))
      .filter((o) => o.w.rate >= 0.8 && o.w.loss < 0.6);
    // First kills unlock the next opponent; otherwise prefer the best level.
    const pick =
      options.find((o) => !(s.kills[o.e.id] > 0)) ??
      options.sort((a, b) => b.e.level - a.e.level)[0];
    if (!pick) break;
    const r = act(s, { type: 'fight', enemyId: pick.e.id });
    if (!r) break;
    s = r.state;
    st.fights++;
    if (r.battle?.won) st.wins++;
    now += 21_000;
  }
  for (let guard = 0; guard < 30 && s.dungeonPoints > 0; guard++) {
    s = heal(s, 0.6);
    const d = [...DUNGEONS].reverse().find((x) => {
      if (!dungeonUnlocked(s, x.id)) return false;
      const p = dungeonProgress(s, x.id);
      const hard = p.stage === 0 ? p.clears > 2 : p.hard;
      return (
        winRate(s, dungeonEnemy(x.id, p.stage, hard), 24, partyOf(s, now))
          .rate >= 0.75
      );
    });
    if (!d) break;
    const p = dungeonProgress(s, d.id);
    const r = act(s, { type: 'dungeon', dungeonId: d.id, hard: p.clears > 2 });
    if (!r) break;
    s = r.state;
    st.fights++;
    if (r.battle?.won) st.wins++;
    now += 21_000;
  }
  for (let i = 0; i < profile.arenaPerSession; i++) {
    s = heal(s, 0.6);
    const rivals = arenaRivals(s)
      .map((rv) => ({ rv, w: winRate(s, rivalCombatant(rv)) }))
      .filter((o) => o.w.rate >= 0.7)
      .sort((a, b) => b.rv.level - a.rv.level);
    if (rivals[0]) {
      const r = act(s, { type: 'arena', index: rivals[0].rv.index });
      if (r) s = r.state;
    }
    if (i + 1 < profile.arenaPerSession) now += 10 * 60_000 + 1000;
  }
  s = claims(manageGear(s));
  s = spend(s);
  if (last) {
    const job = [...JOBS].reverse().find((j) => s.level >= j.level)!;
    const r = act(s, { type: 'work', jobId: job.id, hours: 8 });
    if (r) s = r.state;
  }
  return s;
}

export function run(profile: Profile, days = 30, seed = 1) {
  random = seeded(seed);
  now = Date.UTC(2026, 8, 1) - 3.5 * 3_600_000;
  let s = newGame(now, seed);
  s = transition(
    s,
    { type: 'createCharacter', gender: 'female', name: 'آزمون' },
    now,
  ).state;
  const rows = [];
  const st: Stats = { fights: 0, wins: 0, foodGold: 0 };
  for (let day = 0; day < days; day++) {
    const dayStart = Date.UTC(2026, 8, 1 + day) - 3.5 * 3_600_000;
    profile.hours.forEach((h, i) => {
      now = Math.max(now, dayStart + h * 3_600_000);
      s = session(s, profile, i === profile.hours.length - 1, st);
    });
    const unlockedRegions = REGIONS.filter((_, i) =>
      ENEMIES.some((e) => e.region === i && enemyUnlocked(s, e)),
    ).length;
    const d = derived(s, now);
    rows.push({
      day: day + 1,
      level: s.level,
      gold: s.gold,
      regions: unlockedRegions,
      bossesBeaten: ENEMIES.filter((e) => e.boss && s.kills[e.id]).length,
      dungeons: DUNGEONS.filter((x) => (s.dungeons[x.id]?.clears ?? 0) > 0)
        .length,
      hard: s.counters.hardClears,
      quests: s.claimed.length,
      honour: s.honour,
      fame: s.fame,
      wins: s.counters.wins,
      fights: st.fights,
      winPct: Math.round((100 * st.wins) / Math.max(1, st.fights)),
      arena: s.counters.arenaWins,
      str: d.totals.strength,
      hp: d.maxHp,
      dmg: `${d.min}-${d.max}`,
      armor: d.armor,
      foodGold: st.foodGold,
      gearValue: SLOTS.reduce(
        (a, sl) => a + (s.equipment[sl] ? itemValue(s.equipment[sl]!) : 0),
        0,
      ),
      upgrades: s.counters.upgrades,
      vsWarrior: fmt(winRate(s, enemyCombatant('x', s.level, 'warrior'), 60)),
      vsBoss: fmt(winRate(s, enemyCombatant('x', s.level, 'boss'), 60)),
    });
    st.fights = 0;
    st.wins = 0;
    st.foodGold = 0;
  }
  return { rows, final: s };
}

// Keep helpers referenced for tree-shaking-free debugging.
void sellPrice;
void smeltDust;
void minFightHp;
