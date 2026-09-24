'use client';

import { useState } from 'react';
import {
  Check,
  Coins,
  Compass,
  Crown,
  Flame,
  Heart,
  LockKeyhole,
  Mountain,
  Shield,
  Skull,
  Swords,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DUNGEONS,
  ENEMIES,
  HARD_LEVEL_BONUS,
  REGIONS,
  fa,
  regionLevel,
} from '@/lib/game/content';
import {
  arenaRivals,
  derived,
  dungeonEnemy,
  dungeonProgress,
  dungeonUnlocked,
  enemyGold,
  enemyUnlocked,
  enemyXp,
  expeditionEnemy,
  highestRegion,
  minFightHp,
  rankTitle,
  rivalCombatant,
  xpScale,
  type Combatant,
  type GameState,
} from '@/lib/game/engine';
import { duration, type ViewProps } from './ui';

function blocker(
  game: GameState,
  now: number,
  points: number,
  cooldown: number,
) {
  const max = derived(game, now).maxHp;
  if (game.work && game.work.until > now) return 'پهلوان سر کار است';
  if (cooldown > now) return `آمادگی تا ${duration(cooldown - now)}`;
  if (points < 1) return 'امتیاز کافی نیست';
  if (game.hp < minFightHp(max)) return 'نیاز به بازیابی سلامتی';
  return null;
}

function Power({ foe }: { foe: Combatant }) {
  return (
    <div className="enemy-power">
      <span>
        <Heart />
        {fa(foe.hp)}
      </span>
      <span>
        <Swords />
        {fa(foe.min)}–{fa(foe.max)}
      </span>
      <span>
        <Shield />
        {fa(foe.armor)}
      </span>
    </div>
  );
}

/* ---------------- Expeditions ---------------- */

