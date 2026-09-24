# Mobarez — Development Plan

**Planning baseline:** private MVP `0.1.0`, 14 September 2026.  
**Immediate objective:** finish character-flow release and P0/P1 verification, then replace the flat tab shell with a Gladiatus-class town/country game base (G1).

[Project overview](README.md) · [Current evidence and issues](PROGRESS.md) · [Character UX specification](docs/UX.md) · [Research](docs/research.md) · [Gladiatus adaptation](docs/gladiatus-adaptation.md)

This is a proposed sequence of future work, not a claim that these features exist or an instruction to start every phase. No completion dates, assigned owners, retention results, or delivery estimates have been established. Define those when a milestone is selected.

## Product direction

A player should understand the loop without developer help: fight, read the outcome, improve the character, recover, claim rewards, and discover harder encounters. Iranian identity should be expressed through readable Persian, setting, story, opponents, equipment, and artwork.

Preserve the accepted dark olive/gold interface, RTL composition, shared controls, and server-owned progression. Make targeted corrections before redesigning screens or expanding the system.

The user has prioritized character identity and dressing, then a Gladiatus-class game base. [The character UX specification](docs/UX.md) defines U0. [The Gladiatus adaptation](docs/gladiatus-adaptation.md) inventories every major Gladiatus system and maps it onto original Iranian PvE waves G1–G5. Gender selection, visible equipment and costumes are in source; the current deployed game may not yet include them. G1 does not start until U0.4, P0 reward fixes, and P1 save hardening are done.

## Milestone sequence

| Milestone                            | Purpose                                                            | Depends on                                               | Exit condition                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| U0 — Character identity and dressing | Gender-first creation, visible gear, and cosmetic outfits          | Minimal compatible save migration; aligned character art | Both genders can equip every existing item, preview/apply costumes and reload their saved appearance |
| P0 — Verified private MVP            | Close correctness and usability gaps in the current game           | Existing implementation                                  | Core journey passes browser and automated acceptance checks                                          |
| P1 — Reliable saves and testing      | Protect progression and make regression checks repeatable          | P0 findings; can start independent fixture work earlier  | Save upgrades, retries, and isolated API tests are verified                                          |
| P2 — Balanced Persian PvE alpha      | Improve progression, content clarity, and Iranian presentation     | P0 + P1                                                  | A complete campaign playtest and revised content pass are documented                                 |
| P3 — Controlled external pilot       | Add the identity, recovery, and operations needed for more players | P1 + P2; explicit hosting/audience decision              | Access, ownership, recovery and operational checks pass                                              |
| G1 — Game shell                      | Town/country chrome, six slots, bags, packages, work, honour       | U0.4 + P0 + P1                                           | Returning players complete the current campaign inside the new shell                                 |
| G2 — PvE depth                       | Commanders, affixes, six stats, titles, temple, events             | G1                                                       | The three-region journey reads as the tutorial of a larger PvE game                                  |
| G3 — Party dungeon                   | Companions, dungeon loadout, roles, fame                           | G2                                                       | Dungeon is a five-person automatic fight, not a slower solo expedition                               |
| G4 — Craft and late PvE              | Forge, durability, underworld analog                               | G3                                                       | Crafting cannot print gold; late content has a separate specification                                |
| G5 — Social                          | Arena, guilds, player market, auction                              | P3 identity + explicit go-ahead                          | Only if the product is allowed to become a shared world                                              |

## U0 — Character identity and dressing

**Detailed design:** [docs/UX.md](docs/UX.md). The visual concept is a static proposal; no new gameplay is marked complete.

### U0.1 Create and reveal the character

- [x] Add the minimal versioned appearance migration and validate new profile actions, preserving every existing gameplay field.
- [x] Prepare equally complete female/male base character art and actual starter-equipment previews.
- [x] Show required **زن / مرد** selection first, with equal gameplay capabilities and no preselected gender.
- [x] Keep or enter a valid name, save the profile once, and land on **پهلوان** with the full-body character.
- [x] Migrate returning players through one appearance step without resetting progress or re-granting starter items.

