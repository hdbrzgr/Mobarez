import { getDb } from '@/db';
import {
  GameError,
  newGame,
  normalizeSave,
  regenerate,
  transition,
  type Action,
  type GameState,
} from '@/lib/game/engine';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };
function reply(body: unknown, status = 200) {
  return Response.json(body, { status, headers });
}
async function player(request: Request) {
  const userId = request.headers.get('oai-authenticated-user-id');
  if (!userId) throw new GameError('برای ذخیرهٔ پیشرفت، وارد حساب خود شو.');
  const db = getDb();
  const row = await db
    .prepare('SELECT state, revision FROM players WHERE user_id = ?')
    .bind(userId)
    .first<{ state: string; revision: number }>();
  if (row)
    return {
      db,
      userId,
      state: JSON.parse(row.state) as GameState,
      revision: row.revision,
    };
  const state = newGame();
  await db
    .prepare(
      'INSERT OR IGNORE INTO players (user_id, state, revision, updated_at) VALUES (?, ?, 0, ?)',
    )
    .bind(userId, JSON.stringify(state), Date.now())
    .run();
  const saved = await db
    .prepare('SELECT state, revision FROM players WHERE user_id = ?')
    .bind(userId)
    .first<{ state: string; revision: number }>();
  if (!saved) throw new Error('Player creation failed');
  return {
    db,
    userId,
    state: JSON.parse(saved.state) as GameState,
    revision: saved.revision,
  };
}
export async function GET(request: Request) {
  try {
    const p = await player(request);
    const now = Date.now();
    return reply({
      state: regenerate(normalizeSave(p.state), now),
      revision: p.revision,
      now,
    });
  } catch (error) {
    console.error(
      'game GET',
      error instanceof Error ? error.message : 'unknown',
    );
    return reply(
      {
        error:
          error instanceof GameError
            ? error.message
            : 'دریافت بازی ممکن نشد. دوباره تلاش کن.',
      },
      error instanceof GameError ? 401 : 503,
    );
  }
}
export async function POST(request: Request) {
  try {
    if (request.headers.get('sec-fetch-site') === 'cross-site')
      return reply({ error: 'درخواست از مبدأ نامعتبر است.' }, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json'))
      return reply({ error: 'درخواست نامعتبر است.' }, 415);
    const raw = await request.text();
    if (raw.length > 2048)
      return reply({ error: 'درخواست بیش از حد بزرگ است.' }, 413);
    let body: { action: Action; revision: number; requestId: string };
    try {
      body = JSON.parse(raw);
    } catch {
      return reply({ error: 'درخواست نامعتبر است.' }, 400);
    }
    if (
      !body ||
      !body.action ||
      typeof body.action.type !== 'string' ||
      !Number.isInteger(body.revision) ||
      typeof body.requestId !== 'string' ||
      !/^[\w-]{16,64}$/.test(body.requestId)
    )
      return reply({ error: 'درخواست نامعتبر است.' }, 400);
    const p = await player(request);
    const now = Date.now();
    const state = normalizeSave(p.state);
    if (state.lastActionId === body.requestId)
      return reply({
        state: regenerate(state, now),
        revision: p.revision,
        now,
        message: 'این درخواست قبلاً ثبت شده است.',
      });
    if (p.revision !== body.revision)
      return reply(
        {
          error:
            'بازی در پنجرهٔ دیگری تغییر کرده است. اطلاعات به‌روز شد؛ دوباره اقدام کن.',
          state: regenerate(state, now),
          revision: p.revision,
          now,
        },
        409,
      );
    const result = transition(state, body.action, now);
    result.state.lastActionId = body.requestId;
    const update = await p.db
      .prepare(
        'UPDATE players SET state = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?',
      )
      .bind(JSON.stringify(result.state), now, p.userId, p.revision)
      .run();
    if (update.meta.changes !== 1)
      return reply(
        { error: 'درخواست هم‌زمان ثبت شد. بازی را تازه کن و دوباره اقدام کن.' },
        409,
      );
    return reply({ ...result, revision: p.revision + 1, now });
  } catch (error) {
    console.error(
      'game POST',
      error instanceof Error ? error.message : 'unknown',
    );
    return reply(
      {
        error:
          error instanceof GameError
            ? error.message
            : 'ثبت درخواست ممکن نشد. وضعیت بازی را تازه کن.',
      },
      error instanceof GameError ? 400 : 503,
    );
  }
}
