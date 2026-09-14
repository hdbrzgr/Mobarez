'use client';
/* eslint-disable next/no-html-link-for-pages -- Sites sign-in requires a top-level anchor rather than client-side routing. */
/* eslint-disable next/no-img-element -- Character portraits are static local PNGs composited in the client. */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Swords,
  Compass,
  Shield,
  ScrollText,
  Dumbbell,
  ShoppingBag,
  Flame,
  Coins,
  Zap,
  ChevronLeft,
  Mountain,
  Heart,
  CircleHelp,
  LockKeyhole,
  Trophy,
  Backpack,
  Utensils,
  Sparkles,
  Plus,
  Check,
  RefreshCw,
  Clock3,
  BookOpen,
  X,
  Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CharacterCreation } from '@/components/character/CharacterCreation';
import { HeroScreen } from '@/components/character/HeroScreen';
import {
  ENEMIES,
  REGIONS,
  ITEMS,
  QUESTS,
  DUNGEON,
  STAT_NAMES,
  MAX_ENERGY,
  ENERGY_MS,
  INVENTORY_CAP,
  fa,
  type Item,
  type Slot,
  type Stat,
} from '@/lib/game/content';
import {
  derived,
  enemyUnlocked,
  newGame,
  questProgress,
  regenerate,
  returningForAppearance,
  trainCost,
  xpGoal,
  type Action,
  type Battle,
  type GameState,
} from '@/lib/game/engine';

type ApiResponse = {
  state?: GameState;
  revision?: number;
  now?: number;
  error?: string;
  message?: string;
  battle?: Battle;
};
type View =
  | 'expedition'
  | 'hero'
  | 'dungeon'
  | 'quests'
  | 'training'
  | 'market'
  | 'reports';
const menus: { id: View; name: string; icon: typeof Compass }[] = [
  { id: 'expedition', name: 'لشکرکشی', icon: Compass },
  { id: 'hero', name: 'پهلوان', icon: Shield },
  { id: 'dungeon', name: 'سیاه‌چال', icon: Flame },
  { id: 'quests', name: 'مأموریت‌ها', icon: ScrollText },
  { id: 'training', name: 'تمرین‌گاه', icon: Dumbbell },
  { id: 'market', name: 'بازار', icon: ShoppingBag },
  { id: 'reports', name: 'گزارش نبردها', icon: BookOpen },
];
const subtitles: Record<View, string> = {
  expedition: 'قدم به سرزمین افسانه‌ها بگذار. نامت را ماندگار کن.',
  hero: 'هر تیغه، هر زره؛ یک گام به سوی پهلوانی.',
  dungeon: 'سه تالار، یک راز کهن؛ دژ خاموش در انتظار توست.',
  quests: 'راه پهلوانی با کارهای کوچک و شجاعت‌های بزرگ ساخته می‌شود.',
  training: 'شمشیر خوب کافی نیست. پهلوان را تمرین می‌سازد.',
  market: 'توشهٔ راهت را بردار و برای نبرد بعدی آماده شو.',
  reports: 'روایت پیروزی‌ها و درس‌های نبردهای تو.',
};
const rarityNames = { common: 'معمولی', rare: 'کمیاب', epic: 'حماسی' };
const statCopy: Record<Stat, string> = {
  strength: 'هر امتیاز، یک واحد قدرت حملهٔ بیشتر.',
  agility: 'هر امتیاز، ۰٫۸٪ شانس جاخالی بیشتر؛ تا ۳۰٪.',
  vitality: 'هر امتیاز، ۶ واحد سلامتی بیشتر.',
  luck: 'هر امتیاز، ۱٫۲٪ شانس ضربهٔ بحرانی بیشتر؛ تا ۳۵٪.',
};
function ItemIcon({ slot }: { slot: Slot }) {
  return slot === 'weapon' ? (
    <Swords />
  ) : slot === 'armor' ? (
    <Shield />
  ) : (
    <Sparkles />
  );
}
function ItemStats({ item }: { item: Item }) {
  return (
    <div className="item-stats">
      {item.attack > 0 && (
        <span>
          <Swords /> حمله +{fa(item.attack)}
        </span>
      )}
      {item.armor > 0 && (
        <span>
          <Shield /> زره +{fa(item.armor)}
        </span>
      )}
      {item.vitality > 0 && (
        <span>
          <Heart /> سلامتی +{fa(item.vitality)}
        </span>
      )}
    </div>
  );
}
function Meter({
  label,
  value,
  max,
  health = false,
}: {
  label: string;
  value: number;
  max: number;
  health?: boolean;
}) {
  return (
    <>
      <div className="meter-label">
        <span>
          {health && <Heart />}
          {label}
        </span>
        <span>
          {fa(value)} / {fa(max)}
        </span>
      </div>
      <Progress
        value={Math.min(100, (100 * value) / max)}
        className={health ? 'health-meter' : ''}
        aria-label={label}
      />
    </>
  );
}