**Acceptance:** new and existing saves complete profile creation once; refresh shows the chosen gender/name and actual equipment. Duplicate or failed setup cannot lose progress or create extra resources.

### U0.2 Make equipment visible

- [x] Build the layered 2D character stage using aligned body, armor, weapon and charm artwork for both genders.
- [x] Position the current three labeled slots beside the character; keep the inventory nearby on desktop and below it on mobile.
- [x] Add item comparison and a clearly unsaved appearance preview with **پوشیدن / انصراف** controls.
- [x] Show base underclothing when armor is removed and keep slot visuals consistent with server state.
- [x] Reconcile stale previews and explain failed mutations without changing committed gear.

**Acceptance:** every one of the eight current items visibly changes the appropriate part of either character. Apply persists, Cancel has no gameplay effect, and preview statistics match the real equipment calculation.

### U0.3 Add costumes and later appearance editing

- [x] Add a separate **پوشاک** tab with two owned private-MVP outfits: **جامهٔ سفر** and **ردای آیینی**.
- [x] Support preview, apply, and **نمای تجهیزات** to clear the costume.
- [x] Keep underlying equipment effects active and explain when a costume conceals armor.
- [x] Add free later gender changes with complete matching outfit/equipment visuals.
- [x] Keep costume ownership outside the equipment inventory and validate owned costume IDs server-side.

**Acceptance:** costumes and gender change appearance only; stats, costs, rewards, items and progression remain equivalent. All supported looks exist for both genders and survive reloads.

### U0.4 Verify and release the character flow

