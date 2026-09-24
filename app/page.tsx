'use client';
/* eslint-disable next/no-html-link-for-pages -- Sites sign-in requires a top-level anchor rather than client-side routing. */
/* eslint-disable next/no-img-element -- Character portraits are static local PNGs. */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Anvil,
  BookOpen,
  Briefcase,
  Check,
  ChevronLeft,
  CircleHelp,
  Coins,
  Compass,
  Crown,
  Dumbbell,
  Flame,
  Hourglass,
  Landmark,
  Package,
  RefreshCw,
  ScrollText,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Utensils,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { CharacterCreation } from '@/components/character/CharacterCreation';
import { BoardView } from '@/components/game/BoardView';
import { OverviewView } from '@/components/game/OverviewView';
import {
  ForgeView,
  MarketView,
  PackagesView,
  TempleView,
  TrainingView,
  WorkView,
} from '@/components/game/TownViews';
import {
  ArenaView,
  DungeonView,
  ExpeditionView,
} from '@/components/game/CountryViews';
import {
  BattleSummary,
  QuestsView,
  ReportsView,
  TitlesView,
} from '@/components/game/LedgerViews';
import {
  Meter,
  duration,
  type View,
  type ViewProps,
} from '@/components/game/ui';
import {
  BLESSINGS,
  DUNGEON_MAX,
  DUNGEON_MS,
  EXPEDITION_MAX,
  EXPEDITION_MS,
  FOODS,
  JOBS,
  QUESTS,
  fa,
} from '@/lib/game/content';
import {
  activeTitle,
  dailyMissions,
  derived,
  newGame,
  questProgress,
  regenerate,
  returningForAppearance,
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
type Menu = { id: View; name: string; icon: typeof Compass };
const GROUPS: { name: string; items: Menu[] }[] = [
  {
    name: 'شهر',
    items: [
      { id: 'overview', name: 'پهلوان', icon: Shield },
      { id: 'packages', name: 'بسته‌ها', icon: Package },
      { id: 'market', name: 'بازار', icon: ShoppingBag },
      { id: 'forge', name: 'آهنگری', icon: Anvil },
      { id: 'training', name: 'زورخانه', icon: Dumbbell },
      { id: 'temple', name: 'معبد', icon: Landmark },
      { id: 'work', name: 'کار', icon: Briefcase },
    ],
  },
  {
    name: 'کشور',
    items: [
      { id: 'expedition', name: 'لشکرکشی', icon: Compass },
      { id: 'dungeon', name: 'سیاه‌چال', icon: Flame },
      { id: 'arena', name: 'میدان', icon: Users },
    ],
  },
  {
    name: 'دفتر',
    items: [
      { id: 'quests', name: 'مأموریت‌ها', icon: ScrollText },
      { id: 'titles', name: 'لقب و کارنامه', icon: Crown },
      { id: 'board', name: 'رده‌بندی', icon: Trophy },
      { id: 'reports', name: 'گزارش نبردها', icon: BookOpen },
    ],
  },
];
const MENUS = GROUPS.flatMap((g) => g.items);
const subtitles: Record<View, string> = {
  overview: 'هر تیغه، هر زره؛ یک گام به سوی پهلوانی.',
  packages: 'غنیمت‌هایت در چاپارخانه چشم‌به‌راه‌اند.',
  market: 'توشهٔ راهت را بردار و برای نبرد بعدی آماده شو.',
  forge: 'آهن سرد را آتش، پهلوان می‌کند.',
  training: 'شمشیر خوب کافی نیست. پهلوان را تمرین می‌سازد.',
  temple: 'هر روز، آزمونی تازه و برکتی تازه.',
  work: 'بازوی پهلوان در روزهای آرام هم بیکار نمی‌ماند.',
  expedition: 'قدم به سرزمین افسانه‌ها بگذار. نامت را ماندگار کن.',
  dungeon: 'تالارهای تاریک، سالاران کهن و گنج‌های فراموش‌شده.',
  arena: 'آبروی پهلوان در میدان ساخته می‌شود.',
  quests: 'راه پهلوانی از دشت پارس تا کوه قاف.',
  titles: 'نام و لقب، یادگار کارهای بزرگ.',
  reports: 'روایت پیروزی‌ها و درس‌های نبردهای تو.',
  board: 'نام‌آوران این جهان.',
};
const groupOf = (v: View) =>
  GROUPS.find((g) => g.items.some((m) => m.id === v))!.name;

export default function Home() {
  const [view, setView] = useState<View>('expedition'),
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
    }, 30000);
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

  const game = regenerate(saved ?? newGame(0, 1), now || 0),
    stats = derived(game, now),
    ready = !!saved && !loading && !busy,
    playable = ready && game.characterCreated;
  const claimable =
    QUESTS.filter(
      (q) => !game.claimed.includes(q.id) && questProgress(game, q) >= q.target,
    ).length +
    (saved
      ? dailyMissions(game).filter((m) => !m.claimed && m.progress >= m.target)
          .length
      : 0);

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
        setView('overview');
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
  const go = (v: View) => {
    setJustCreated(false);
    setView(v);
    window.scrollTo?.({ top: 0 });
  };
  const props: ViewProps = {
    game,
    now,
    ready: playable,
    act: (a) => void act(a),
    go,
  };
  const current = MENUS.find((m) => m.id === view)!;
  const setupPending = !loading && !!saved && !game.characterCreated;
  const title = activeTitle(game);
  const nextQuest = QUESTS.find((q) => !game.claimed.includes(q.id));
  const work = game.work && game.work.until > now ? game.work : null;
  const blessings = BLESSINGS.filter((b) => (game.blessings[b.id] ?? 0) > now);

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
        <nav aria-label="بخش‌های بازی">
          {GROUPS.map((g) => (
            <div className="nav-group" key={g.name}>
              <span className="nav-group-name">{g.name}</span>
              {g.items.map((m) => (
                <Button
                  key={m.id}
                  variant="ghost"
                  className={'nav-item ' + (m.id === view ? 'active' : '')}
                  disabled={!game.characterCreated}
                  onClick={() => go(m.id)}
                  aria-current={m.id === view ? 'page' : undefined}
                >
                  <m.icon />
                  {m.name}
                  {m.id === 'packages' && game.packages.length > 0 && (
                    <span className="nav-tag">{fa(game.packages.length)}</span>
                  )}
                  {m.id === 'quests' && claimable > 0 && (
                    <span className="nav-tag hot">{fa(claimable)}</span>
                  )}
                  {m.id === 'work' && work && (
                    <span className="nav-tag">
                      <Hourglass />
                    </span>
                  )}
                  {m.id === 'arena' &&
                    game.level >= 2 &&
                    game.cooldowns.arena <= now && (
                      <span className="nav-tag">آماده</span>
                    )}
                </Button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="status-dot" /> جهان ایران · تک‌نفره
          <Button variant="ghost" onClick={() => setHelp(true)}>
            <CircleHelp /> راهنمای بازی
          </Button>
        </div>
      </aside>
      <div className="game-body">
        <header className="topbar">
          <div className="breadcrumb">
            {groupOf(view)} <ChevronLeft />{' '}
            <b>{setupPending ? 'ساخت پهلوان' : current.name}</b>
          </div>
          <div className="resources">
            <span title="سکه">
              <Coins /> {saved ? fa(game.gold) : '—'} <small>سکه</small>
            </span>
            <span title="غبار گوهر برای آهنگری" className="dust">
              <Sparkles /> {saved ? fa(game.dust) : '—'} <small>غبار</small>
            </span>
            <span title="امتیاز لشکرکشی؛ هر ۶ دقیقه یکی" className="points">
              <Zap /> {saved ? fa(game.expPoints) : '—'}
              <small>/ {fa(EXPEDITION_MAX)}</small>
            </span>
            <span
              title="امتیاز سیاه‌چال؛ هر ۱۲ دقیقه یکی"
              className="points dungeon"
            >
              <Flame /> {saved ? fa(game.dungeonPoints) : '—'}
              <small>/ {fa(DUNGEON_MAX)}</small>
            </span>
            <span title="آبرو" className="honour">
              <Crown /> {saved ? fa(game.honour) : '—'}
            </span>
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
              <p className="eyebrow">{groupOf(view)} · جهان ایران</p>
              <h1>{setupPending ? 'پهلوانت را بساز' : current.name}</h1>
              <p>
                {setupPending
                  ? 'جنسیت را انتخاب کن؛ این انتخاب فقط ظاهر را می‌سازد.'
                  : subtitles[view]}
              </p>
            </div>
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
                {view === 'overview' && (
                  <OverviewView
                    {...props}
                    justCreated={justCreated}
                    onRename={() => {
                      setName(game.name);
                      setRename(true);
                    }}
                  />
                )}
                {view === 'packages' && <PackagesView {...props} />}
                {view === 'market' && <MarketView {...props} />}
                {view === 'forge' && <ForgeView {...props} />}
                {view === 'training' && <TrainingView {...props} />}
                {view === 'temple' && <TempleView {...props} />}
                {view === 'work' && <WorkView {...props} />}
                {view === 'expedition' && (
                  <ExpeditionView {...props} busy={busy} />
                )}
                {view === 'dungeon' && <DungeonView {...props} busy={busy} />}
                {view === 'arena' && <ArenaView {...props} busy={busy} />}
                {view === 'quests' && <QuestsView {...props} />}
                {view === 'titles' && <TitlesView {...props} />}
                {view === 'board' && <BoardView {...props} />}
                {view === 'reports' && (
                  <ReportsView {...props} onOpen={setReport} />
                )}
              </section>
              <aside className="player-column">
                <div className="panel player-panel">
                  <button
                    type="button"
                    className="player-emblem"
                    onClick={() => go('overview')}
                    aria-label="پهلوان"
                  >
                    {game.appearance.gender ? (
                      <img
                        src={`/art/character/${game.appearance.gender}-portrait.png`}
                        alt=""
                      />
                    ) : (
                      <Shield />
                    )}
                  </button>
                  <h2>{game.name}</h2>
                  <p>{title.name}</p>
                  <span className="rank">سطح {fa(game.level)}</span>
                  <Meter
                    label="سلامتی"
                    value={game.hp}
                    max={stats.maxHp}
                    tone="health"
                  />
                  <Meter
                    label="تجربه"
                    value={game.xp}
                    max={xpGoal(game.level)}
                    tone="xp"
                  />
                  <div className="food-quick" aria-label="خوردن خوراک">
                    {FOODS.map((f) => (
                      <Button
                        key={f.id}
                        variant="outline"
                        title={`${f.name} · ${fa(f.heal * 100)}٪ سلامتی`}
                        disabled={
                          !playable ||
                          game.food[f.id] < 1 ||
                          game.hp >= stats.maxHp
                        }
                        onClick={() => void act({ type: 'eat', foodId: f.id })}
                      >
                        <Utensils /> {f.name}
                        <span>{fa(game.food[f.id])}</span>
                      </Button>
                    ))}
                  </div>
                  <small className="regen-note">
                    {game.hp < stats.maxHp
                      ? `بازیابی ${fa(Math.round(stats.regen))} سلامتی در دقیقه`
                      : 'سلامتی کامل؛ آمادهٔ ماجراجویی'}
                  </small>
                </div>
                <div className="panel energy-panel">
                  <Meter
                    label="امتیاز لشکرکشی"
                    value={game.expPoints}
                    max={EXPEDITION_MAX}
                    tone="points"
                  />
                  <small>
                    {game.expPoints < EXPEDITION_MAX
                      ? `امتیاز بعدی تا ${duration(game.expAt + EXPEDITION_MS - now)}`
                      : 'امتیاز کامل است.'}
                  </small>
                  <Meter
                    label="امتیاز سیاه‌چال"
                    value={game.dungeonPoints}
                    max={DUNGEON_MAX}
                    tone="points"
                  />
                  <small>
                    {game.dungeonPoints < DUNGEON_MAX
                      ? `امتیاز بعدی تا ${duration(game.dungeonAt + DUNGEON_MS - now)}`
                      : 'امتیاز کامل است.'}
                  </small>
                  <small>
                    میدان:{' '}
                    {game.cooldowns.arena > now
                      ? duration(game.cooldowns.arena - now)
                      : 'آماده'}
                  </small>
                </div>
                {(work || blessings.length > 0) && (
                  <div className="panel status-panel">
                    {work && (
                      <button type="button" onClick={() => go('work')}>
                        <Briefcase />{' '}
                        {JOBS.find((j) => j.id === work.jobId)?.name} ·{' '}
                        {duration(work.until - now)}
                      </button>
                    )}
                    {blessings.map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => go('temple')}
                      >
                        <Sparkles /> {b.name} ·{' '}
                        {duration((game.blessings[b.id] ?? 0) - now)}
                      </button>
                    ))}
                  </div>
                )}
                {nextQuest ? (
                  <div className="panel quest-teaser">
                    <span className="eyebrow">
                      <ScrollText /> مأموریت پیش رو
                    </span>
                    <h3>{nextQuest.name}</h3>
                    <p>{nextQuest.description}</p>
                    <div className="reward-line">
                      <span>
                        {fa(
                          Math.min(
                            nextQuest.target,
                            questProgress(game, nextQuest),
                          ),
                        )}{' '}
                        از {fa(nextQuest.target)}
                      </span>
                      <span className="gold">{fa(nextQuest.gold)} سکه</span>
                    </div>
                    <Button
                      variant="ghost"
                      className="quest-link"
                      onClick={() => go('quests')}
                    >
                      دیدن مأموریت‌ها <ChevronLeft />
                    </Button>
                  </div>
                ) : (
                  <div className="panel quest-teaser">
                    <Trophy />
                    <h3>همهٔ مأموریت‌های داستان انجام شد!</h3>
                    <p>
                      در معبد مأموریت روزانه بگیر و سیاه‌چال‌های دشوار را فتح کن.
                    </p>
                  </div>
                )}
              </aside>
            </div>
          )}
          <footer>
            مبارز <span>داستانی تازه در سرزمین افسانه‌های ایران</span>
            <span>
              {saved ? 'پیشرفت به‌صورت خودکار ذخیره می‌شود' : 'نسخهٔ دوم · PvE'}
            </span>
          </footer>
        </main>
      </div>
      <Dialog open={!!report} onOpenChange={(open) => !open && setReport(null)}>
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
                  {report.kind === 'dungeon'
                    ? 'گزارش سیاه‌چال'
                    : report.kind === 'arena'
                      ? 'گزارش میدان'
                      : 'گزارش لشکرکشی'}
                </span>
                <DialogTitle>
                  {report.won
                    ? 'پیروزی از آن توست!'
                    : 'این نبرد پایان راه نیست'}
                </DialogTitle>
                <DialogDescription>
                  نبرد با {report.enemy} (سطح {fa(report.enemyLevel ?? 0)}) ·{' '}
                  {fa(report.rounds.length)} دور
                </DialogDescription>
              </div>
              {report.enemyMaxHp > 0 && (
                <div className="duel-bars">
                  <Meter
                    label="تو"
                    value={report.rounds.at(-1)?.playerHp ?? 0}
                    max={report.playerMaxHp}
                    tone="health"
                  />
                  <Meter
                    label={report.enemy}
                    value={report.rounds.at(-1)?.enemyHp ?? 0}
                    max={report.enemyMaxHp}
                  />
                </div>
              )}
              <BattleSummary report={report} />
              <div className="item-actions">
                {report.loot && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReport(null);
                      go('packages');
                    }}
                  >
                    <Package /> بسته‌ها
                  </Button>
                )}
                <Button onClick={() => setReport(null)}>
                  ادامه <ChevronLeft />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="help-dialog" dir="rtl">
          <DialogTitle>راهنمای مبارز</DialogTitle>
          <DialogDescription>
            یک بازی نقش‌آفرینی مرورگری در ایران اسطوره‌ای
          </DialogDescription>
          <ol className="help-steps">
            <li>
              <b>۱. کشور: لشکرکشی، سیاه‌چال و میدان</b>
              <p>
                لشکرکشی هر بار ۱ امتیاز می‌خواهد (۲۴ امتیاز، هر ۶ دقیقه یکی).
                سیاه‌چال امتیاز جدا دارد (۱۲ امتیاز، هر ۱۲ دقیقه یکی). میدان هر
                ۱۰ دقیقه یک نبرد است.
              </p>
            </li>
            <li>
              <b>۲. غنیمت به بسته‌ها می‌رود</b>
              <p>
                بسته‌ها را باز کن، بهترین را بپوش و بقیه را بفروش یا در آهنگری
                گداز کن. بستهٔ باز نشده پس از ۷ روز فروخته می‌شود.
              </p>
            </li>
            <li>
              <b>۳. شهر: قوی‌تر شو</b>
              <p>
                در زورخانه شش ویژگی را تمرین بده، در آهنگری تجهیزات را تا +۱۰
                تقویت کن و درجهٔ آن‌ها را بالا ببر، در معبد برکت بگیر.
              </p>
            </li>
            <li>
              <b>۴. هر روز سر بزن</b>
              <p>
                معبد هر روز چهار مأموریت تازه دارد. وقتی از بازی دوری، پهلوانت
                را سر کار بفرست تا مزد بگیرد.
              </p>
            </li>
            <li>
              <b>۵. آبرو و نام</b>
              <p>
                آبرو از لشکرکشی و میدان رتبه و لقب می‌آورد؛ نام از سیاه‌چال‌ها.
                لقب‌ها ویژگی‌ها را درصدی بالا می‌برند.
              </p>
            </li>
          </ol>
          <p className="info-note">
            نُه سرزمین از پارس تا کوه قاف، نُه سیاه‌چال و سطح تا ۸۰ در انتظار توست.
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
