'use client';

import { useState } from 'react';
import {
  Anvil,
  Backpack,
  Briefcase,
  Check,
  Coins,
  Dumbbell,
  Flame,
  Hammer,
  Hourglass,
  Landmark,
  Leaf,
  Package,
  PackageOpen,
  Plus,
  RefreshCw,
  ScrollText,
  ShoppingBag,
  Sparkles,
  Swords,
  Heart,
  Utensils,
  Brain,
  Crown,
  Clover,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BAG_UPGRADES,
  BLESSINGS,
  FOODS,
  JOBS,
  PACKAGE_MS,
  QUALITY_NAMES,
  STAT_COPY,
  STAT_NAMES,
  STATS,
  WORK_HOURS,
  fa,
  type JobId,
} from '@/lib/game/content';
import {
  MAX_UPGRADE,
  baseOf,
  blessingPrice,
  dailyMissions,
  derived,
  foodPrice,
  itemName,
  marketPrice,
  marketRefreshPrice,
  marketStock,
  refineCost,
  sellPrice,
  smeltDust,
  statCap,
  trainCost,
  upgradeCost,
  workPay,
  type ItemInstance,
} from '@/lib/game/engine';
import {
  Comparison,
  EmptyState,
  ItemStatsList,
  ItemTile,
  ItemTitle,
  duration,
  pct,
  type ViewProps,
} from './ui';

/* ---------------- Packages ---------------- */

export function PackagesView({ game, now, ready, act, go }: ViewProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const pkg = game.packages.find((p) => p.item.uid === selected);
  const bagFull = game.bag.length >= game.bagSize;
  const sorted = [...game.packages].reverse();
  return (
    <>
      <div className="panel banner">
        <Package />
        <div>
          <span className="eyebrow">چاپارخانه</span>
          <h2>بسته‌های رسیده</h2>
          <p>
            غنیمت نبردها اینجا می‌ماند. هر بسته پس از ۷ روز خودبه‌خود به بهای فروش
            تبدیل می‌شود.
          </p>
        </div>
        <span className="banner-stat">{fa(game.packages.length)} بسته</span>
      </div>
      {game.packages.length === 0 ? (
        <EmptyState
          icon={<PackageOpen />}
          title="بسته‌ای در راه نیست"
          text="در لشکرکشی، سیاه‌چال و میدان غنیمت به دست بیاور."
        >
          <Button onClick={() => go('expedition')}>
            <Swords /> لشکرکشی
          </Button>
        </EmptyState>
      ) : (
        <>
          <div className="toolbar">
            <Button
              disabled={!ready || bagFull}
              onClick={() => act({ type: 'takeAll' })}
            >
              <Backpack /> باز کردن همه
            </Button>
            {[0, 1, 2].map((q) => (
              <Button
                key={'s' + q}
                variant="outline"
                disabled={
                  !ready || !game.packages.some((p) => p.item.quality <= q)
                }
                onClick={() =>
                  act({ type: 'bulkPackages', mode: 'sell', maxQuality: q })
                }
              >
                فروش تا {QUALITY_NAMES[q]}
              </Button>
            ))}
            {[0, 1, 2].map((q) => (
              <Button
                key={'m' + q}
                variant="ghost"
                disabled={
                  !ready || !game.packages.some((p) => p.item.quality <= q)
                }
                onClick={() =>
                  act({ type: 'bulkPackages', mode: 'smelt', maxQuality: q })
                }
              >
                <Flame /> گداز تا {QUALITY_NAMES[q]}
              </Button>
            ))}
          </div>
          {bagFull && (
            <p className="warn-note">
              کیسه پر است. در بخش پهلوان وسایل اضافه را بفروش یا کیسهٔ بزرگ‌تر
              بخر.
            </p>
          )}
          <div className="split">
            <div className="bag-grid">
              {sorted.map((p) => (
                <ItemTile
                  key={p.item.uid}
                  item={p.item}
                  selected={selected === p.item.uid}
                  locked={p.item.level > game.level}
                  onClick={() => setSelected(p.item.uid)}
                />
              ))}
            </div>
            {pkg ? (
              <div className="panel item-detail">
                <ItemTitle item={pkg.item} />
                <small className="muted">
                  از {pkg.source} · {duration(pkg.at + PACKAGE_MS - now)} تا
                  فروش خودکار
                </small>
                <ItemStatsList item={pkg.item} />
                <Comparison game={game} item={pkg.item} />
                <div className="item-actions">
                  <Button
                    disabled={!ready || bagFull}
                    onClick={() => {
                      act({ type: 'take', uid: pkg.item.uid });
                      setSelected(null);
                    }}
                  >
                    <Backpack /> به کیسه
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!ready}
                    onClick={() => {
                      act({ type: 'sell', uid: pkg.item.uid });
                      setSelected(null);
                    }}
                  >
                    فروش · {fa(sellPrice(pkg.item))} <Coins />
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!ready}
                    onClick={() => {
                      act({ type: 'smelt', uid: pkg.item.uid });
                      setSelected(null);
                    }}
                  >
                    گداز · {fa(smeltDust(pkg.item))} <Flame />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="info-note">یک بسته را برگزین تا آن را ببینی.</p>
            )}
          </div>
        </>
      )}
    </>
  );
}