- [ ] Run the [UX acceptance matrix](docs/UX.md#12-acceptance-matrix), including mobile keyboards, touch and keyboard navigation.
- [ ] Inspect layer alignment and a contact sheet of supported equipment/costume combinations.
- [ ] Add regression coverage for legacy saves, setup retries, ownership, preview cancellation, concurrent changes and stat equivalence.
- [ ] Record browser evidence separately from engine/API checks, then validate and publish the completed implementation privately.

**Acceptance:** profile creation, visible dressing and wardrobe are functional in the actual game. A concept image or unchanged portrait with item icons does not count as delivery. The broader P1 save-recovery program remains planned; the migration needed by appearance is a U0 prerequisite. Existing P0 correctness issues remain release work.

## P0 — Verify and stabilize the private MVP

### P0.1 Establish a repeatable acceptance journey

- [ ] Record the source revision, environment, browser/device, starting save, and test results.
- [ ] Complete the journey from gender/name selection and character inspection through the first quest, purchases, equipment, costume changes, training, and recovery.
- [ ] Exercise region and enemy locks, the level-3 dungeon, and the level-5 Alborz unlock.
- [ ] Finish and replay all three dungeon stages; verify progress survives leaving the screen and defeat.
- [ ] Refresh or reconnect after a mutation and verify the committed save is reflected correctly.

**Acceptance:** a repeatable checklist demonstrates the delivered character/wardrobe flow and every existing screen and at least one victory, defeat, purchase, sale, equip, training action, claim, and dungeon completion. Results distinguish automated checks from actual browser interaction. Use separate fixtures for later-level states when needed; do not describe fixture-assisted checks as measured first-session progression.

### P0.2 Verify desktop, mobile, and accessible interaction

- [ ] Inspect the game at narrow mobile, tablet, and desktop widths; record the exact viewport and browser versions.
- [ ] Check RTL ordering, Persian text shaping, numbers, text wrapping, and inventory/report readability.
- [ ] Use keyboard navigation for menus, dialogs, name editing, purchases, and reward claims.
- [ ] Verify dialog focus entry/return, escape/close behavior, announcements, contrast, and reduced-motion behavior.
- [ ] Exercise touch targets and the on-screen keyboard, including error messages and long character names.
- [ ] Check slow requests, connection loss, stale-state conflicts, loading, and disabled-action explanations.

**Acceptance:** no blocking horizontal overflow, clipped primary actions, inaccessible dialog controls, hidden typed input, or unexplained dead ends on the tested devices. Record defects with reproduction steps and fix them using shared components where practical.

### P0.3 Reconcile all reward paths

Addresses `ECON-01` and `ECON-02` in [PROGRESS.md](PROGRESS.md#known-issues-and-limitations).

- [ ] Reproduce final-dungeon completion with a full inventory and controlled random values.
- [ ] Distinguish “a reward was awarded” from “an item was added to inventory.”
- [ ] Define explicit gold components: encounter gold, overflow conversion, and item reward.
- [ ] Ensure a guaranteed final relic cannot trigger an unintended second reward path after conversion.
- [ ] Reconcile battle-report amounts with the actual saved balance change.
- [ ] Verify partial/full inventory, first victory, repeat victory, and duplicate-request cases.

**Acceptance:** the expected reward is credited exactly once; every credited component is visible in the result or clearly explained. Tests compare before/after balances and inventory contents, including full-inventory final-dungeon completion.

### P0 completion gate

- [ ] All reproducible blocking defects from the acceptance journey are resolved.
- [ ] Engine tests, isolated API checks available at this stage, typecheck, lint, and build pass.
- [ ] Browser results include devices, exercised flows, and remaining nonblocking limitations.
- [ ] PROGRESS records the tested revision and evidence without marking unexecuted checks as passed.

## P1 — Reliable saves and testing

### P1.1 Version and validate saved progress

- [ ] Introduce a save-schema version distinct from the SQL migration revision and game balance version.
- [ ] Validate loaded save data and define a visible recovery path for unsupported or corrupt saves.
- [ ] Add migrations using real examples of the current unversioned save structure.
- [ ] Define behavior for removed/renamed content IDs, duplicate equipment, and history limits.
- [ ] Preserve existing gold, XP, inventory, quest claims, dungeon progress, and timestamps during migration.
- [ ] Establish a tested backup/export and restore procedure before destructive schema changes.

**Acceptance:** old saves migrate once and retain intended progress; invalid saves do not silently reset a character. Failed migrations leave recoverable source data. Tests cover fresh, old, partially invalid, and already-migrated saves.

### P1.2 Strengthen the API contract

- [ ] Add explicit runtime schemas for every action and consistent authentication errors.
- [ ] Enforce a request-size boundary before unbounded body parsing.
- [ ] Specify retry behavior for uncertain network outcomes and requests older than the last saved action.
- [ ] Decide whether a bounded action ledger with payload fingerprints is needed for those semantics.
- [ ] Test simultaneous purchases, claims, and fights, not only simultaneous renames.
- [ ] Verify isolation using at least two independent authenticated identities.
- [ ] Ensure any future deployment outside Sites verifies identity and strips client-supplied identity headers.

**Acceptance:** invalid shapes are rejected consistently; clients cannot choose rewards, prices, owners, or save contents; retries and concurrent requests produce the documented number of mutations; one identity cannot read or mutate another's save.

### P1.3 Make tests safe and repeatable

- [ ] Run API tests against an isolated local database and deterministic fixtures.
- [ ] Remove assumptions about the developer's current quest progress and character name.
- [ ] Add regression cases for the P0 reward fixes and save migrations.
- [ ] Add browser automation after the manual journey is stable.
- [ ] Define CI checks for engine tests, API integration, types, lint, and build.
- [ ] Refresh dependency findings and resolve compatible updates; document any unresolved tooling advisories.

**Acceptance:** the complete test command can run repeatedly without altering a developer's normal save, relying on test order, or requiring manual cleanup. Test output identifies what ran and what was skipped.

## P2 — Balanced Persian PvE alpha

### P2.1 Measure the existing progression

- [ ] Run seeded simulations across all encounter tiers and representative loadouts.
- [ ] Conduct observed sessions from fresh characters through the first dungeon clear.
- [ ] Record first-battle understanding, time to first claim, upgrade choices, defeat recovery, and unlock pacing.
- [ ] Check that each region has a useful purpose and that one encounter does not dominate every reward path.
- [ ] Evaluate gold income against training, equipment, and food costs, including repeatable dungeon rewards.
- [ ] Publish a versioned balance table and rationale for changes.

**Acceptance:** proposed balance changes are supported by simulation or observed sessions. The research's 10–15 minute onboarding window remains a hypothesis until measured; no retention target is reported as achieved without evidence.

### P2.2 Improve content and presentation

- [ ] Give Hyrcania, Alborz, and the dungeon boss distinct artwork.
- [ ] Review Persian grammar, terminology, button labels, error copy, and explanatory text consistently.
- [ ] Add readable comparisons between equipped and candidate items.
- [ ] Clarify overflow conversions, level-up health restoration, opponent difficulty, and cooldowns in context.
- [ ] Optimize image delivery and font loading based on observed device/network behavior.
- [ ] Recheck responsive layouts and asset provenance after replacing artwork.

**Acceptance:** players can distinguish regions and bosses, understand upgrades and rewards, and recover from common failures without outside explanation. Assets and Persian copy remain readable on tested mobile screens.

### P2.3 Define the end of the MVP journey

- [ ] Decide whether the alpha ends at a first dungeon clear, all five quests, or a full region clear.
- [ ] Explain completed content and replay opportunities within the game.
- [ ] Specify repeatable quests or additional progression only if playtests show a concrete need.

**Acceptance:** players understand what they have accomplished and what remains available. Additional progression must not create an unbounded reward exploit or conceal the finite scope of the alpha.

## P3 — Controlled external pilot

This phase requires a concrete audience and deployment decision; documentation alone does not change the current owner-only access.

- [ ] Select supported pilot identity and hosting behavior: platform accounts, invited users, or a separately designed public account system.
- [ ] Specify account recovery, save ownership, export/deletion, and shared-device behavior for the chosen audience.
- [ ] Establish application rate limits, error monitoring, save backups, and restore drills.
- [ ] Test the critical API under representative request volume and concurrent users.
- [ ] Define a minimal, consent-appropriate measurement plan and feedback channel.
- [ ] Prepare deployment, migration, and rollback instructions with compatibility boundaries.
- [ ] Run the acceptance journey against the hosted pilot using permitted signed-in test accounts.
- [ ] Review access explicitly before inviting testers or publishing more broadly.

**Acceptance:** intended users can access only their own progress, saves can be recovered through the documented procedure, a deployment can be rolled back within its stated data-compatibility limits, and failures can be diagnosed. Set concrete load targets when the pilot size is known.

> **24 September 2026:** version 0.2 implements G1, G2, companions and fame from G3, and forge upgrade/refine/smelt from G4. Next: wearable art for the new slots, deploy save v2 with a backup of version-1 rows, then a real-player balance pass against the `npm run simulate` baseline.

## G1 — Game shell

**Detailed inventory:** [docs/gladiatus-adaptation.md](docs/gladiatus-adaptation.md). This is the Gladiatus-like _base_: city/country, resource bar, more slots, bags, packages, work. It is not extra provinces or mercenaries.

- [ ] Confirm the four G-series decisions in the table below (costumes, four stats, G5 social, no real-money analog).
- [ ] Split energy into expedition points and dungeon points; migrate current energy without granting extra fights.
- [ ] Add honour from expedition wins; show it on the character overview.
- [ ] Expand equipment to weapon, shield, helm, armor, boots, and charm, with save migration from the current three slots.
- [ ] Replace the flat 40-item list with two 5×8 bags and a package inbox whose expiry sells for vendor gold.
- [ ] Turn food into bag/provision items.
- [ ] Add work: timed gold, hero cannot fight until the job ends or is cancelled.
- [ ] Re-home existing screens into **شهر** and **کشور** with a persistent resource bar.
- [ ] Provide wearable art or deliberate icon fallbacks for every new slot and both genders.

**Acceptance:** the Pars → Hyrcania → Alborz journey still works. Loot arrives as packages. Work, honour, and dungeon points are server-owned. Preview/equip still matches engine stats.

## G2 — PvE depth

- [ ] Add a fourth revealed commander per region, then additional original provinces.
- [ ] Add opponent knowledge, travel cost, temple missions, achievements, and operator-scheduled events.
- [ ] Add item prefix/suffix, six quality degrees, slot bans, and wear-level bands; migrate the eight current items to base IDs.
- [ ] Add trainable **فرّه** and **خرد**; keep قدرت، چابکی، استقامت، بخت.
- [ ] Add honour rank titles and selectable earned titles with small stat bonuses; one active title.
- [ ] Add rotating server-priced vendors.
- [ ] Keep پوشاک cosmetic; timed combat bonuses are **برکت** consumables.
- [ ] Expand combat with hit chance, block, and فرّه double-hit using original Mobarez numbers.

**Acceptance:** loot names are prefix + base + suffix; computed stats match the engine; titles cannot stack; new stats migrate onto old saves at 5. Wear-level rules and vendor stock are tested. Detailed rules: [docs/gladiatus-adaptation.md](docs/gladiatus-adaptation.md#8-item-prefix-and-suffix).

## G3 — Party dungeon

- [ ] Add a dungeon loadout that clones hero stats.
- [ ] Add up to four companions with tank, heal, and damage roles and their own gear.
- [ ] Track dungeon fame separately from honour.
- [ ] Add a harder dungeon branch only after the current three stages are clearable with a party.

**Acceptance:** dungeon combat is server-resolved for five actors; companion gear cannot be duplicated onto the hero for free.

## G4 — Craft and late PvE

- [ ] Specify forge, smelt, and scrolls so failure cannot print gold.
- [ ] Add durability and repair only after forge exists.
- [ ] Specify an Iranian high-level layer (جهان زیرین analog) only when a real level cap exists.

**Acceptance:** crafting has a published sink/source table and exploit tests.

## G5 — Social

Requires P3 identity and an explicit product yes. Default is deferred.

- [ ] Arena, companion arena, guilds, player market, auction, and highscores each get a separate specification.
- [ ] Gold plunder, item-level visibility, and shared-bank rules are designed before any PvP gold is awarded.

**Acceptance:** one identity cannot read or mutate another save except through the documented attack/trade rules.

## P4 — Content administration (optional)

Still available after G1 if operators need it: editable content fields, validation, change history, balance versions, and a safe release workflow. Not a substitute for G1–G4.

Real-money purchases, ruby analogs, Centurio, recruiting, and Gameforge assets remain out of scope.

## Working and release rules

1. Select a bounded milestone and record its scope before implementation.
2. Reuse shared UI primitives and keep Persian/RTL behavior consistent.
3. Treat stored field names and content IDs as compatibility-sensitive.
4. Add meaningful regression coverage for game rules and persisted behavior; avoid tests that only repeat presentation markup.
5. Validate the changed behavior, then the required project checks. Repeat broader testing only when new changes or failures justify it.
6. Update PROGRESS with results, source revision, unresolved issues, and browser evidence.
7. Deploy only the validated source and its migrations to the intended audience; confirm the deployment outcome.
8. Keep documentation changes separate from claims of new gameplay delivery. A documentation-only update does not require a game deployment.

## Decisions to make when their phase starts

| Decision                                       | Needed by                    | Current position                                                                  |
| ---------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------- |
| Test devices/browsers and accessibility target | P0                           | Not selected; record the actual test matrix                                       |
| Retry ledger scope and save-recovery policy    | P1                           | Last-action suppression and revision checks exist; stronger semantics need design |
| Narrative era and mythology boundaries         | P2                           | Fictional myth-inspired Iran, not a reconstruction of one dynasty                 |
| Alpha completion point and pacing targets      | P2                           | Finite quests/regions exist; pacing targets are unmeasured                        |
| Pilot audience and public authentication       | P3                           | Owner-only Sites prototype today                                                  |
| Source-code license                            | Before external distribution | No project-wide license selected                                                  |
| Costume combat bonuses vs cosmetic wardrobe    | G1                           | Keep پوشاک cosmetic; timed buffs are separate برکت items                          |
| Four stats vs six Gladiatus stats              | G2                           | Add فرّه and خرد in G2; keep بخت; no seventh stat                                 |
| Arena, guilds, player market, auction          | G5                           | Deferred until P3 identity and an explicit yes                                    |
| Real-money / ruby / Centurio analog            | Never                        | Out of scope                                                                      |
