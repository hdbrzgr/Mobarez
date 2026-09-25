'use client';
/* eslint-disable next/no-img-element -- Item art is small static local PNGs. */

import type { ComponentType, ReactNode } from 'react';
import {
  CircleDot,
  Footprints,
  Gem,
  Hand,
  HardHat,
  Heart,
  Shield,
  ShieldHalf,
  Shirt,
  Sparkles,
  Swords,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  QUALITY_NAMES,
  SLOT_NAMES,
  STAT_NAMES,
  STATS,
  fa,
  type Slot,
} from '@/lib/game/content';
import { itemIconSrc } from '@/lib/game/character-art';
import {
  baseOf,
  derived,
  itemName,
  itemStats,
  previewEquipment,
  type Action,
  type GameState,
  type ItemInstance,
} from '@/lib/game/engine';

export type View =
  | 'overview'
  | 'packages'
  | 'market'
  | 'forge'
  | 'training'
  | 'temple'
  | 'work'
  | 'expedition'
  | 'dungeon'
  | 'arena'
  | 'quests'
  | 'titles'
  | 'reports'
  | 'board';

export type ViewProps = {
  game: GameState;
  now: number;
  ready: boolean;
  act: (action: Action) => void;
  go: (view: View) => void;
};

export const SLOT_ICONS: Record<Slot, ComponentType> = {
  weapon: Swords,
  shield: ShieldHalf,
  helmet: HardHat,
  armor: Shirt,
  gloves: Hand,
  boots: Footprints,
  ring: CircleDot,
  amulet: Gem,
};

export function ItemIcon({
  item,
  slot,
}: {
  item?: ItemInstance | null;
  slot?: Slot;
}) {
  const s = item ? baseOf(item).slot : slot!;
  const src = item ? itemIconSrc(item) : undefined;
  const Icon = SLOT_ICONS[s];
  return (
    <span className={'item-symbol' + (src ? ' art' : '')}>
      {src ? <img src={src} alt="" /> : <Icon />}
    </span>
  );
}

export function ItemTile({
  item,
  selected,
  onClick,
  locked,
  note,
}: {
  item: ItemInstance;
  selected?: boolean;
  onClick?: () => void;
  locked?: boolean;
  note?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={
        `item-tile q${item.quality}` +
        (selected ? ' selected' : '') +
        (locked ? ' locked' : '')
      }
      onClick={onClick}
      title={itemName(item)}
      aria-pressed={selected}
    >
      <ItemIcon item={item} />
      {item.upgrade > 0 && (
        <span className="tile-upgrade">+{fa(item.upgrade)}</span>
      )}
      <span className="tile-level">{fa(item.level)}</span>
      {note && <span className="tile-note">{note}</span>}
      <span className="sr-only">{itemName(item)}</span>
    </button>
  );
}

export function ItemStatsList({ item }: { item: ItemInstance }) {
  const st = itemStats(item);
  const rows: [string, number | string][] = [];
  if (st.max) rows.push(['آسیب', `${fa(st.min)}–${fa(st.max)}`]);
  if (st.damage) rows.push(['آسیب افزوده', st.damage]);
  if (st.armor) rows.push(['زره', st.armor]);
  if (st.block) rows.push(['سد', st.block]);
  if (st.hp) rows.push(['سلامتی', st.hp]);
  for (const stat of STATS)
    if (st.stats[stat]) rows.push([STAT_NAMES[stat], st.stats[stat]]);
  return (
    <ul className="stat-list">
      {rows.map(([k, v]) => (
        <li key={k}>
          <span>{k}</span>
          <b>{typeof v === 'number' ? `+${fa(v)}` : v}</b>
        </li>
      ))}
    </ul>
  );
}

export function ItemTitle({ item }: { item: ItemInstance }) {
  return (
    <div className="item-title">
      <ItemIcon item={item} />
      <div>
        <h3 className={`q${item.quality}-text`}>{itemName(item)}</h3>
        <small>
          {SLOT_NAMES[baseOf(item).slot]} · {QUALITY_NAMES[item.quality]} · سطح{' '}
          {fa(item.level)}
        </small>
      </div>
    </div>
  );
}

function Delta({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  const diff = after - before;
  if (!diff) return null;
  return (
    <span className={'stat-delta ' + (diff > 0 ? 'up' : 'down')}>
      {label} {diff > 0 ? '+' : ''}
      {fa(diff)}
    </span>
  );
}

/** Shows what wearing `item` would change. */
export function Comparison({
  game,
  item,
}: {
  game: GameState;
  item: ItemInstance;
}) {
  const slot = baseOf(item).slot;
  const worn = game.equipment[slot];
  if (worn?.uid === item.uid) return <p className="info-note">پوشیده‌شده</p>;
  const now = derived(game);
  const next = derived(previewEquipment(game, slot, item));
  const lines = [
    <Delta key="min" label="کمینهٔ آسیب" before={now.min} after={next.min} />,
    <Delta key="max" label="بیشینهٔ آسیب" before={now.max} after={next.max} />,
    <Delta key="armor" label="زره" before={now.armor} after={next.armor} />,
    <Delta key="hp" label="سلامتی" before={now.maxHp} after={next.maxHp} />,
    ...STATS.map((st) => (
      <Delta
        key={st}
        label={STAT_NAMES[st]}
        before={now.totals[st]}
        after={next.totals[st]}
      />
    )),
  ];
  return (
    <div className="compare-lines">
      <small>در برابر {worn ? itemName(worn) : 'جایگاه خالی'}:</small>
      <div>{lines}</div>
    </div>
  );
}

export function Meter({
  label,
  value,
  max,
  tone,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  tone?: 'health' | 'xp' | 'points';
  icon?: ReactNode;
}) {
  return (
    <div className={'meter ' + (tone ?? '')}>
      <div className="meter-label">
        <span>
          {icon}
          {label}
        </span>
        <span>
          {fa(Math.floor(value))} / {fa(Math.floor(max))}
        </span>
      </div>
      <Progress
        value={Math.min(100, (100 * value) / Math.max(1, max))}
        className={tone === 'health' ? 'health-meter' : ''}
        aria-label={label}
      />
    </div>
  );
}

export function duration(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600),
    m = Math.floor((total % 3600) / 60),
    s = total % 60;
  const two = (n: number) => fa(n).padStart(2, '۰');
  return h ? `${fa(h)}:${two(m)}:${two(s)}` : `${fa(m)}:${two(s)}`;
}

export function StatLine({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <span className="stat-line">
      {icon}
      {label}
      <b>{value}</b>
    </span>
  );
}

export const pct = (n: number) => `${fa(Math.round(n * 1000) / 10)}٪`;

export function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state panel">
      {icon}
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}

export { Heart, Shield, Sparkles, Swords };