export function ExpeditionView({
  game,
  now,
  ready,
  act,
  busy,
}: ViewProps & { busy: boolean }) {
  const [region, setRegion] = useState(() => highestRegion(game));
  const r = REGIONS[region];
  const locked = game.level < regionLevel(region);
  const block = blocker(game, now, game.expPoints, game.cooldowns.expedition);
  const enemies = ENEMIES.filter((e) => e.region === region);
  return (
    <>
      <div className="region-tabs" aria-label="انتخاب سرزمین">
        {REGIONS.map((reg, i) => (
          <Button
            key={reg.name}
            className={region === i ? 'selected' : ''}
            variant="ghost"
            aria-pressed={region === i}
            onClick={() => setRegion(i)}
          >
            {game.level < regionLevel(i) && <LockKeyhole />}
            {reg.name}
            <small>سطح {fa(regionLevel(i))}</small>
          </Button>
        ))}
      </div>
      <div className={'world-scene ' + r.mood}>
        <div className="scene-shade" />
        <div className="scene-content">
          <span className="location-label">
            <Mountain /> سرزمین {fa(region + 1)} از {fa(REGIONS.length)} · از
            سطح {fa(regionLevel(region))}
          </span>
          <h2>{r.name}</h2>
          <p>
            {r.subtitle}
            <br />
            {r.description}
          </p>
          <span className="scene-note">
            <Compass /> {fa(enemies.filter((e) => game.kills[e.id]).length)} از{' '}
            {fa(enemies.length)} حریف شکست خورده
          </span>
        </div>
      </div>
      {locked && (
        <div className="info-note">
          <LockKeyhole /> این سرزمین در سطح {fa(regionLevel(region))} باز می‌شود.
        </div>
      )}
      <div className="section-heading">
        <h2>حریف خود را انتخاب کن</h2>
        <span>
          <Zap /> هر نبرد ۱ امتیاز لشکرکشی
        </span>
      </div>
      <div className="enemy-grid four">
        {enemies.map((enemy) => {
          const unlocked = enemyUnlocked(game, enemy);
          const kills = game.kills[enemy.id] ?? 0;
          const foe = expeditionEnemy(enemy);
          const scale = xpScale(game.level, enemy.level);
          const gold = enemyGold(enemy.level) * (enemy.boss ? 2.2 : 1);
          return (
            <article
              className={
                'enemy-card ' +
                (!unlocked ? 'locked ' : '') +
                (enemy.boss ? 'boss ' : '')
              }
              key={enemy.id}
            >
              <div className={`enemy-art enemy-${enemy.art} mood-${r.mood}`}>
                <span className="level-chip">سطح {fa(enemy.level)}</span>
                {enemy.boss && (
                  <span className="boss-chip">
                    <Crown /> سالار
                  </span>
                )}
                {kills > 0 && (
                  <span
                    className="beaten-chip"
                    title={`${fa(kills)} بار شکست خورده`}
                  >
                    <Check />
                  </span>
                )}
              </div>
              <div className="enemy-details">
                <h3>{enemy.name}</h3>
                <p>{enemy.subtitle}</p>
                <Power foe={foe} />
                <div className="reward-line">
                  <span>
                    <Coins />~{fa(Math.round(gold))}
                  </span>
                  <span className={scale < 1 ? 'dim' : ''}>
                    تجربه ~
                    {fa(
                      Math.round(
                        enemyXp(enemy.level) * (enemy.boss ? 1.8 : 1) * scale,
                      ),
                    )}
                  </span>
                </div>
                <Button
                  className={
                    'battle-button ' +
                    (unlocked && !block ? 'primary-battle' : '')
                  }
                  disabled={!unlocked || !ready || !!block || busy}
                  onClick={() => act({ type: 'fight', enemyId: enemy.id })}
                >
                  {unlocked ? <Swords /> : <LockKeyhole />}
                  {!unlocked
                    ? 'هنوز کشف نشده'
                    : busy
                      ? 'در حال نبرد…'
                      : (block ?? 'حمله')}
                </Button>
                <p className="card-footnote">
                  {unlocked
                    ? kills
                      ? `${fa(kills)} پیروزی`
                      : 'نخستین پیروزی غنیمت حتمی دارد'
                    : locked
                      ? `نیاز به سطح ${fa(regionLevel(region))}`
                      : 'ابتدا حریف قبلی را شکست بده'}
                </p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="expedition-note">
        نبردها خودکارند؛ تجهیزات، تمرین و برکت‌ها نتیجه را تغییر می‌دهند. تجربه از
        حریفان بسیار ضعیف‌تر کم می‌شود.
      </div>
    </>
  );
}

/* ---------------- Dungeons ---------------- */

export function DungeonView({
  game,
  now,
  ready,
  act,
  busy,
}: ViewProps & { busy: boolean }) {
  const open = DUNGEONS.filter((d) => dungeonUnlocked(game, d.id));
  const [id, setId] = useState(() => open.at(-1)?.id ?? DUNGEONS[0].id);
  const [hard, setHard] = useState(false);
  const d = DUNGEONS.find((x) => x.id === id)!;
  const p = dungeonProgress(game, d.id);
  const unlocked = dungeonUnlocked(game, d.id);
  const mode = p.stage > 0 ? p.hard : hard && p.clears > 0;
  const stage = d.stages[p.stage];
  const foe = dungeonEnemy(d.id, p.stage, mode);
  const block = blocker(game, now, game.dungeonPoints, game.cooldowns.dungeon);
  return (
    <>
      <div className="region-tabs" aria-label="انتخاب سیاه‌چال">
        {DUNGEONS.map((x) => (
          <Button
            key={x.id}
            variant="ghost"
            className={x.id === id ? 'selected' : ''}
            aria-pressed={x.id === id}
            onClick={() => setId(x.id)}
          >
            {!dungeonUnlocked(game, x.id) && <LockKeyhole />}
            {x.name}
            <small>سطح {fa(x.level)}</small>
          </Button>
        ))}
      </div>
      <div className={'world-scene dungeon-scene ' + REGIONS[d.region].mood}>
        <div className="scene-shade" />
        <div className="scene-content">
          <span className="location-label">
            <Flame /> سیاه‌چال {REGIONS[d.region].name} · از سطح {fa(d.level)}
          </span>
          <h2>{d.name}</h2>
          <p>{d.description}</p>
          <span className="scene-note">
            <Trophy /> {fa(p.clears)} پاک‌سازی · {fa(p.hardClears)} پاک‌سازی دشوار
            · سالار پایانی غنیمت لاجورد یا بهتر می‌دهد
          </span>
        </div>
      </div>
      <div className="dungeon-trail">
        {d.stages.map((st, i) => (
          <div
            className={p.stage === i ? 'current' : p.stage > i ? 'cleared' : ''}
            key={st.id}
          >
            <span>
              {p.stage > i ? <Check /> : st.boss ? <Skull /> : fa(i + 1)}
            </span>
            <h3>{st.name}</h3>
            <small>
              {st.subtitle} · سطح {fa(st.level + (mode ? HARD_LEVEL_BONUS : 0))}
            </small>
          </div>
        ))}
      </div>
      <div className="panel dungeon-action">
        <div>
          <span className="eyebrow">
            {!unlocked
              ? `از سطح ${fa(d.level)} باز می‌شود`
              : `تالار ${fa(p.stage + 1)} از ${fa(d.stages.length)} · ${mode ? 'دشوار' : 'عادی'}`}
          </span>
          <h2>{stage.name}</h2>
          <Power foe={foe} />
        </div>
        <div className="dungeon-buttons">
          {p.stage === 0 ? (
            <div className="mode-toggle" aria-label="سطح سیاه‌چال">
              <Button
                aria-pressed={!hard}
                variant={!hard ? 'secondary' : 'ghost'}
                onClick={() => setHard(false)}
              >
                عادی
              </Button>
              <Button
                aria-pressed={hard}
                variant={hard ? 'secondary' : 'ghost'}
                disabled={p.clears < 1}
                onClick={() => setHard(true)}
                title={p.clears < 1 ? 'پس از نخستین پاک‌سازی باز می‌شود' : ''}
              >
                دشوار
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              disabled={!ready}
              onClick={() => act({ type: 'dungeonReset', dungeonId: d.id })}
            >
              خروج از سیاه‌چال
            </Button>
          )}
          <Button
            className="primary-battle"
            disabled={!ready || !unlocked || !!block || busy}
            onClick={() =>
              act({ type: 'dungeon', dungeonId: d.id, hard: mode })
            }
          >
            {unlocked ? <Swords /> : <LockKeyhole />}
            {!unlocked
              ? `نیاز به سطح ${fa(d.level)}`
              : busy
                ? 'در حال نبرد…'
                : (block ?? 'ورود به تالار')}
          </Button>
        </div>
      </div>
      <div className="info-note">
        <Zap /> هر تالار ۱ امتیاز سیاه‌چال می‌خواهد (هر ۱۲ دقیقه یک امتیاز). پیروزی
        در سیاه‌چال «نام» می‌دهد؛ سطح دشوار نام و غنیمت بهتر دارد.
      </div>
    </>
  );
}

/* ---------------- Arena ---------------- */

export function ArenaView({
  game,
  now,
  ready,
  act,
  busy,
}: ViewProps & { busy: boolean }) {
  const rivals = arenaRivals(game);
  const cooling = game.cooldowns.arena > now;
  const max = derived(game, now).maxHp;
  const working = !!game.work && game.work.until > now;
  const lowHp = game.hp < minFightHp(max);
  const rank = rankTitle(game.honour);
  return (
    <>
      <div className="panel banner arena-banner">
        <Users />
        <div>
          <span className="eyebrow">میدان پهلوانان</span>
          <h2>کشتی و شمشیرزنی با هماوردان</h2>
          <p>
            هماوردان میدان پهلوانان ساختگی‌اند، نه بازیکنان دیگر. پیروزی آبرو و
            سکه می‌دهد؛ شکست کمی آبرو می‌گیرد. هر ۱۰ دقیقه یک نبرد.
          </p>
        </div>
        <span className="banner-stat">
          <Crown /> {rank.name} · {fa(game.honour)} آبرو
        </span>
      </div>
      {cooling && (
        <p className="info-note">
          نبرد بعدی میدان تا {duration(game.cooldowns.arena - now)}.
        </p>
      )}
      <div className="rival-list">
        {rivals.map((rv) => {
          const foe = rivalCombatant(rv);
          const honour = Math.max(3, 10 + (rv.level - game.level) * 3);
          return (
            <article className="panel rival-row" key={rv.index}>
              <div className="rival-name">
                <Swords />
                <div>
                  <h3>{rv.name}</h3>
                  <small>سطح {fa(rv.level)}</small>
                </div>
              </div>
              <Power foe={foe} />
              <span className="rival-reward">+{fa(honour)} آبرو</span>
              <Button
                className="battle-button"
                disabled={
                  !ready ||
                  game.level < 2 ||
                  cooling ||
                  working ||
                  lowHp ||
                  busy
                }
                onClick={() => act({ type: 'arena', index: rv.index })}
              >
                {game.level < 2
                  ? 'از سطح ۲'
                  : working
                    ? 'سر کار'
                    : lowHp
                      ? 'سلامتی کم'
                      : 'نبرد'}
              </Button>
            </article>
          );
        })}
      </div>
      <p className="info-note">
        {fa(game.counters.arenaWins)} پیروزی و {fa(game.counters.arenaLosses)}{' '}
        شکست در میدان. پس از هر نبرد، هماوردان تازه می‌آیند.
      </p>
    </>
  );
}
