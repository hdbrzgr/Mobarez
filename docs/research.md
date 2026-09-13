# Research → Mobarez MVP

Research date: 13 September 2026. Scope: Gladiatus PvE loop, not a feature-for-feature clone. Official tutorials below date from 2018 and establish the core mechanics; current values and live balance were not independently measured through a logged-in account.

## Findings

Gameforge describes Gladiatus as a browser RPG built around training, equipment, automatic expeditions and dungeons. Its beginner tutorial explains fighting NPCs, unlocking the next stronger expedition opponent after a victory, earning gold/experience/loot, and equipping items. The tutorial also documents stat training and health-restoring food. Its dungeon guidance describes mercenaries with combat roles. The official 2026 microevent schedule still refers to expedition/dungeon points, gold and XP rewards, regeneration and training costs.

Sources:

- [Gameforge: Gladiatus overview](https://gameforge.com/en-GB/games/gladiatus.html)
- [Gameforge community manager: beginner tutorial](https://forum.gladiatus.gameforge.com/forum/thread/159-anf%C3%A4ngertutorial/?postID=547)
- [Gameforge: dungeon and mercenary FAQ](https://forum.gladiatus.gameforge.com/forum/thread/309-gladiatus-f-a-q/?pageNo=2)
- [Gameforge: 2026 microevents](https://forum.gladiatus.gameforge.com/forum/thread/13001-microevents-2026/)

## Adaptation

| Core pattern                  | Mobarez implementation                                                  |
| ----------------------------- | ----------------------------------------------------------------------- |
| Choose an expedition NPC      | Three Iranian-inspired regions with three ordered enemies each          |
| Automatic resolution          | Server-calculated rounds with critical strikes, dodge, armor and health |
| Improve through repeated play | Gold, XP, loot, level-ups and four trainable attributes                 |
| Gear upgrades                 | Weapon, armor and charm slots; eight items; equip, buy and sell         |
| Health and expedition points  | Regenerating health/energy and purchasable food                         |
| Quest incentives              | Five milestone quests, manually claimed once                            |
| Staged dungeon progression    | Three solo encounters, persistent stage and guaranteed final relic      |
| Short return sessions         | Eight-second cooldown, one energy/minute, six health/30 seconds         |

The final row is an MVP playtest decision, not a reproduction of Gameforge timers. All combat, costs and content are original tuning. Mercenary parties are deliberately deferred: they would add party roles, AI targeting, healing, extra inventories and a second progression curve before the core loop is validated.

## Iranian direction

Mobarez uses Persian names, localized numbers, a local Vazirmatn font and RTL throughout. Its fictional journey moves from Pars through Hyrcania to Alborz. The setting blends ancient Iranian visual cues and folklore rather than claiming one historically accurate dynasty. The div and Simorgh references signal mythic fantasy; see [Encyclopaedia Iranica: Dīv](https://www.iranicaonline.org/articles/div/). No religious symbol is used as a hostile target, and no Gameforge illustrations, text or code are copied.

## Balance hypotheses to validate with players

- A new player can finish the first fight immediately and understand its rewards.
- The first 10–15 minutes should expose gear, training, claims and level unlocks.
- Recovery should keep defeat meaningful without trapping the player: food costs 20, normal wins give at least 38, passive health is free.
- The hardest fights should motivate equipment and training, rather than repeated blind attempts.

These are design intentions. Only starter-fight viability was checked with seeded simulation; session length, retention, full-economy balance and player comprehension require real playtests. No analytics or retention results are claimed.

## Next release candidates

Public account and recovery flow; distinct art for each region/boss; save-schema migrations; repeatable quests; dungeon party roles; structured operational metrics and balancing tools. PvP, guilds, auctions and monetization remain outside the requested PvE MVP.