/* ---------------- Market ---------------- */

export function MarketView({ game, now, ready, act }: ViewProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const stock = marketStock(game);
  const item = selected !== null ? stock[selected] : null;
  const nextBag = BAG_UPGRADES.find((b) => b.size > game.bagSize);
  const nextPeriod = (game.market.period + 1) * 6 * 3_600_000 - 3.5 * 3_600_000;
  const bagFull = game.bag.length >= game.bagSize;
  return (
    <>
      <div className="panel banner">
        <ShoppingBag />
        <div>
          <span className="eyebrow">بازار راه شاهی</span>
          <h2>بازرگانان سلاح، زره و گوهر</h2>
          <p>
            کالاها هر ۶ ساعت نو می‌شوند و با سطح تو هماهنگ‌اند. تازه‌سازی کالا تا{' '}
            {duration(nextPeriod - now)}.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!ready || game.gold < marketRefreshPrice(game)}
          onClick={() => {
            act({ type: 'refreshMarket' });
            setSelected(null);
          }}
        >
          <RefreshCw /> کالای تازه · {fa(marketRefreshPrice(game))} <Coins />
        </Button>
      </div>
      <div className="split">
        <div className="market-grid">
          {stock.map((it, index) => {
            const sold = game.market.bought.includes(index);
            return (
              <div
                key={index}
                className={'market-cell' + (sold ? ' sold' : '')}
              >
                <ItemTile
                  item={it}
                  selected={selected === index}
                  locked={it.level > game.level}
                  onClick={() => !sold && setSelected(index)}
                />
                <small>{sold ? 'فروخته شد' : fa(marketPrice(it))}</small>
              </div>
            );
          })}
        </div>
        {item && selected !== null && !game.market.bought.includes(selected) ? (
          <div className="panel item-detail">
            <ItemTitle item={item} />
            <ItemStatsList item={item} />
            {item.level > game.level && (
              <p className="warn-note">از سطح {fa(item.level)} پوشیدنی است.</p>
            )}
            <Comparison game={game} item={item} />
            <div className="item-actions">
              <Button
                disabled={!ready || bagFull || game.gold < marketPrice(item)}
                onClick={() => {
                  act({ type: 'buy', index: selected });
                  setSelected(null);
                }}
              >
                خرید · {fa(marketPrice(item))} <Coins />
              </Button>
            </div>
            {bagFull && <p className="warn-note">کیسه پر است.</p>}
          </div>
        ) : (
          <p className="info-note">
            کالایی را برگزین تا با تجهیزات کنونی مقایسه شود.
          </p>
        )}
      </div>
      <div className="section-heading">
        <h2>
          <Utensils /> خوراک سفر
        </h2>
        <span>اثر خوراک با خرد بیشتر می‌شود</span>
      </div>
      <div className="card-row">
        {FOODS.map((f) => (
          <article className="panel food-card" key={f.id}>
            <Utensils />
            <div>
              <h3>{f.name}</h3>
              <p>
                {fa(f.heal * 100)}٪ سلامتی · موجودی {fa(game.food[f.id])}
              </p>
            </div>
            <div className="food-buttons">
              {[1, 5].map((n) => (
                <Button
                  key={n}
                  variant="outline"
                  disabled={
                    !ready ||
                    game.gold < foodPrice(game, f.id) * n ||
                    game.food[f.id] + n > 50
                  }
                  onClick={() =>
                    act({ type: 'buyFood', foodId: f.id, count: n })
                  }
                >
                  {fa(n)}× · {fa(foodPrice(game, f.id) * n)} <Coins />
                </Button>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="panel bag-offer">
        <Backpack />
        <div>
          <h3>کیسهٔ بزرگ‌تر</h3>
          <p>
            {nextBag
              ? `${fa(nextBag.size)} جا · از سطح ${fa(nextBag.level)}`
              : 'بزرگ‌ترین کیسه را داری.'}
          </p>
        </div>
        {nextBag && (
          <Button
            variant="outline"
            disabled={
              !ready || game.level < nextBag.level || game.gold < nextBag.price
            }
            onClick={() => act({ type: 'buyBag' })}
          >
            خرید · {fa(nextBag.price)} <Coins />
          </Button>
        )}
      </div>
    </>
  );
}

/* ---------------- Forge ---------------- */

export function ForgeView({ game, ready, act }: ViewProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const worn = Object.values(game.equipment).filter(
    (i): i is ItemInstance => !!i,
  );
  const all = [...worn, ...game.bag];
  const item = all.find((i) => i.uid === selected) ?? null;
  const isWorn = !!item && worn.some((w) => w.uid === item.uid);
  const up = item ? upgradeCost(item) : null;
  const ref = item ? refineCost(item) : null;
  return (
    <>
      <div className="panel banner">
        <Anvil />
        <div>
          <span className="eyebrow">آهنگری کاوه</span>
          <h2>تقویت، پالایش و گداز</h2>
          <p>
            هر تقویت ۶٪ به همهٔ ویژگی‌های وسیله می‌افزاید (تا +{fa(MAX_UPGRADE)}).
            پالایش درجهٔ وسیله را یک پله بالا می‌برد. وسایل اضافه را گداز کن تا غبار
            گوهر بگیری.
          </p>
        </div>
        <span className="banner-stat">
          <Sparkles /> {fa(game.dust)} غبار
        </span>
      </div>
      <div className="split">
        <div>
          <div className="section-heading">
            <h2>بر تن</h2>
          </div>
          <div className="bag-grid">
            {worn.map((i) => (
              <ItemTile
                key={i.uid}
                item={i}
                selected={selected === i.uid}
                onClick={() => setSelected(i.uid)}
              />
            ))}
          </div>
          <div className="section-heading">
            <h2>کیسه</h2>
          </div>
          <div className="bag-grid">
            {game.bag.map((i) => (
              <ItemTile
                key={i.uid}
                item={i}
                selected={selected === i.uid}
                onClick={() => setSelected(i.uid)}
              />
            ))}
          </div>
          {game.bag.length === 0 && (
            <p className="info-note">
              کیسه خالی است. بسته‌ها را باز کن تا چیزی برای گداز داشته باشی.
            </p>
          )}
        </div>
        {item && up && ref ? (
          <div className="panel item-detail">
            <ItemTitle item={item} />
            <ItemStatsList item={item} />
            <div className="forge-actions">
              <div>
                <h4>
                  <Hammer /> تقویت به +{fa(item.upgrade + 1)}
                </h4>
                <p>
                  {fa(up.gold)} سکه · {fa(up.dust)} غبار
                </p>
                <Button
                  disabled={
                    !ready ||
                    item.upgrade >= MAX_UPGRADE ||
                    game.gold < up.gold ||
                    game.dust < up.dust
                  }
                  onClick={() => act({ type: 'upgrade', uid: item.uid })}
                >
                  {item.upgrade >= MAX_UPGRADE ? 'بیشترین تقویت' : 'تقویت'}
                </Button>
              </div>
              <div>
                <h4>
                  <Sparkles /> پالایش به{' '}
                  {item.quality < 4 ? QUALITY_NAMES[item.quality + 1] : '—'}
                </h4>
                <p>
                  {fa(ref.gold)} سکه · {fa(ref.dust)} غبار
                </p>
                <Button
                  variant="outline"
                  disabled={
                    !ready ||
                    item.quality >= 4 ||
                    game.gold < ref.gold ||
                    game.dust < ref.dust
                  }
                  onClick={() => act({ type: 'refine', uid: item.uid })}
                >
                  {item.quality >= 4 ? 'بالاترین درجه' : 'پالایش'}
                </Button>
              </div>
              {!isWorn && (
                <div>
                  <h4>
                    <Flame /> گداز
                  </h4>
                  <p>{fa(smeltDust(item))} غبار گوهر؛ وسیله از میان می‌رود.</p>
                  <Button
                    variant="ghost"
                    disabled={!ready}
                    onClick={() => {
                      act({ type: 'smelt', uid: item.uid });
                      setSelected(null);
                    }}
                  >
                    گداز
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="info-note">وسیله‌ای را برای کار در کوره برگزین.</p>
        )}
      </div>
    </>
  );
}

/* ---------------- Training ---------------- */

const STAT_ICONS = {
  strength: Swords,
  agility: Leaf,
  vitality: Heart,
  luck: Clover,
  charisma: Crown,
  intelligence: Brain,
};

export function TrainingView({ game, now, ready, act }: ViewProps) {
  const d = derived(game, now);
  const cap = statCap(game.level);
  return (
    <>
      <div className="panel banner">
        <Dumbbell />
        <div>
          <span className="eyebrow">زورخانه</span>
          <h2>توانایی امروز، پیروزی فردا</h2>
          <p>
            سکه خرج کن و شش ویژگی پایه را برای همیشه افزایش بده. سقف تمرین در
            سطح {fa(game.level)}: {fa(cap)}.
          </p>
        </div>
      </div>
      <div className="training-grid six">
        {STATS.map((stat) => {
          const Icon = STAT_ICONS[stat];
          const cost = trainCost(game, stat);
          const capped = game.stats[stat] >= cap;
          return (
            <article className="panel training-card" key={stat}>
              <div className="training-top">
                <Icon />
                <span>{STAT_NAMES[stat]}</span>
                <strong>{fa(game.stats[stat])}</strong>
              </div>
              <p>{STAT_COPY[stat]}</p>
              <small className="muted">
                با تجهیزات و لقب: {fa(d.totals[stat])}
              </small>
              <Button
                variant="outline"
                disabled={!ready || capped || game.gold < cost}
                onClick={() => act({ type: 'train', stat })}
              >
                <Plus /> {capped ? 'به سقف رسید' : 'تمرین +۱'}{' '}
                {!capped && (
                  <span>
                    {fa(cost)} <Coins />
                  </span>
                )}
              </Button>
            </article>
          );
        })}
      </div>
      <div className="panel training-outcome">
        <h3>اثر در نبرد با حریف هم‌سطح</h3>
        <div>
          <span>
            آسیب{' '}
            <b>
              {fa(d.min)}–{fa(d.max)}
            </b>
          </span>
          <span>
            سلامتی <b>{fa(d.maxHp)}</b>
          </span>
          <span>
            بحرانی <b>{pct(d.crit)}</b>
          </span>
          <span>
            جاخالی <b>{pct(d.dodge)}</b>
          </span>
          <span>
            سد <b>{pct(d.block)}</b>
          </span>
          <span>
            دوگانه <b>{pct(d.double)}</b>
          </span>
          <span>
            بازیابی <b>{fa(Math.round(d.regen))} در دقیقه</b>
          </span>
          <span>
            تجربهٔ افزوده <b>{pct(d.xpBonus - 1)}</b>
          </span>
        </div>
      </div>
      <p className="info-note">
        با هر افزایش سطح، یک قدرت و یک استقامت رایگان می‌گیری.
      </p>
    </>
  );
}

/* ---------------- Temple ---------------- */

export function TempleView({ game, now, ready, act }: ViewProps) {
  const missions = dailyMissions(game);
  const nextDay = (game.daily.day + 1) * 86_400_000 - 3.5 * 3_600_000;
  return (
    <>
      <div className="panel banner">
        <Landmark />
        <div>
          <span className="eyebrow">آتشکدهٔ کهن</span>
          <h2>مأموریت‌های روزانه و برکت‌ها</h2>
          <p>
            هر روز چهار مأموریت تازه. مأموریت‌های نو تا {duration(nextDay - now)}{' '}
            دیگر.
          </p>
        </div>
      </div>
      <div className="quests-list">
        {missions.map((m) => {
          const done = m.progress >= m.target;
          return (
            <article
              className={'panel quest-row ' + (m.claimed ? 'claimed' : '')}
              key={m.index}
            >
              <div className="quest-row-heading">
                <div className="quest-seal">
                  {m.claimed ? <Check /> : <ScrollText />}
                </div>
                <div>
                  <h3>{m.name}</h3>
                  <p>{m.text}</p>
                </div>
                <span className="quest-status">
                  {m.claimed ? 'دریافت‌شده' : done ? 'آمادهٔ دریافت' : 'در جریان'}
                </span>
              </div>
              <div className="quest-progress">
                <Progress
                  value={(m.progress / m.target) * 100}
                  aria-label={m.name}
                />
                <span>
                  {fa(m.progress)} / {fa(m.target)}
                </span>
              </div>
              <div className="quest-row-bottom">
                <span>
                  <Coins /> {fa(m.gold)} · <Sparkles /> {fa(m.xp)} تجربه ·{' '}
                  {fa(m.honour)} آبرو
                </span>
                <Button
                  variant={done && !m.claimed ? 'default' : 'outline'}
                  disabled={!ready || !done || m.claimed}
                  onClick={() => act({ type: 'claimDaily', index: m.index })}
                >
                  {m.claimed
                    ? 'دریافت شد'
                    : done
                      ? 'دریافت پاداش'
                      : 'در انتظار'}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="section-heading">
        <h2>
          <Sparkles /> برکت‌ها
        </h2>
        <span>هر برکت دو ساعت؛ تا هشت ساعت انباشته می‌شود</span>
      </div>
      <div className="card-row">
        {BLESSINGS.map((b) => {
          const until = game.blessings[b.id] ?? 0;
          const active = until > now;
          return (
            <article
              className={'panel blessing-card' + (active ? ' active' : '')}
              key={b.id}
            >
              <h3>{b.name}</h3>
              <p>{b.description}</p>
              {active && (
                <small>
                  <Hourglass /> {duration(until - now)}
                </small>
              )}
              <Button
                variant="outline"
                disabled={
                  !ready ||
                  game.gold < blessingPrice(game, b.id) ||
                  until - now >= 6 * 3_600_000
                }
                onClick={() => act({ type: 'blessing', blessingId: b.id })}
              >
                {active ? 'افزودن' : 'نیایش'} · {fa(blessingPrice(game, b.id))}{' '}
                <Coins />
              </Button>
            </article>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Work ---------------- */

export function WorkView({ game, now, ready, act }: ViewProps) {
  const [hours, setHours] = useState<number>(8);
  const work = game.work;
  const job = work ? JOBS.find((j) => j.id === work.jobId) : null;
  return (
    <>
      <div className="panel banner">
        <Briefcase />
        <div>
          <span className="eyebrow">کارگاه‌های شهر</span>
          <h2>کار برای مزد</h2>
          <p>
            وقتی از بازی دوری، پهلوانت کار کند. در زمان کار نبرد ممکن نیست، ولی
            امتیازها بازیابی می‌شوند. لغو کار یعنی بی‌مزدی.
          </p>
        </div>
      </div>
      {work && job ? (
        <div className="panel work-active">
          <h3>
            <Hourglass /> {job.name}
          </h3>
          <Progress
            value={Math.min(
              100,
              ((now - work.start) / (work.until - work.start)) * 100,
            )}
            aria-label="پیشرفت کار"
          />
          <p>
            {duration(work.until - now)} مانده · مزد: {fa(work.gold)} سکه
          </p>
          <Button
            variant="outline"
            disabled={!ready}
            onClick={() => act({ type: 'cancelWork' })}
          >
            لغو کار (بی‌مزد)
          </Button>
        </div>
      ) : (
        <>
          <div className="hours-bar" aria-label="مدت کار">
            {WORK_HOURS.map((h) => (
              <Button
                key={h}
                aria-pressed={hours === h}
                variant={hours === h ? 'secondary' : 'ghost'}
                onClick={() => setHours(h)}
              >
                {fa(h)} ساعت
              </Button>
            ))}
          </div>
          <div className="card-row">
            {JOBS.map((j) => {
              const locked = game.level < j.level;
              return (
                <article
                  className={'panel job-card' + (locked ? ' locked' : '')}
                  key={j.id}
                >
                  <h3>{j.name}</h3>
                  <p>{j.description}</p>
                  <small>
                    {locked
                      ? `از سطح ${fa(j.level)}`
                      : `${fa(workPay(game.level, j.id as JobId, hours))} سکه برای ${fa(hours)} ساعت`}
                  </small>
                  <Button
                    disabled={!ready || locked}
                    onClick={() => act({ type: 'work', jobId: j.id, hours })}
                  >
                    آغاز کار
                  </Button>
                </article>
              );
            })}
          </div>
        </>
      )}
      <p className="info-note">
        روی‌هم {fa(game.counters.workHours)} ساعت کار کرده‌ای.
      </p>
    </>
  );
}

export { baseOf, itemName };