export default function Home() {
  const [view, setView] = useState<View>('expedition'),
    [region, setRegion] = useState(0),
    [saved, setSaved] = useState<GameState | null>(null),
    [revision, setRevision] = useState(0),
    [now, setNow] = useState(0),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [needsSignIn, setNeedsSignIn] = useState(false),
    [notice, setNotice] = useState(''),
    [report, setReport] = useState<Battle | null>(null),
    [help, setHelp] = useState(false),
    [rename, setRename] = useState(false),
    [name, setName] = useState(''),
    [justCreated, setJustCreated] = useState(false);
  const busyRef = useRef(false),
    latestRevision = useRef(-1),
    clockOffset = useRef(0);
  const accept = useCallback(
    (data: { state?: GameState; revision?: number; now?: number }) => {
      if (
        data.state &&
        data.revision !== undefined &&
        data.revision >= latestRevision.current
      ) {
        latestRevision.current = data.revision;
        setSaved(data.state);
        setRevision(data.revision);
        if (data.now) {
          clockOffset.current = data.now - Date.now();
          setNow(data.now);
        }
      }
    },
    [],
  );
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/game', { cache: 'no-store' });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setNeedsSignIn(res.status === 401);
        throw new Error(data.error);
      }
      setNeedsSignIn(false);
      accept(data);
      setError('');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'ارتباط با بازی برقرار نشد. دوباره تلاش کن.',
      );
    } finally {
      setLoading(false);
    }
  }, [accept]);
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    const tick = setInterval(
      () => setNow(Date.now() + clockOffset.current),
      1000,
    );
    const poll = setInterval(() => {
      if (!busyRef.current && document.visibilityState === 'visible')
        void refresh();
    }, 20000);
    return () => {
      clearTimeout(initial);
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [refresh]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(''), 6500);
    return () => clearTimeout(id);
  }, [notice]);
  const game = regenerate(saved ?? newGame(0), now),
    stats = derived(game),
    ready = !!saved && !loading && !busy,
    playable = ready && game.characterCreated,
    cooldown = Math.max(0, Math.ceil((game.cooldownUntil - now) / 1000)),
    activeRegion = REGIONS[region],
    lockedRegion = game.level < activeRegion.level,
    claimable = QUESTS.filter(
      (q) => !game.claimed.includes(q.id) && questProgress(game, q) >= q.target,
    ).length;
  async function act(action: Action) {
    if (busyRef.current || !saved) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          revision,
          requestId: crypto.randomUUID(),
        }),
      });
      const data = (await res.json()) as ApiResponse;
      accept(data);
      if (!res.ok) {
        if (res.status === 409 && !data.state) await refresh();
        throw new Error(data.error || 'درخواست انجام نشد.');
      }
      setNotice(data.message ?? 'انجام شد.');
      if (data.battle) setReport(data.battle);
      if (action.type === 'rename') setRename(false);
      if (action.type === 'createCharacter') {
        setView('hero');
        setJustCreated(true);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'ارتباط قطع شد. پیش از اقدام دوباره، بازی را تازه کن.',
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const fightLabel = (cost = 1) =>
    busy
      ? 'در حال ثبت…'
      : cooldown
        ? `آمادگی تا ${fa(cooldown)} ثانیه`
        : game.hp < 20
          ? 'نیاز به بازیابی سلامتی'
          : game.energy < cost
            ? 'در انتظار انرژی'
            : 'آغاز نبرد';
  const fightDisabled = (cost = 1) =>
    !playable || cooldown > 0 || game.hp < 20 || game.energy < cost;
  const currentTitle = menus.find((m) => m.id === view)!.name;
  const questTeaser = QUESTS.find((q) => !game.claimed.includes(q.id));
  const setupPending = !loading && !!saved && !game.characterCreated;
  return (
    <div className="game-shell">
      <a className="skip-link" href="#main">
        رفتن به محتوای بازی
      </a>
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="مبارز، صفحهٔ اصلی">
          <Swords />
          <span>
            مبارز<small>افسانه‌ات را زندگی کن</small>
          </span>
        </Link>
        <div className="chapter">
          فصل نخست <span>خیزش یک پهلوان</span>
        </div>
        <nav aria-label="بخش‌های بازی">
          {menus.map((m) => (
            <Button
              key={m.id}
              variant="ghost"
              className={'nav-item ' + (m.id === view ? 'active' : '')}
              disabled={!game.characterCreated}
              onClick={() => setView(m.id)}
              aria-current={m.id === view ? 'page' : undefined}
            >
              <m.icon />
              {m.name}
              {m.id === 'expedition' && (
                <span className="nav-tag">ماجراجویی</span>
              )}
              {m.id === 'quests' && claimable > 0 && (
                <span className="nav-tag">{fa(claimable)}</span>
              )}
            </Button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="status-dot" /> نسخهٔ آزمایشی · جهان پارس
          <Button variant="ghost" onClick={() => setHelp(true)}>
            <CircleHelp /> راهنمای بازی
          </Button>
        </div>
      </aside>
      <div className="game-body">
        <header className="topbar">
          <div className="breadcrumb">
            جهان پارس <ChevronLeft />{' '}
            <b>{setupPending ? 'ساخت پهلوان' : currentTitle}</b>
          </div>
          <div className="resources">
            <span title="سکه‌های شما">
              <Coins /> {saved ? fa(game.gold) : '—'} <small>سکه</small>
            </span>
            <span title="هر دقیقه یک انرژی بازیابی می‌شود">
              <Zap /> {saved ? fa(game.energy) : '—'}{' '}
              <small>/ {fa(MAX_ENERGY)} انرژی</small>
            </span>
            <Button
              className="profile-chip"
              variant="ghost"
              disabled={!game.characterCreated}
              onClick={() => setView('hero')}
            >
              <Shield /> {game.name}
            </Button>
            <Button
              className="help-mobile"
              variant="ghost"
              size="icon"
              aria-label="راهنمای بازی"
              onClick={() => setHelp(true)}
            >
              <CircleHelp />
            </Button>
          </div>
        </header>
        <main className="main-content" id="main" aria-busy={busy || loading}>
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {view === 'expedition'
                  ? 'سفر تو از اینجا آغاز می‌شود'
                  : 'جهان پارس · فصل نخست'}
              </p>
              <h1>{setupPending ? 'پهلوانت را بساز' : currentTitle}</h1>
              <p>
                {setupPending
                  ? 'جنسیت را انتخاب کن؛ این انتخاب فقط ظاهر را می‌سازد.'
                  : subtitles[view]}
              </p>
            </div>
            <span className="season">
              <span className="status-dot" /> ماجراجویی تک‌نفره
            </span>
          </div>
          {loading && (
            <output className="connection-note">
              <RefreshCw className="spinning" /> در حال بازیابی سفر تو…
            </output>
          )}
          {error && (
            <div className="error-note" role="alert">
              <span>{error}</span>
              {needsSignIn && (
                <a
                  className="sign-in-link"
                  href="/signin-with-chatgpt?return_to=%2F"
                  target="_top"
                >
                  ورود به بازی
                </a>
              )}
              <Button
                variant="outline"
                onClick={() => void refresh()}
                disabled={busy}
              >
                <RefreshCw /> تازه‌سازی
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="بستن پیام خطا"
                onClick={() => setError('')}
              >
                <X />
              </Button>
            </div>
          )}
          {notice && (
            <output className="toast-note">
              <Check />
              {notice}
              <Button
                variant="ghost"
                size="icon"
                aria-label="بستن پیام"
                onClick={() => setNotice('')}
              >
                <X />
              </Button>
            </output>
          )}
          {setupPending ? (
            <CharacterCreation
              defaultName={game.name}
              returning={returningForAppearance(game)}
              busy={busy}
              equipment={game.equipment}
              onSubmit={(gender, name) =>
                void act({ type: 'createCharacter', gender, name })
              }
            />
          ) : (
          <div className="adventure-layout">
            <section className="primary-surface">
              {view === 'expedition' && (
                <>
                  <div className="region-tabs" aria-label="انتخاب سرزمین">
                    {REGIONS.map((r, i) => (
                      <Button
                        key={r.name}
                        className={region === i ? 'selected' : ''}
                        variant="ghost"
                        aria-pressed={region === i}
                        onClick={() => setRegion(i)}
                      >
                        {game.level < r.level && <LockKeyhole />}
                        {r.name}
                        {r.level > 1 && <small>سطح {fa(r.level)}</small>}
                      </Button>
                    ))}
                  </div>
                  <div className={'world-scene ' + activeRegion.mood}>
                    <div className="scene-shade" />
                    <div className="scene-content">
                      <span className="location-label">
                        <Mountain /> سرزمین {['نخست', 'دوم', 'سوم'][region]} ·
                        سطح {fa(activeRegion.level)} تا{' '}
                        {fa(activeRegion.level + 2)}
                      </span>
                      <h2>{activeRegion.name}</h2>
                      <p>
                        {activeRegion.subtitle}
                        <br />
                        {activeRegion.description}
                      </p>
                      <span className="scene-note">
                        <Compass />{' '}
                        {fa(
                          ENEMIES.filter(
                            (e) =>
                              e.region === region &&
                              game.defeated.includes(e.id),
                          ).length,
                        )}{' '}
                        از ۳ حریف شکست خورده
                      </span>
                    </div>
                  </div>
                  {lockedRegion && (
                    <div className="info-note">
                      <LockKeyhole /> این سرزمین در سطح {fa(activeRegion.level)}{' '}
                      باز می‌شود. در پارس تجربه جمع کن.
                    </div>
                  )}
                  <div className="section-heading">
                    <h2>حریف خود را انتخاب کن</h2>
                    <span>هر نبرد، یک گام به سوی افسانه</span>
                  </div>
                  <div className="enemy-grid">
                    {ENEMIES.filter((e) => e.region === region).map(
                      (enemy, index) => {
                        const unlocked = enemyUnlocked(game, enemy),
                          beaten = game.defeated.includes(enemy.id);
                        return (
                          <article
                            className={
                              'enemy-card ' + (!unlocked ? 'locked' : '')
                            }
                            key={enemy.id}
                          >
                            <div className={'enemy-art enemy-' + enemy.art}>
                              <span className="level-chip">
                                سطح {fa(enemy.level)}
                              </span>
                              {beaten && (
                                <span className="beaten-chip" title="شکست‌خورده">
                                  <Check />
                                </span>
                              )}
                            </div>
                            <div className="enemy-details">
                              <h3>{enemy.name}</h3>
                              <p>{enemy.subtitle}</p>
                              <div className="enemy-power">
                                <span>
                                  <Heart />
                                  {fa(enemy.hp)}
                                </span>
                                <span>
                                  <Swords />
                                  {fa(enemy.attack)}
                                </span>
                                <span>
                                  <Shield />
                                  {fa(enemy.armor)}
                                </span>
                              </div>
                              <div className="reward-line">
                                <span>
                                  <Coins />
                                  {fa(enemy.gold)}–
                                  {fa(
                                    enemy.gold +
                                      Math.ceil(enemy.gold * 0.3) -
                                      1,
                                  )}
                                </span>
                                <span>تجربه +{fa(enemy.xp)}</span>
                              </div>
                              <Button
                                className={
                                  'battle-button ' +
                                  (index === 0 && unlocked
                                    ? 'primary-battle'
                                    : '')
                                }
                                disabled={!unlocked || fightDisabled()}
                                onClick={() =>
                                  void act({ type: 'fight', enemyId: enemy.id })
                                }
                              >
                                {unlocked ? <Swords /> : <LockKeyhole />}
                                {unlocked ? fightLabel() : 'هنوز کشف نشده'}
                              </Button>
                              <p className="card-footnote">
                                {unlocked ? (
                                  <>
                                    <Zap /> ۱ انرژی · غنیمت احتمالی
                                  </>
                                ) : lockedRegion ? (
                                  `نیاز به سطح ${fa(activeRegion.level)}`
                                ) : (
                                  'ابتدا حریف قبلی را شکست بده'
                                )}
                              </p>
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>
                  <div className="expedition-note">
                    <Clock3 /> نبردها خودکارند؛ تجهیزات و تمرین، نتیجه را تغییر
                    می‌دهند.<span>آمادگی دوباره: ۸ ثانیه</span>
                  </div>
                </>
              )}
              {view === 'hero' && (
                <HeroScreen
                  game={game}
                  ready={playable}
                  justCreated={justCreated}
                  onAct={(action) => void act(action)}
                  onExpedition={() => {
                    setJustCreated(false);
                    setView('expedition');
                  }}
                  onMarket={() => setView('market')}
                  onRename={() => {
                    setName(game.name);
                    setRename(true);
                  }}
                />
              )}
              {view === 'training' && (
                <>
                  <div className="training-banner panel">
                    <Dumbbell />
                    <div>
                      <span className="eyebrow">تمرین‌گاه پهلوانان</span>
                      <h2>توانایی امروز، پیروزی فردا</h2>
                      <p>
                        سکه خرج کن و ویژگی‌های پایه را برای همیشه افزایش بده.
                      </p>
                    </div>
                  </div>
                  <div className="training-grid">
                    {(Object.keys(STAT_NAMES) as Stat[]).map((stat, index) => {
                      const Icon = [Swords, Leaf, Heart, Sparkles][index],
                        cost = trainCost(game, stat);
                      return (
                        <article className="panel training-card" key={stat}>
                          <div className="training-top">
                            <Icon />
                            <span>{STAT_NAMES[stat]}</span>
                            <strong>{fa(game.stats[stat])}</strong>
                          </div>
                          <p>{statCopy[stat]}</p>
                          <Button
                            variant="outline"
                            disabled={!ready || game.gold < cost}
                            onClick={() => void act({ type: 'train', stat })}
                          >
                            <Plus /> تمرین +۱{' '}
                            <span>
                              {fa(cost)} <Coins />
                            </span>
                          </Button>
                        </article>
                      );
                    })}
                  </div>
                  <div className="panel training-outcome">
                    <h3>توانایی فعلی در نبرد</h3>
                    <div>
                      <span>
                        قدرت حمله <b>{fa(stats.attack)}</b>
                      </span>
                      <span>
                        زره <b>{fa(stats.armor)}</b>
                      </span>
                      <span>
                        جاخالی <b>{fa(Math.round(stats.dodge * 1000) / 10)}٪</b>
                      </span>
                      <span>
                        ضربهٔ بحرانی{' '}
                        <b>{fa(Math.round(stats.crit * 1000) / 10)}٪</b>
                      </span>
                    </div>
                  </div>
                  <p className="info-note">
                    با هر افزایش سطح، یک قدرت و یک استقامت نیز به رایگان می‌گیری.
                  </p>
                </>
              )}
              {view === 'market' && (
                <>
                  <div className="panel market-banner">
                    <div className="market-icon">
                      <ShoppingBag />
                    </div>
                    <div>
                      <span className="eyebrow">بازار راه شاهی</span>
                      <h2>ره‌توشهٔ یک ماجراجو</h2>
                      <p>
                        هر خرید به کوله‌پشتی می‌رود؛ تجهیزات را در بخش پهلوان
                        بپوش.
                      </p>
                    </div>
                    <span className="gold">
                      <Coins />
                      {fa(game.gold)}
                    </span>
                  </div>
                  <div className="panel food-card">
                    <Utensils />
                    <div>
                      <h3>خوراک سفر</h3>
                      <p>بازیابی ۶۰ سلامتی · موجودی: {fa(game.food)}</p>
                    </div>
                    <Button
                      disabled={!ready || game.gold < 20 || game.food >= 99}
                      onClick={() => void act({ type: 'buy', itemId: 'food' })}
                    >
                      خرید · ۲۰ <Coins />
                    </Button>
                  </div>
                  <div className="section-heading">
                    <h2>سلاح، زره و نشان</h2>
                    <span>قیمت‌ها ثابت‌اند</span>
                  </div>
                  <div className="item-grid">
                    {ITEMS.map((item) => (
                      <article
                        className={'item-card ' + item.rarity}
                        key={item.id}
                      >
                        <div className="item-card-top">
                          <div className="item-symbol">
                            <ItemIcon slot={item.slot} />
                          </div>
                          <span className="rarity">
                            {rarityNames[item.rarity]}
                          </span>
                        </div>
                        <h3>{item.name}</h3>
                        <ItemStats item={item} />
                        <Button
                          className="buy-button"
                          variant="outline"
                          disabled={
                            !ready ||
                            game.gold < item.price ||
                            game.inventory.length >= INVENTORY_CAP
                          }
                          onClick={() =>
                            void act({ type: 'buy', itemId: item.id })
                          }
                        >
                          خرید{' '}
                          <span>
                            {fa(item.price)} <Coins />
                          </span>
                        </Button>
                      </article>
                    ))}
                  </div>
                </>
              )}
              {view === 'quests' && (
                <>
                  <div className="panel quest-intro">
                    <ScrollText />
                    <div>
                      <h2>روایت پهلوانی تو</h2>
                      <p>
                        مأموریت‌ها از آغاز فعال‌اند. پس از تکمیل، پاداش را دریافت
                        کن.
                      </p>
                    </div>
                    <span>
                      {fa(game.claimed.length)} / {fa(QUESTS.length)}
                    </span>
                  </div>
                  <div className="quests-list">
                    {QUESTS.map((q) => {
                      const progress = Math.min(
                          q.target,
                          questProgress(game, q),
                        ),
                        claimed = game.claimed.includes(q.id),
                        complete = progress >= q.target;
                      return (
                        <article
                          className={
                            'panel quest-row ' + (claimed ? 'claimed' : '')
                          }
                          key={q.id}
                        >
                          <div className="quest-row-heading">
                            <div className="quest-seal">
                              {claimed ? (
                                <Check />
                              ) : complete ? (
                                <Trophy />
                              ) : (
                                <ScrollText />
                              )}
                            </div>
                            <div>
                              <h3>{q.name}</h3>
                              <p>{q.description}</p>
                            </div>
                            <span className="quest-status">
                              {claimed
                                ? 'دریافت‌شده'
                                : complete
                                  ? 'آمادهٔ دریافت'
                                  : 'در حال انجام'}
                            </span>
                          </div>
                          <div className="quest-progress">
                            <Progress
                              value={(progress / q.target) * 100}
                              aria-label={`پیشرفت ${q.name}`}
                            />
                            <span>
                              {fa(progress)} / {fa(q.target)}
                            </span>
                          </div>
                          <div className="quest-row-bottom">
                            <span>
                              <Coins />
                              {fa(q.gold)} سکه <Sparkles />
                              {fa(q.xp)} تجربه
                            </span>
                            <Button
                              variant={
                                complete && !claimed ? 'default' : 'outline'
                              }
                              disabled={!ready || !complete || claimed}
                              onClick={() =>
                                void act({ type: 'claim', questId: q.id })
                              }
                            >
                              {claimed ? (
                                <>
                                  <Check /> دریافت شد
                                </>
                              ) : complete ? (
                                'دریافت پاداش'
                              ) : (
                                'در انتظار تکمیل'
                              )}
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
              {view === 'dungeon' && (
                <>
                  <div className="world-scene dungeon-scene">
                    <div className="scene-shade" />
                    <div className="scene-content">
                      <span className="location-label">
                        <Flame /> سیاه‌چال نخست · از سطح ۳
                      </span>
                      <h2>دژ خاموش</h2>
                      <p>
                        در تالارهای متروک دژ، سایه‌ای کهن بیدار شده است.
                        <br />
                        سه نگهبان را شکست بده و نشان سیمرغ را به دست بیاور.
                      </p>
                      <span className="scene-note">
                        <Trophy /> پاداش پایانی: نشان حماسی سیمرغ
                      </span>
                    </div>
                  </div>
                  <div className="dungeon-trail">
                    {DUNGEON.map((e, i) => (
                      <div
                        className={
                          game.dungeonStage === i
                            ? 'current'
                            : game.dungeonStage > i
                              ? 'cleared'
                              : ''
                        }
                        key={e.id}
                      >
                        <span>
                          {game.dungeonStage > i ? <Check /> : fa(i + 1)}
                        </span>
                        <h3>{e.name}</h3>
                        <small>{e.subtitle}</small>
                      </div>
                    ))}
                  </div>
                  <div className="panel dungeon-action">
                    <div>
                      <span className="eyebrow">
                        {game.level < 3
                          ? 'این مسیر هنوز باز نشده'
                          : `تالار ${fa(game.dungeonStage + 1)} از ۳`}
                      </span>
                      <h2>{DUNGEON[game.dungeonStage].name}</h2>
                      <p>
                        <Heart /> {fa(DUNGEON[game.dungeonStage].hp)} سلامتی{' '}
                        <Swords /> {fa(DUNGEON[game.dungeonStage].attack)} حمله
                      </p>
                    </div>
                    <Button
                      className="primary-battle"
                      disabled={game.level < 3 || fightDisabled(2)}
                      onClick={() => void act({ type: 'dungeon' })}
                    >
                      {game.level < 3 ? <LockKeyhole /> : <Swords />}
                      {game.level < 3 ? 'نیاز به سطح ۳' : fightLabel(2)}
                    </Button>
                  </div>
                  <div className="info-note">
                    <Zap /> هر تالار ۲ انرژی می‌خواهد. پیشرفت تالارها با خروج یا
                    شکست حفظ می‌شود.
                  </div>
                  <div className="panel dungeon-prize">
                    <Sparkles />
                    <div>
                      <h3>نشان سیمرغ</h3>
                      <p>۵ حمله · ۴ زره · ۳۰ سلامتی اضافه</p>
                      <small>
                        با پایان تالار سوم، نشان به کوله‌پشتی اضافه می‌شود و دژ از
                        نو آغاز می‌شود.
                      </small>
                    </div>
                  </div>
                </>
              )}
              {view === 'reports' && (
                <>
                  {game.history.length === 0 ? (
                    <div className="empty-state panel">
                      <BookOpen />
                      <h2>نخستین روایت هنوز نوشته نشده</h2>
                      <p>یک لشکرکشی آغاز کن تا گزارش نبرد اینجا ثبت شود.</p>
                      <Button onClick={() => setView('expedition')}>
                        <Compass /> شروع ماجراجویی
                      </Button>
                    </div>
                  ) : (
                    <div className="report-list">
                      {game.history.map((b) => (
                        <Button
                          variant="ghost"
                          className="report-row"
                          key={b.id}
                          onClick={() => setReport(b)}
                        >
                          <span
                            className={
                              'report-symbol ' + (b.won ? 'win' : 'loss')
                            }
                          >
                            {b.won ? <Trophy /> : <Shield />}
                          </span>
                          <span className="report-name">
                            <b>{b.enemy}</b>
                            <small>
                              {b.dungeon ? 'سیاه‌چال' : 'لشکرکشی'} ·{' '}
                              {new Date(b.at).toLocaleString('fa-IR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </small>
                          </span>
                          <span className={b.won ? 'gold' : 'loss-text'}>
                            {b.won ? 'پیروزی' : 'شکست'}
                          </span>
                          <span className="report-gold">
                            +{fa(b.gold)} <Coins />
                          </span>
                          <ChevronLeft />
                        </Button>
                      ))}
                    </div>
                  )}
                  <p className="info-note">
                    ۲۰ نبرد اخیر در دفتر سفر نگه داشته می‌شود. پاداش هر نبرد همان
                    لحظه ثبت شده است.
                  </p>
                </>
              )}
            </section>
            <aside className="player-column">
              <div className="panel player-panel">
                <div className="player-emblem">
                  {game.appearance.gender ? (
                    <img
                      src={`/art/character/${game.appearance.gender}-portrait.png`}
                      alt=""
                    />
                  ) : (
                    <Shield />
                  )}
                </div>
                <h2>{game.name}</h2>
                <p>
                  {game.level < 3
                    ? 'مسافر سرزمین پارس'
                    : game.level < 5
                      ? 'نگهبان راه شاهی'
                      : 'پهلوان سرزمین ایران'}
                </p>
                <span className="rank">
                  سطح {fa(game.level)} ·{' '}
                  {game.level < 3
                    ? 'نوآموز'
                    : game.level < 5
                      ? 'جنگاور'
                      : 'پهلوان'}
                </span>
                <Meter label="سلامتی" value={game.hp} max={stats.maxHp} health />
                <Meter label="تجربه" value={game.xp} max={xpGoal(game.level)} />
                <div className="stat-pair">
                  <span>
                    <Swords /> قدرت حمله <b>{fa(stats.attack)}</b>
                  </span>
                  <span>
                    <Shield /> زره <b>{fa(stats.armor)}</b>
                  </span>
                </div>
                <Button
                  className="heal-button"
                  variant="outline"
                  disabled={!playable || game.hp >= stats.maxHp || game.food < 1}
                  onClick={() => void act({ type: 'heal' })}
                >
                  <Utensils /> خوردن خوراک <span>{fa(game.food)}</span>
                </Button>
                <small className="regen-note">
                  {game.hp < stats.maxHp
                    ? 'هر ۳۰ ثانیه، ۶ سلامتی بازیابی می‌شود.'
                    : 'سلامتی کامل؛ آمادهٔ ماجراجویی'}
                </small>
              </div>
              <div className="panel energy-panel">
                <div>
                  <Zap />
                  <span>انرژی ماجراجویی</span>
                  <b>{fa(game.energy)} / ۱۲</b>
                </div>
                <Progress
                  value={(game.energy / MAX_ENERGY) * 100}
                  aria-label="انرژی"
                />
                <small>
                  {game.energy < MAX_ENERGY
                    ? `انرژی بعدی تا ${fa(Math.max(0, Math.ceil((game.energyAt + ENERGY_MS - now) / 1000)))} ثانیه`
                    : 'انرژی کامل است. وقت سفر رسیده!'}
                </small>
              </div>
              {questTeaser ? (
                <div className="panel quest-teaser">
                  <span className="eyebrow">
                    <ScrollText /> مأموریت پیش رو
                  </span>
                  <h3>{questTeaser.name}</h3>
                  <p>{questTeaser.description}</p>
                  <Progress
                    value={Math.min(
                      100,
                      (questProgress(game, questTeaser) / questTeaser.target) *
                        100,
                    )}
                    aria-label="پیشرفت مأموریت"
                  />
                  <div className="reward-line">
                    <span>
                      {fa(
                        Math.min(
                          questTeaser.target,
                          questProgress(game, questTeaser),
                        ),
                      )}{' '}
                      از {fa(questTeaser.target)}
                    </span>
                    <span className="gold">{fa(questTeaser.gold)} سکه</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="quest-link"
                    onClick={() => setView('quests')}
                  >
                    دیدن مأموریت‌ها <ChevronLeft />
                  </Button>
                </div>
              ) : (
                <div className="panel quest-teaser">
                  <Trophy />
                  <h3>همهٔ مأموریت‌ها انجام شد!</h3>
                  <p>دژ را دوباره فتح کن و تجهیزاتت را کامل کن.</p>
                </div>
              )}
              <p className="side-tip">
                <Flame /> هر افسانه با نخستین قدم آغاز می‌شود.
              </p>
            </aside>
          </div>
          )}
          <footer>
            مبارز <span>داستانی تازه در سرزمین افسانه‌های ایران</span>
            <span>
              {saved ? 'پیشرفت به‌صورت خودکار ذخیره می‌شود' : 'نسخهٔ نخست · PvE'}
            </span>
          </footer>
        </main>
      </div>
      <Dialog
        open={!!report}
        onOpenChange={(open) => {
          if (!open) setReport(null);
        }}
      >
        <DialogContent className="battle-dialog" dir="rtl">
          {report && (
            <>
              <div
                className={
                  'battle-result ' + (report.won ? 'victory' : 'defeat')
                }
              >
                {report.won ? <Trophy /> : <Shield />}
                <span>
                  {report.dungeon ? 'گزارش سیاه‌چال' : 'گزارش لشکرکشی'}
                </span>
                <DialogTitle>
                  {report.won
                    ? 'پیروزی از آن توست!'
                    : 'این نبرد پایان راه نیست'}
                </DialogTitle>
                <DialogDescription>
                  نبرد با {report.enemy} · {fa(report.rounds.length)} دور
                </DialogDescription>
              </div>
              <div className="battle-rewards">
                <span>
                  <Coins />
                  <b>+{fa(report.gold)}</b> سکه
                </span>
                <span>
                  <Sparkles />
                  <b>+{fa(report.xp)}</b> تجربه
                </span>
                <span>
                  <Heart />
                  <b>{fa(report.rounds.at(-1)?.playerHp ?? 0)}</b> سلامتی پایان
                  نبرد
                </span>
              </div>
              {report.loot && (
                <div className="loot-reward">
                  <Backpack />
                  <div>
                    <small>غنیمت به کوله‌پشتی اضافه شد</small>
                    <b>{ITEMS.find((i) => i.id === report.loot)?.name}</b>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReport(null);
                      setView('hero');
                    }}
                  >
                    دیدن غنیمت
                  </Button>
                </div>
              )}
              <details className="combat-log">
                <summary>
                  روایت دور به دور نبرد <ChevronLeft />
                </summary>
                <ol>
                  {report.rounds.map((r) => (
                    <li key={r.round}>
                      <span>دور {fa(r.round)}</span>
                      <p>
                        {r.critical ? 'ضربهٔ بحرانی! ' : ''}
                        {fa(r.dealt)} آسیب وارد کردی.{' '}
                        {r.enemyHp === 0
                          ? 'حریف از پا درآمد.'
                          : r.dodged
                            ? 'از ضربهٔ حریف جاخالی دادی.'
                            : `${fa(r.taken)} آسیب دریافت کردی.`}
                      </p>
                    </li>
                  ))}
                </ol>
              </details>
              <p className="battle-note">
                {report.won
                  ? 'پاداش‌ها ثبت شدند. برای نبرد بعدی آماده شو.'
                  : 'سلامتی بازیابی کن، تمرین بده و تجهیزات قوی‌تر بپوش.'}
              </p>
              <Button onClick={() => setReport(null)}>
                ادامهٔ ماجراجویی <ChevronLeft />
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="help-dialog" dir="rtl">
          <DialogTitle>راهنمای مبارز</DialogTitle>
          <DialogDescription>
            یک ماجراجویی کوتاه در ایران اسطوره‌ای
          </DialogDescription>
          <ol className="help-steps">
            <li>
              <b>۱. پهلوانت را بساز</b>
              <p>
                جنسیت را انتخاب کن و نام بگذار. زن و مرد توانایی یکسان دارند؛ این
                انتخاب فقط ظاهر را می‌سازد.
              </p>
            </li>
            <li>
              <b>۲. لشکرکشی کن</b>
              <p>
                از گرگ خاکستری شروع کن. پیروزی، حریف بعدی را باز می‌کند و سکه،
                تجربه و گاهی غنیمت می‌دهد.
              </p>
            </li>
            <li>
              <b>۳. قوی‌تر شو</b>
              <p>
                در تمرین‌گاه ویژگی‌ها را افزایش بده. تجهیزات بازار و غنیمت‌ها را در
                بخش پهلوان بپوش؛ پوشاک فقط ظاهر را تغییر می‌دهد.
              </p>
            </li>
            <li>
              <b>۴. توشه بردار</b>
              <p>
                هر دقیقه یک انرژی و هر ۳۰ ثانیه شش سلامتی برمی‌گردد. خوراک سفر، تا
                ۶۰ سلامتی بازیابی می‌کند.
              </p>
            </li>
            <li>
              <b>۵. پاداش بگیر و دژ را فتح کن</b>
              <p>
                پاداش مأموریت‌ها را دستی دریافت کن. سیاه‌چال سه‌مرحله‌ای و هیرکانی
                در سطح ۳ و البرز در سطح ۵ باز می‌شوند.
              </p>
            </li>
          </ol>
          <p className="info-note">
            این نسخه تک‌نفره و الهام‌گرفته از اسطوره‌های ایران است. پیشرفت روی حساب
            شما ذخیره می‌شود. در کوله‌پشتی پر، غنیمت تازه به ۴۰٪ ارزش فروشگاهی
            تبدیل می‌شود.
          </p>
          <Button onClick={() => setHelp(false)}>
            آماده‌ام؛ به سوی ماجراجویی
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={rename} onOpenChange={setRename}>
        <DialogContent dir="rtl">
          <DialogTitle>نامت را در داستان ثبت کن</DialogTitle>
          <DialogDescription>
            نام پهلوان بین ۲ تا ۲۴ نویسه باشد.
          </DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void act({ type: 'rename', name });
            }}
          >
            <label htmlFor="hero-name">نام پهلوان</label>
            <Input
              id="hero-name"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={24}
              required
            />
            <Button
              className="rename-submit"
              type="submit"
              disabled={busy || name.trim().length < 2}
            >
              ثبت نام
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
