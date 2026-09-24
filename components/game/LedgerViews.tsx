'use client';

import { useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  Coins,
  Compass,
  Crown,
  Lock,
  ScrollText,
  Shield,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BONUS_NAMES,
  EARNED_TITLES,
  QUESTS,
  RANK_TITLES,
  fa,
  type TitleBonus,
} from '@/lib/game/content';
import {
  activeTitle,
  itemName,
  questProgress,
  titleUnlocked,
  type Battle,
} from '@/lib/game/engine';
import { EmptyState, type ViewProps } from './ui';

/* ---------------- Story quests ---------------- */

export function QuestsView({ game, ready, act }: ViewProps) {
  const [showDone, setShowDone] = useState(false);
  const open = QUESTS.filter((q) => !game.claimed.includes(q.id));
  const ready_ = open.filter((q) => questProgress(game, q) >= q.target);
  const next = open
    .filter((q) => questProgress(game, q) < q.target)
    .slice(0, 8);
  const done = QUESTS.filter((q) => game.claimed.includes(q.id));
  const rows = [...ready_, ...next, ...(showDone ? done : [])];
  return (
    <>
      <div className="panel quest-intro">
        <ScrollText />
        <div>
          <h2>روایت پهلوانی تو</h2>
          <p>
            مأموریت‌های داستان از پارس تا کوه قاف ادامه دارند. پس از تکمیل، پاداش
            را دریافت کن. مأموریت‌های روزانه در معبد‌اند.
          </p>
        </div>
        <span>
          {fa(game.claimed.length)} / {fa(QUESTS.length)}
        </span>
      </div>
      <div className="quests-list">
        {rows.map((q) => {
          const progress = Math.min(q.target, questProgress(game, q)),
            claimed = game.claimed.includes(q.id),
            complete = progress >= q.target;
          return (
            <article
              className={'panel quest-row ' + (claimed ? 'claimed' : '')}
              key={q.id}
            >
              <div className="quest-row-heading">
                <div className="quest-seal">
                  {claimed ? <Check /> : complete ? <Trophy /> : <ScrollText />}
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
                  {fa(q.gold)} سکه{' '}
                  {q.xp > 0 && (
                    <>
                      <Sparkles />
                      {fa(q.xp)} تجربه
                    </>
                  )}
                </span>
                <Button
                  variant={complete && !claimed ? 'default' : 'outline'}
                  disabled={!ready || !complete || claimed}
                  onClick={() => act({ type: 'claim', questId: q.id })}
                >
                  {claimed
                    ? 'دریافت شد'
                    : complete
                      ? 'دریافت پاداش'
                      : 'در انتظار تکمیل'}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      {done.length > 0 && (
        <Button variant="ghost" onClick={() => setShowDone(!showDone)}>
          {showDone ? 'پنهان کردن' : 'نمایش'} {fa(done.length)} مأموریت انجام‌شده
        </Button>
      )}
    </>
  );
}

/* ---------------- Titles & records ---------------- */

function BonusText({ bonus }: { bonus: TitleBonus }) {
  const entries = Object.entries(bonus);
  if (!entries.length) return <small className="muted">بی‌پاداش</small>;
  return (
    <small className="bonus-text">
      {entries
        .map(
          ([k, v]) =>
            `+${fa(v as number)}٪ ${BONUS_NAMES[k as keyof typeof BONUS_NAMES]}`,
        )
        .join(' · ')}
    </small>
  );
}

export function TitlesView({ game, ready, act }: ViewProps) {
  const current = activeTitle(game);
  const c = game.counters;
  const records: [string, number][] = [
    ['پیروزی در لشکرکشی', c.wins],
    ['شکست در لشکرکشی', c.losses],
    ['سالاران شکست‌خورده', c.bossKills],
    ['تالارهای سیاه‌چال', c.dungeonStages],
    ['پاک‌سازی سیاه‌چال', c.dungeonClears],
    ['پاک‌سازی دشوار', c.hardClears],
    ['پیروزی در میدان', c.arenaWins],
    ['ساعت کار', c.workHours],
    ['تمرین', c.training],
    ['تقویت و پالایش', c.upgrades],
    ['گداز', c.smelted],
    ['غنیمت یافته', c.itemsFound],
    ['سکهٔ به‌دست‌آمده', c.goldEarned],
    ['آبرو', game.honour],
    ['نام', game.fame],
  ];
  const row = (
    t: { id: string; name: string; bonus: TitleBonus },
    hint: string,
  ) => {
    const owned = titleUnlocked(game, t.id);
    const active = current.id === t.id;
    return (
      <article
        className={
          'panel title-card' +
          (owned ? '' : ' locked') +
          (active ? ' active' : '')
        }
        key={t.id}
      >
        <div>
          <h3>
            {owned ? <Crown /> : <Lock />} {t.name}
          </h3>
          <p>{hint}</p>
          <BonusText bonus={t.bonus} />
        </div>
        <Button
          variant={active ? 'secondary' : 'outline'}
          disabled={!ready || !owned || active}
          onClick={() => act({ type: 'setTitle', titleId: t.id })}
        >
          {active ? 'لقب کنونی' : 'برگزیدن'}
        </Button>
      </article>
    );
  };
  return (
    <>
      <div className="panel banner">
        <Crown />
        <div>
          <span className="eyebrow">لقب کنونی</span>
          <h2>
            {current.name} {game.name}
          </h2>
          <p>
            تنها یک لقب اثر دارد. اگر لقبی برنگزینی، بالاترین رتبهٔ آبرو به کار
            می‌رود.
          </p>
          <BonusText bonus={current.bonus} />
        </div>
        {game.activeTitleId && (
          <Button
            variant="ghost"
            disabled={!ready}
            onClick={() => act({ type: 'setTitle', titleId: null })}
          >
            بازگشت به لقب رتبه
          </Button>
        )}
      </div>
      <div className="section-heading">
        <h2>رتبه‌های آبرو</h2>
        <span>آبرو از لشکرکشی، میدان و معبد</span>
      </div>
      <div className="title-grid">
        {RANK_TITLES.map((t) => row(t, `${fa(t.honour)} آبرو`))}
      </div>
      <div className="section-heading">
        <h2>لقب‌های به‌دست‌آوردنی</h2>
        <span>
          {fa(EARNED_TITLES.filter((t) => titleUnlocked(game, t.id)).length)} از{' '}
          {fa(EARNED_TITLES.length)}
        </span>
      </div>
      <div className="title-grid">
        {EARNED_TITLES.map((t) => row(t, t.hint))}
      </div>
      <div className="section-heading">
        <h2>دفتر کارنامه</h2>
      </div>
      <div className="panel records">
        {records.map(([k, v]) => (
          <span key={k}>
            {k}
            <b>{fa(v)}</b>
          </span>
        ))}
      </div>
    </>
  );
}

/* ---------------- Reports ---------------- */

const kindName = { expedition: 'لشکرکشی', dungeon: 'سیاه‌چال', arena: 'میدان' };

export function ReportsView({
  game,
  go,
  onOpen,
}: ViewProps & { onOpen: (b: Battle) => void }) {
  if (game.history.length === 0)
    return (
      <EmptyState
        icon={<BookOpen />}
        title="نخستین روایت هنوز نوشته نشده"
        text="یک لشکرکشی آغاز کن تا گزارش نبرد اینجا ثبت شود."
      >
        <Button onClick={() => go('expedition')}>
          <Compass /> شروع ماجراجویی
        </Button>
      </EmptyState>
    );
  return (
    <>
      <div className="report-list">
        {game.history.map((b) => (
          <Button
            variant="ghost"
            className="report-row"
            key={b.id}
            onClick={() => onOpen(b)}
          >
            <span className={'report-symbol ' + (b.won ? 'win' : 'loss')}>
              {b.won ? <Trophy /> : <Shield />}
            </span>
            <span className="report-name">
              <b>{b.enemy}</b>
              <small>
                {kindName[b.kind ?? (b.dungeon ? 'dungeon' : 'expedition')]} ·{' '}
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
      <p className="info-note">۲۵ نبرد اخیر در دفتر سفر نگه داشته می‌شود.</p>
    </>
  );
}

export function BattleSummary({ report }: { report: Battle }) {
  return (
    <>
      <div className="battle-rewards">
        <span>
          <Coins />
          <b>+{fa(report.gold)}</b> سکه
        </span>
        <span>
          <Sparkles />
          <b>+{fa(report.xp)}</b> تجربه
        </span>
        {report.honour !== 0 && report.honour !== undefined && (
          <span>
            <Crown />
            <b>
              {report.honour > 0 ? '+' : ''}
              {fa(report.honour)}
            </b>{' '}
            آبرو
          </span>
        )}
        {report.fame > 0 && (
          <span>
            <Trophy />
            <b>+{fa(report.fame)}</b> نام
          </span>
        )}
      </div>
      {report.levelUp && <p className="level-up">سطح تازه! سلامتی‌ات کامل شد.</p>}
      {report.loot && typeof report.loot === 'object' && (
        <div className={`loot-reward q${report.loot.quality}`}>
          <Sparkles />
          <div>
            <small>غنیمت به بسته‌ها رفت</small>
            <b className={`q${report.loot.quality}-text`}>
              {itemName(report.loot)}
            </b>
          </div>
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
                {r.missed && !r.dealt
                  ? 'حریف از ضربه‌ات جاخالی داد. '
                  : `${r.critical ? 'ضربهٔ بحرانی! ' : ''}${r.double ? 'ضربت دوگانه! ' : ''}${fa(r.dealt)} آسیب وارد کردی. `}
                {r.enemyHp === 0
                  ? 'حریف از پا درآمد.'
                  : r.taken === 0 && r.dodged
                    ? 'از ضربهٔ حریف جاخالی دادی.'
                    : `${r.enemyCritical ? 'ضربهٔ بحرانی حریف! ' : ''}${r.blocked ? 'با سد، ' : ''}${fa(r.taken)} آسیب دریافت کردی.`}
              </p>
              <small>
                تو {fa(r.playerHp)} · حریف {fa(r.enemyHp)}
              </small>
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}
