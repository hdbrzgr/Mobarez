# Gladiatus → Mobarez feature adaptation

**Date:** 14 September 2026  
**Status:** Product inventory and phased plan. Not implemented.  
**Reference playbook:** [Gladiatus wiki (gamerz-bg)](https://gladiatus.gamerz-bg.com/) — a fansite, not a private server.  
**Interactive catalog:** open the feature map canvas beside chat.

[Project overview](../README.md) · [Delivery plan](../PLAN.md) · [Earlier research](research.md)

This document is the product answer to “make the game base like Gladiatus, and add as many of those features as we can.” It is an original Iranian PvE design that reuses Gladiatus *loops*, not Gameforge assets, copy, formulas, or Roman setting.

## 1. What “game base like Gladiatus” means

Gladiatus is not only expeditions. The durable shape of the game is:

1. A **town / country** shell with a persistent resource bar.
2. A **character overview** with many equipment slots, bags beside the figure, and derived combat numbers.
3. A **timed PvE loop**: spend expedition points, wait, improve gear/stats, recover, repeat.
4. A **slower dungeon loop** with a party, separate points, and prestige that is not the same as expedition honour.
5. An **item pipeline**: drop → package inbox → bags → wear rules → vendors / forge.
6. Optional later **player-vs-player and guild** layers that only work once many characters share a world.

Mobarez already has (3) in miniature: three regions, three equipment slots, shared energy, five one-time quests, a solo dungeon. The gap is (1), (2), (4), and (5). That gap is the next product, not a visual restyle.

### Adaptation rules

- Keep Persian RTL, olive/gold UI, original art, and server-owned combat/economy.
- Give every borrowed *system* an Iranian name and fiction. Working labels below are not final copy.
- Do not copy Gladiatus item names, NPC names, provinces, gods-as-Rome, sprites, or numeric formulas.
- Do not use any religion as a hostile target. Yazata / myth flavor is setting, not an attack list.
- Do not add a ruby / Centurio / real-money analog.
- Finish U0.4, P0 reward correctness, and P1 save hardening before adding more gold sources or item sinks.

## 2. Current vs target shell

| Gladiatus surface | Mobarez today | Target |
| ----------------- | ------------- | ------ |
| Town view | Flat tabs | **شهر**: پهلوان, تمرین‌گاه, بازار, معبد, کار, بسته‌ها |
| Country view | Expeditions + dungeon mixed into the same chrome | **کشور**: لشکرکشی, سیاه‌چال, سفر |
| Overview | Full-body, 3 slots, list inventory | Figure + 6 then 10 slots + bag grid |
| Points | One energy pool of 12 | Expedition energy **and** dungeon points |
| Honour / fame | None | **آبرو** from expeditions; **نام** from dungeons |
| Packages | Loot lands in inventory | **بسته‌ها** inbox with expiry → vendor gold |
| Work | None | **کار**: timed gold, hero unavailable for fights |

## 3. Feature waves

Build in this order. Each wave should ship playable. Do not start G2 while G1 inventory still dumps items into a flat list.

### Gate: U0.4 + P0 + P1

Character identity is in source and still needs private release and the UX matrix. Reward bugs `ECON-01` / `ECON-02` and save hardening stay first. A Gladiatus-like economy on top of leaky rewards cannot be balanced.

### G1 — Game shell (do this next)

This is the “game base.” It changes how the product *feels* even before more content exists.

| System | Iranian working name | Scope |
| ------ | -------------------- | ----- |
| Dual view navigation | شهر / کشور | Persistent chrome; current screens re-homed, not deleted |
| Resource bar | نوار منابع | Gold, health, expedition energy, dungeon points, honour |
| Six equipment slots | جایگاه‌ها | Weapon, shield, helm, armor, boots, charm |
| Bag grid | کیسه‌ها | Two 5×8 bags; one cell per item |
| Package inbox | بسته‌ها | Loot/shop/forge output; 7-day expiry sells for vendor gold |
| Work | کار | Commit time for gold; cancel or finish before fighting |
| Honour | آبرو | Score from expedition wins; shown on overview |
| Split points | نیرو / امتیاز سیاه‌چال | Dungeon no longer spends the same pool as expeditions |
| Food as items | خوراک | Replace the bare counter so later foods can differ |
| Overview panels | آمار / پیروزی‌ها | Derived stats and win counts on پهلوان |

**Out of G1:** extra provinces, affixes, mercenaries, forge, arena, drag-and-drop, 1–6 cell item sizes.

**Art constraint:** six slots need wearable art for both genders or honest item-icon fallbacks. Do not claim visible gear for a slot that has no asset.

**Exit:** a returning player recognizes town vs country, sees six slots and bags, receives loot as packages, can work for gold, and still completes the existing Pars → Hyrcania → Alborz journey.

### G2 — PvE depth

| System | Iranian working name | Scope |
| ------ | -------------------- | ----- |
| Fourth expedition fight | فرمانده | Reveal a commander after the three current enemies |
| More provinces | استان‌ها | Original Iranian regions with original opponents |
| Opponent knowledge | شناخت دشمن | Repeat fights to reveal extra loot/report facts |
| Travel | سفر | Gold or time once travel distance matters |
| Temple missions | معبد | Daily / time-limited quests; keep the five story quests |
| Blessings | برکت | Timed consumable buffs, **not** wardrobe combat bonuses |
| Wear level | سطح پوشیدن | Original band so shop and drops stay wearable |
| Prefix / suffix | پیشوند / پسوند | Named affixes on loot; see [§8](#8-item-prefix-and-suffix) |
| Item quality | درجه | Six colours that scale affix stats; see [§8](#8-item-prefix-and-suffix) |
| Six stats | شش خوی | Add **فرّه** and **خرد** beside the current four; see [§9](#9-six-character-stats) |
| Honour titles | لقب | Rank + selectable titles that grant small bonuses; see [§10](#10-character-titles) |
| Rotating vendors | فروشندگان | Server-priced stock that refreshes |
| Events | رویداد | Operator-scheduled extra expedition or training discount |
| Achievements | دستاوردها | Unlock titles; not a second gold printer |
| Hit / block / double-hit | ضرب / سد / ضربت دوگانه | Hit and block from agility/strength; double-hit from فرّه |

**Costume rule:** پوشاک stays cosmetic. If Gladiatus-style combat outfits are wanted, they are a separate timed **برکت** item, not a wardrobe toggle that replaces balance.

**Exit:** the existing three-slot campaign feels like the tutorial of a larger PvE game. Loot names read as prefix + base + suffix. The overview shows an equipped title and six trainable stats.

### G3 — Party dungeon

| System | Iranian working name | Scope |
| ------ | -------------------- | ----- |
| Dungeon loadout | پیکر سیاه‌چال | Second equipment set; stats still clone the hero |
| Companions | همراهان | Up to four NPC hires, tank / heal / damage |
| Fame | نام | Dungeon prestige, distinct from honour |
| Harder branch | دو سطح | Advanced dungeon after the party can clear the current three stages |

فرّه already feeds dungeon threat; خرد already feeds healing. G3 uses those stats instead of inventing a seventh.

**Exit:** the dungeon is a five-person automatic fight with roles, not a slower solo expedition.

### G4 — Craft and late PvE

| System | Iranian working name | Scope |
| ------ | -------------------- | ----- |
| Forge / smelt | آهنگری / گداز | Materials + chance; failure must not print gold |
| Scrolls | طومار | Recipes as items |
| Durability / repair | دوام / تعمیر | Only after forge exists |
| Underworld analog | جهان زیرین | High-level PvE layer, Iranian fiction |
| Travel NPC | گوشه‌نشین | Paid travel / optional rename token if identity is public |

### G5 — Social (explicit go-ahead)

These systems need more than one owned save and a P3 identity model. They change Mobarez from a private PvE RPG into a shared world.

| System | Iranian working name | Default |
| ------ | -------------------- | ------- |
| Arena | میدان | **Later, only if you say yes.** Asynchronous attacks, gold plunder rules, honour |
| Companion arena | آوردگاه همراهان | After G3 |
| Guilds | دسته | Shared buildings, bank, donations |
| Player market / auction | بازار بازیکنان / حراج | Level-visibility bands so high gear cannot be handed down freely |
| Highscores / familia | رده‌بندی / خاندان | Boards after honour and fame exist |

**Still never:** rubies, Centurio, recruiting, speed-server forks, Gameforge art.

## 4. What we will not add

- Real-money currency, paid cooldown skips, paid stat pacts.
- Viral recruiting.
- Multiple server speeds.
- Exact Gladiatus combat, XP, or +16-wear formulas.
- Roman gods, provinces, item sets, or mercenary names.
- Using religious figures or sites as enemies.

## 5. Suggested Iranian names (working)

| Gladiatus | Mobarez |
| --------- | ------- |
| Overview | پهلوان |
| Expeditions | لشکرکشی |
| Dungeon | سیاه‌چال |
| Circus Turma | آوردگاه همراهان |
| Arena | میدان |
| Guild | دسته |
| Pantheon | معبد |
| Packages | بسته‌ها |
| Work / stable | کار |
| Auction House | حراج |
| Forge | آهنگری |
| Hermit | گوشه‌نشین |
| Honour | آبرو |
| Fame | نام |
| Current title | لقب |
| Prefix / suffix | پیشوند / پسوند |
| Charisma | فرّه |
| Intelligence | خرد |
| Mercenaries | همراهان |
| Underworld | جهان زیرین |
| Centurio | *(none)* |

## 6. Engine and save implications

G1 already touches `lib/game/engine.ts`, `lib/game/content.ts`, and `app/page.tsx`:

- Save version bump beyond appearance `saveVersion: 1`.
- New slot keys; migrate the current three slots.
- Inventory becomes bag cells + a package list with timestamps.
- Energy splits; existing energy should become expedition points, with dungeon points granted at current max.
- Food counter becomes items or a provisions bag.
- Work state: `busyUntil`, `jobId`, gold owed on completion.
- Honour as an integer; never client-authored.
- G2: item records become `{ baseId, prefixId?, suffixId?, quality, itemLevel }`; stats are computed, never stored from the client.
- G2: `stats` gains `charisma` and `intelligence` with a migration default; `activeTitleId` and `ownedTitleIds` are server-owned.

Every later wave needs its own specification, balance table, and tests. Sections 8–10 are the G2 design for affixes, stats, and titles — still not an implementation plan.

## 7. How to start implementation

1. Confirm remaining decisions in [PLAN.md](../PLAN.md#decisions-to-make-when-their-phase-starts) (costumes, G5 social, no RMT). Six stats, affixes, and titles are now in scope for G2.
2. Finish U0.4 / P0 / P1.
3. Write a G1 implementation plan (slots, bags, packages, work, chrome) with tests before UI.
4. Commission or generate wearable art per new slot, both genders, or ship icon fallbacks on purpose.

Until G1 ships, treat G2 affixes and titles as specified, not as in-progress work.

## 8. Item prefix and suffix

Researched from the [gamerz-bg items guide](https://gladiatus.gamerz-bg.com/items), [prefixes](https://gladiatus.gamerz-bg.com/items/prefixes), [suffixes](https://gladiatus.gamerz-bg.com/items/suffixes), and forging pages. Gladiatus has on the order of **228 prefixes** and a similar suffix list. Mobarez will not copy those names, materials, or the `scroll level − 10` formula.

### How Gladiatus forms an item

1. Start from a **base** (Club, Half plate, …) with its own damage/armor and a low item level.
2. Optionally add a **prefix** word (`Taliths Club`) and a **suffix** word (`… of Fatuity`).
3. Prefix and suffix each add their own stats **and** extra item levels.
4. **Quality colour** then multiplies the combined stats. White is a naked base. Any affix makes the floor **green**. Blue / purple / orange / red each step the multipliers up. Dungeon bosses drop at least blue.
5. Some affixes have **trade-offs** (plus intelligence, minus charisma %). Some **percentage stats are banned on certain slots** (no charisma % on shields, no agility % on chests, no dexterity % on shoes, no strength % on jewelry).
6. **Scrolls** teach a prefix or suffix once, then the forge can apply it. Scroll colour is unrelated to which affix it teaches.
7. Magus upgrades **quality colour**, not the affix words. Conditioning at the workbench can make a colour behave like the next colour.

### Mobarez rules (G2 drops, G4 forge)

An equipped or bag item is:

`displayName = [پیشوند] + پایه + [پسوند]`  
`itemLevel = baseLevel + prefixLevel + suffixLevel`  
`stats = qualityMultiplier × (base + prefix + suffix)`, after slot bans.

| Degree | Working name | Role |
| ------ | ------------ | ---- |
| 0 | ساده | Base only, no affix. Starter iron blade stays here. |
| 1 | فیروزه | Floor for any item that rolled a prefix or suffix. |
| 2 | لاجورد | Common upgrade; bosses bias here. |
| 3 | ارغوان | Rare. |
| 4 | کهربا | Very rare. |
| 5 | یاقوت | Forge-era; do not drop in G2. |

Start with about **12 prefixes and 12 suffixes**, not 200. Original Iranian words, not Lucius / Fatuity / Ceres. Examples of *tone* only: خورشید، سیمرغ، دیوبند، سرو as prefixes; بخت، فرّه، آهن، صبر as suffixes. Final copy is a writing pass.

Affix effects (keep the set small):

- Flat: قدرت، چابکی، استقامت، بخت، فرّه، خرد، آسیب، زره، جان
- Percent: the same six stats, plus آسیب / زره
- Combat ratings: نقد، سد، درمان (used more in G3)
- Allowed negatives on high-level affixes so a “فرّه” suffix is not strictly best-in-slot on every piece

Slot bans (Mobarez version of the Gladiatus rule):

| Slot | Cannot roll |
| ---- | ----------- |
| زره | چابکی٪ |
| سپر | فرّه٪ |
| کفش | بخت٪ |
| طلسم / انگشتر | قدرت٪ |

G2 loot pipeline: expedition drop rolls base for the enemy’s slot table, then 0–2 affixes, then quality. If any affix is present, quality is at least فیروزه. Existing eight named items migrate to `baseId` with empty affixes and today’s rarity mapped onto ساده / فیروزه / لاجورد.

G2 does **not** include scrolls, smelt, Magus, or conditioning. Those wait for G4. Until then affixes only come from drops and the rotating vendor.

Do not let the client send a finished stat block. The engine looks up prefix/suffix/quality IDs.

## 9. Six character stats

Gladiatus trains six stats from 5 each: Strength, Dexterity, Agility, Constitution, Charisma, Intelligence. Mobarez currently trains four: قدرت، چابکی، استقامت، بخت.

G2 adds the two missing *roles* without deleting بخت:

| Stat | Persian | What it does in Mobarez |
| ---- | ------- | ----------------------- |
| Strength | قدرت | Damage and block |
| Agility | چابکی | Dodge and anti-crit |
| Vitality | استقامت | Max health and regen |
| Luck | بخت | Crit chance (kept; Gladiatus folds this into dexterity) |
| Charisma | فرّه | Double-hit; later dungeon threat |
| Intelligence | خرد | Opponent knowledge, food healing, later companion healing |

Do not add a separate dexterity until playtests show hit-chance needs its own gold sink. Hit chance in G2 can use چابکی versus the enemy’s چابکی.

Training remaining four stats keeps current gold costs. New stats start at the same baseline as luck (5), cost the luck curve, and are capped by an original function of level — not `level × 5` copied from Gladiatus. Gear and titles can add to a stat; they cannot exceed a published cap except through timed برکت.

Existing saves: `charisma: 5`, `intelligence: 5` on migrate. Training UI shows all six.

## 10. Character titles

Two Gladiatus facts:

- **Honour does not raise stats.** It only sorts the highscore. ([game guide](https://gladiatus.gamerz-bg.com/game-guide))
- Characters still have a **Current Title** on the achievements page (event and milestone titles such as Champion of Rome, Curse of the Underworld). Those titles are mostly display.

Mobarez will use titles as a real progression layer, because the request is titles that *improve* the character, including فرّه and the other stats.

### Rank titles (automatic)

Unlocked by **آبرو** thresholds. Always visible. The highest unlocked rank is the default title if nothing else is equipped.

| Honour | Title | Bonus (one rank at a time) |
| ------ | ----- | -------------------------- |
| 0 | تازه‌کار | none |
| 80 | جنگجو | +1 بخت |
| 250 | پهلوان | +1 قدرت |
| 600 | نامدار | +1 فرّه |
| 1 200 | جهان‌پهلوان | +2 فرّه |
| 2 500 | افسانه‌ای | +2 فرّه، +1 خرد |

Thresholds are placeholders until G2 balance. Only the current rank bonus applies; ranks do not stack.

### Earned titles (selectable)

Quests, dungeon clears, commanders, and later events grant **لقب** IDs. The player equips **one** earned title. It **replaces** the rank-title bonus (does not stack on top), and is shown before the name: «سیمرغ‌نشان آرش».

Starter earned titles (working):

| Unlock | Title | Bonus |
| ------ | ----- | ----- |
| Claim نخستین گام | نخستین گام | +1 بخت |
| First dungeon relic | نگاهبانِ سیمرغ | +1 استقامت |
| Defeat the Pars commander | دشت‌بان | +1 قدرت |
| Learn all bonuses on one enemy | راوی | +1 خرد |
| Reach the آبرو نامدار rank | فرّه‌مند | +2 فرّه |

Later events add more titles. No title grants gold, energy, or extra loot rolls.

Server stores `ownedTitleIds` and `activeTitleId`. Unequip returns to the automatic rank title. Gender and costume do not change title bonuses.
