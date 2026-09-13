# مبارز — Mobarez

A playable Persian, RTL, single-player browser RPG set in an original myth-inspired Iran. Inspired by Gladiatus's PvE progression, with original writing, artwork, combat rules and economy. It does not use Gameforge assets or code.

## Play

Choose **لشکرکشی** → fight **گرگ خاکستری** → inspect the battle report → equip loot under **پهلوان** → train or shop → claim **مأموریت‌ها** rewards. Level 3 unlocks Hyrcania and the three-stage dungeon; level 5 unlocks Alborz. Food restores health; energy and health also regenerate while away.

Included: nine expedition enemies, three regions, three dungeon encounters, eight equipment items across three slots, four trainable stats, five one-time quests, market buying/selling, healing, automatic battle reports, character naming, and durable per-user progress.

## Development

Requires Node 22.13+ and npm.

```sh
npm ci
npm run build
npm run db:local
npm run dev
```

Open the Local URL printed by the server. On first use, click **ورود به بازی** to initialize the Sites local development identity. Hosted private access uses the platform's authenticated user identity. API requests without identity are rejected. The local development identity is only provided on the loopback development server by the Sites plugin.

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

`npm run db:local` initializes an empty local database; do not re-run the initial migration against an existing database. Schema changes go in `db/schema.ts`; use `npm run db:generate` and apply the new migration. Sites packages and applies hosted migrations on deployment.

## Architecture

- React + TypeScript on Vinext/Vite; Cloudflare Worker-compatible server.
- D1 `players` table keyed by platform user ID. State is server-authoritative JSON with revision checking.
- `/api/game` GET loads progress. POST accepts an action, expected revision, and unique request ID; it never accepts client rewards, inventory, costs, or combat rolls.
- A compare-and-swap update prevents concurrent requests from spending or awarding twice. Duplicate last request IDs return the saved state. Older requests fail revision validation.
- Server time controls energy, healing, cooldowns, combat and rewards. UI timers are estimates synchronized to server time. Regeneration is lazy, including offline intervals.
- Combat calculations live in `lib/game/engine.ts`; content and balancing values in `lib/game/content.ts`.
- 20 recent battle reports retained; 40 equipment inventory slots. Overflow loot converts to 40% of shop value. Equipped last copies cannot be sold.
- Three-stage dungeon is solo. Finishing it awards a guaranteed Simorgh relic and resets the stage for replay.

## MVP boundaries

Private prototype with platform account access, not a public game launch. No public account registration, PvP, guilds, auctions, party/mercenary combat, payments or live-ops tools. Later-region enemies reuse the original portrait set and landscapes are color-treated representations. The final dungeon boss has no distinct portrait in this version. Timers and economy are deliberately accelerated for playtesting, not claimed to match Gladiatus's formulas.

Validation: engine tests cover progression, locks, spending, equipment, recovery, rewards, dungeon completion, inventory capacity and 250 seeded starter battles. API integration checks cover persistence, duplicate requests, concurrent writes and invalid requests. No browser was available in the build session, so visual and interaction QA on real desktop/mobile browsers remains unverified.

See [research and MVP decisions](docs/research.md) and [art provenance](docs/artwork.md).

Dependency check: production dependency audit reported zero advisories after updating React/Vinext. Four moderate development-only advisories remain in Drizzle Kit's legacy esbuild tooling; no forced downgrade or incompatible override was applied. Do not expose development tooling to the public network.
