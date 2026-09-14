# Mobarez — Progress

**Status date:** 14 September 2026  
**Product stage:** private playable PvE MVP (`0.1.0`)  
**Next milestone:** U0 — gender-first creation, a visible full-body character, wearable equipment, and cosmetic costumes.

[Overview and setup](README.md) · [Development plan](PLAN.md) · [Character UX](docs/UX.md) · [Research](docs/research.md)

This is an evidence record, not a completion percentage. “Implemented” means the behavior exists in source. It does not imply browser verification, production load testing, or player validation. Historical checks below are dated; they were not rerun merely to edit this documentation.

## Release baseline

| Item                        | Last confirmed state                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Hosted URL                  | [mobarez.hdbrzgr.chatgpt.site](https://mobarez.hdbrzgr.chatgpt.site)                                |
| Access                      | Owner-only; confirmed 14 September 2026                                                             |
| Latest confirmed deployment | Sites version 2, deployment reported `succeeded` on 14 September 2026                               |
| Deployed source             | `2e45e3860d41a8951120f412fb11f674d8f08c26`                                                          |
| Initial implementation      | `29416b5b6836d659269029eaff03c43e4b823343`                                                          |
| Hosted persistence          | D1 binding `DB`; `players` table confirmed present                                                  |
| Final metadata              | Open Graph and X image URLs corrected to the final deployed origin; local rendered metadata checked |

These commits identify the application baseline before the README/PROGRESS/PLAN documentation update. A successful deployment and a present table do not establish that every hosted interaction has been exercised.

## Character UX design update — 14 September 2026

The user prioritized choosing gender first, then seeing a character wear equipment and costumes. The [UX specification](docs/UX.md) defines onboarding, desktop/mobile layouts, slot and inventory interactions, costume precedence, save compatibility, asset requirements, and acceptance criteria. [The generated concept](docs/ux/character-concept.png) illustrates the visual direction; [its provenance](docs/ux/character-concept.md) records the exact prompt and limitations.

| Deliverable                                        | Status                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| User requirements and reference interpretation     | Documented                                                                                      |
| Character creation / equipment / wardrobe UX       | Specified                                                                                       |
| Original static visual concept                     | Generated and visually inspected; not a production sprite set                                   |
| U0 implementation sequence and acceptance criteria | Added to PLAN                                                                                   |
| Gender/name onboarding in the running game         | Implemented in source; engine/API tests cover setup, migration and locks                        |
| Full-body character with visible item layers       | Implemented with sliced female/male outfit variants plus weapon/charm overlays                  |
| Cosmetic wardrobe and later gender editing         | Implemented; two owned costumes and `setGender`                                                 |
| Appearance save migration and API actions          | Implemented (`saveVersion` 1, `createCharacter`, `setGender`, `wearCostume`)                    |
| Browser validation of the new UX                   | Not yet recorded as a complete acceptance pass                                                  |

Design defaults: gender affects appearance only; later gender changes retain progress; two initial private-MVP costumes are free cosmetics; visible equipment keeps the current three slots. No new application release was made for this implementation until U0.4 verification.

## Implemented scope

| Area                 | Delivered behavior                                                                              | Evidence                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Persian interface    | RTL document, Persian labels/numbers, local Vazirmatn font                                      | [Layout](app/layout.tsx), [screens](app/page.tsx), [styles](app/globals.css)    |
| Expeditions          | Three regions, nine NPCs, level-gated regions, sequential opponent unlocks                      | [Content](lib/game/content.ts), `enemyUnlocked` in [engine](lib/game/engine.ts) |
| Combat               | Automatic rounds, armor, critical strikes, dodge, cooldown, energy cost, victory/defeat reports | `transition` in [engine](lib/game/engine.ts)                                    |
| Progression          | XP thresholds, level gains, stat increases, health refill                                       | `awardXp` and `xpGoal` in [engine](lib/game/engine.ts)                          |
| Training             | Four attributes, increasing gold costs, derived combat stats                                    | [Engine](lib/game/engine.ts), [training screen](app/page.tsx)                   |
| Equipment            | Eight items, three slots, three rarities, inventory filtering, equip/unequip/sell               | [Content](lib/game/content.ts), [engine](lib/game/engine.ts)                    |
| Market and recovery  | Fixed-price purchases, food, passive health/energy, capacity checks                             | [Engine](lib/game/engine.ts)                                                    |
| Quests               | Five milestones, progress tracking, one-time manual claims                                      | [Content](lib/game/content.ts), `questProgress` in [engine](lib/game/engine.ts) |
| Dungeon              | Three solo stages, retained progress, final relic reward, replay                                | [Dungeon definitions](lib/game/content.ts), [engine](lib/game/engine.ts)        |
| Reports and identity | 20 recent battles, round details, character renaming                                            | [Screens](app/page.tsx), [state model](lib/game/engine.ts)                      |
| Character appearance | Gender-first setup, full-body stage, visible gear, two costumes, later gender edit              | [Creation/hero UI](components/character), [art map](lib/game/character-art.ts)  |
| Persistence          | Per-identity D1 save, server-owned mutations, offline regeneration                              | [API](app/api/game/route.ts), [schema](db/schema.ts)                            |
| Concurrent requests  | Revision-checked SQL update and immediate duplicate request handling                            | [API](app/api/game/route.ts), [API smoke script](scripts/api-smoke.mjs)         |
| Art and research     | Environment artwork, enemy atlas, social card, research and adaptation notes                    | [Artwork](docs/artwork.md), [research](docs/research.md)                        |

## Verification record

| Check                           | Result and date                                                                                                | Practical limit                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `npm run build`                 | Passed; latest metadata build 14 September 2026                                                                | Compilation does not prove browser behavior                         |
| `npm run typecheck`             | Passed during final implementation checks, 13 September 2026 UTC                                               | Does not validate arbitrary JSON at runtime                         |
| `npm run lint`                  | Passed during final implementation checks, 13 September 2026 UTC                                               | Does not replace accessibility testing                              |
| `npm test`                      | 16 engine tests passed, 14 September 2026                                                        | Pure engine tests; no hosted database                                        |
| Local character UX              | Gender setup, full-body stage, bronze-blade preview, travel costume apply checked locally, 14 September 2026 | One signed-in local save; not a full U0.4 device/accessibility matrix        |
| Starter battle simulation       | 250 seeded encounters exercised within the engine suite                                                        | Starter viability only; no full-progression or retention claim      |
| Local API smoke checks          | Passed after dependency updates, 13 September 2026 UTC                                                         | One local identity; changes test data                               |
| Local document/assets           | Persian RTL document, metadata, font and image routes checked, 13 September 2026 UTC                           | HTTP/source checks, not rendered visual inspection                  |
| Final metadata origin           | Local rendered Open Graph/X metadata checked, 14 September 2026                                                | No end-to-end social crawler test                                   |
| Hosted release                  | Deployment succeeded; live `players` table and private access confirmed, 14 September 2026                     | Signed-in hosted gameplay was not exercised through automation      |
| Production dependencies         | `npm audit --omit=dev` reported zero advisories during implementation, 13 September 2026 UTC                   | Dated audit result; advisory data can change                        |
| Development dependencies        | Four moderate advisories remained in the Drizzle Kit / legacy esbuild dependency chain at implementation close | No incompatible override or forced downgrade applied                |
| Browser/mobile/accessibility QA | **Not performed**; browser tooling was unavailable                                                             | Responsive CSS, dialogs, touch behavior and focus remain unverified |

### Engine coverage

The [13 tests](tests/engine.test.ts) cover:

- Starter victory, rewards, enemy unlocks, and input-state immutability.
- Locked enemies, regions, and dungeon entry.
- Cooldown and insufficient-energy rejection.
- Passive recovery, partial intervals, and caps.
- Purchases, ownership, equipment changes, selling, food, and insufficient gold.
- Early quest-claim rejection and one-time payouts.
- Level gain, stat gain, and health refill.
- Defeat consequences and recovery from one health.
- Dungeon stages, completion reward, and replay reset.
- Full-inventory expedition loot conversion and sale of duplicate equipped items.
- Training costs and maximum-health changes.
- Seeded starter encounters and basic content-value checks.

### Local API coverage

The [smoke script](scripts/api-smoke.mjs) verified unauthenticated GET rejection, local sign-in, persisted renaming, duplicate request handling, stale revisions, concurrent writes, invalid items, an unearned quest claim, malformed JSON, and cross-site rejection.

It does **not** verify two independent users, full hosted combat, every malformed action shape, multi-action retry history, or the complete UI journey. Its assumptions and data mutations are documented in [README.md](README.md#validation).

## Known issues and limitations

| ID      | Priority | Finding                                                                                                                                        | Status / next action                                                                                                                                        |
| ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QA-01   | P0       | No desktop/mobile browser journey has been verified                                                                                            | Open; run the [P0 acceptance pass](PLAN.md#p0--verify-and-stabilize-the-private-mvp)                                                                        |
| ECON-01 | P1       | A full inventory makes the final dungeon relic convert to gold and return `null`; the `!loot` fallback can then award another drop/conversion  | Identified by source review while preparing these documents; reproduce with a regression test, then separate reward-awarded state from the returned item ID |
| ECON-02 | P1       | Overflow conversion adds to the player's gold but not `battle.gold`; the report can understate the total credited reward                       | Identified by source review; add an explicit reward breakdown and reconcile displayed totals                                                                |
| SAVE-01 | P1       | Broader save JSON still lacks a complete runtime schema, corrupt-save recovery, and backup/export. A minimal `saveVersion` 1 appearance migration now exists for U0. | Keep the appearance normalizer; complete P1 versioning, validation and recovery separately |
| API-01  | P1       | Top-level request checks and action eligibility exist, but not a complete runtime action schema; body length is checked after reading the body | Open before wider access; add bounded parsing and validation cases                                                                                          |
| API-02  | P2       | Unauthenticated GET returns `401`, while unauthenticated POST currently becomes `400`                                                          | Open; normalize identity errors and document a stable contract                                                                                              |
| API-03  | P1       | Duplicate suppression remembers only the last action ID, not an action ledger or payload fingerprint                                           | Current boundary; define retry semantics and test them before broader clients are added                                                                     |
| TEST-01 | P1       | API smoke checks share the dev identity, overwrite its name, and assume the dungeon quest is unearned                                          | Open; isolate fixtures and make tests repeatable regardless of prior gameplay                                                                               |
| ART-01  | P2       | Later enemies reuse portraits; later landscapes reuse treated art; the dungeon boss lacks a distinct portrait                                  | Known MVP compromise; create content-specific assets after gameplay verification                                                                            |
| BAL-01  | P1       | Full campaign progression, economic sustainability, and recovery pacing have not been measured with players                                    | Open; collect timed playtest evidence before changing target values                                                                                         |
| OPS-01  | P1       | Backup/restore, save export, monitoring, rate limits, and load behavior are not established                                                    | Open before expanding access; verify recovery procedures                                                                                                    |
| DEP-01  | P2       | The last dependency audit retained four moderate development-only advisories                                                                   | Recheck the current dependency chain before the next release; avoid claiming the dated audit is current                                                     |

U0 is the next requested product milestone; P0 remains the private-MVP correctness gate; P1 follows or supports it before wider testing; P2 can follow once the core journey is dependable. These priorities are not claims of observed production incidents.

## Decisions retained

- Keep the product focused on Persian PvE in an original Iranian fantasy setting.
- Preserve the implemented RTL layout while addressing verified usability defects.
- Keep combat, costs, rewards, unlocks, and timers authoritative on the server.
- Use accelerated timers for the MVP; treat session-length targets as hypotheses.
- Keep dungeon combat solo until a separate party design is justified.
- Keep the hosted prototype owner-only unless its audience is explicitly changed.
- Keep stable content IDs compatible with stored saves.

## Work not started

Public account registration/recovery, mercenary parties, repeatable quests, new region-specific art, analytics, admin tools, PvP, guilds, auctions, and payments have not been implemented. Browser acceptance for the new character flow, reward-edge-case fixes, and the broader save-recovery program remain open. Their presence in research or planning documents does not imply delivery.

## Next checkpoint

Validate U0 against [the UX acceptance matrix](docs/UX.md#12-acceptance-matrix) in a real browser, then record the tested revision. Carry forward P0 browser verification and reward fixes. Update this file with evidence when each task finishes; leave unexecuted checks marked unverified.
