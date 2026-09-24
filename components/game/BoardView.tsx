'use client';

import { useEffect, useState } from 'react';
import { Crown, Medal, RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fa } from '@/lib/game/content';
import type { ViewProps } from './ui';

type Row = {
  rank: number;
  name: string;
  level: number;
  honour: number;
  fame: number;
  you: boolean;
};

export function BoardView({ game }: ViewProps) {
  const [sort, setSort] = useState<'honour' | 'fame'>('honour');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let live = true;
    fetch(`/api/game?board=${sort}`, { cache: 'no-store' })
      .then((r) => r.json() as Promise<{ board?: Row[]; error?: string }>)
      .then((d) => {
        if (!live) return;
        if (d.board) {
          setRows(d.board);
          setError('');
        } else setError(d.error ?? 'رده‌بندی بارگذاری نشد.');
      })
      .catch(() => live && setError('رده‌بندی بارگذاری نشد.'));
    return () => {
      live = false;
    };
  }, [sort, nonce]);
  return (
    <>
      <div className="panel banner">
        <Trophy />
        <div>
          <span className="eyebrow">تالار نام‌آوران</span>
          <h2>رده‌بندی پهلوانان</h2>
          <p>
            پهلوانان واقعی این جهان بر پایهٔ آبرو (لشکرکشی و میدان) یا نام (سیاه‌چال).
            آبروی تو: {fa(game.honour)} · نام تو: {fa(game.fame)}
          </p>
        </div>
        <Button variant="ghost" onClick={() => setNonce(nonce + 1)} aria-label="تازه‌سازی">
          <RefreshCw />
        </Button>
      </div>
      <div className="hours-bar">
        <Button
          aria-pressed={sort === 'honour'}
          variant={sort === 'honour' ? 'secondary' : 'ghost'}
          onClick={() => setSort('honour')}
        >
          <Crown /> آبرو
        </Button>
        <Button
          aria-pressed={sort === 'fame'}
          variant={sort === 'fame' ? 'secondary' : 'ghost'}
          onClick={() => setSort('fame')}
        >
          <Medal /> نام
        </Button>
      </div>
      {error && <p className="warn-note">{error}</p>}
      {!rows && !error && <p className="info-note">در حال بارگذاری…</p>}
      {rows && (
        <ol className="board">
          {rows.map((r) => (
            <li key={r.rank} className={r.you ? 'you' : ''}>
              <span className="board-rank">{fa(r.rank)}</span>
              <b>{r.name}</b>
              <small>سطح {fa(r.level)}</small>
              <span>{fa(sort === 'honour' ? r.honour : r.fame)}</span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
