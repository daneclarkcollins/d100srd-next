# SagaBorn D100 — d100srd.com

## Project Overview
A web application for the SagaBorn D100 tabletop RPG (a d100/BRP-derived system by Mike Bielaczyc and Dane Clark Collins): full SRD, bestiary, character builder, quick character generator, dice roller, and character management. Think D&D Beyond, for SagaBorn.

**Repository**: https://github.com/daneclarkcollins/d100srd-next.git
**Tech stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4, MDX (next-mdx-remote + remark-gfm), Supabase (Postgres + Auth)
**Deployment**: Vercel, automatic from `main`. No feature branches — commit to main, keep the build green (`npm run build` before pushing).
**Legacy**: the old WordPress site's Docker config lives in the separate `d100srd-dev` repo — obsolete, kept for reference only.

## Canonical Rules Pipeline (the important part)

The rules live in **Google Drive**: `Shared With Me > SagaBorn > SagaBorn RPG > D100 SagaBorn` — numbered docs `000`–`010`, plus `*012 Character Gallery and Creature Compendium` and ~80 monster docs in the `BRP Monsters` subfolder.

Rules of the pipeline:

1. **Doc 000 (Errata) is canonical.** When chapter text and errata disagree, the errata wins. Mike posts rulings there; chapter-text cleanup trails behind.
2. **Everything mechanical is encoded in `lib/game-data/`** — typed TypeScript data + formula modules. The app computes from this layer, never from prose.
3. **`npm run validate:data`** checks referential integrity (profession skill grants resolve, talent prerequisite graphs close, lifepath tables tile their die ranges, weapon→skill joins, dice expressions parse). Run it after any data change.
4. **`npx tsx scripts/test-generator.ts`** stress-tests the character generator (1000 seeds + every species × archetype + every profession, invariants + reproducibility).
5. When Mike edits docs: re-pull the affected doc from Drive, re-encode the affected `lib/game-data/*.ts` file, re-run both scripts.
6. Known open doc issues are tracked as `// data note:` comments in the data files and in the "remaining fixes by chapter" doc shared with Mike (July 2026).

## Directory Structure (current)

```
app/
├── (auth)/                  # login / signup / reset-password (Supabase)
├── creatures/               # Bestiary index + [slug] renderer
├── dashboard/               # user dashboard
├── rules/                   # SRD: RulesPageClient index (hardcoded chapter list),
│   ├── [...slug]/           #   chapter renderer (content/rules/**)
│   ├── spells/              #   spell index + [slug] (content/spells/)
│   ├── classes/ equipment/  #   nested renderers
├── tools/
│   ├── character-builder/   # step-by-step builder (Supabase save/load)
│   ├── character-sheet/     # sheet view of saved characters
│   ├── dice-roller/         # dice roller
│   └── quick-generator/     # seeded random NPC/pickup-character generator
└── api/content/             # content API (async params — Next 15 style)

content/                     # MDX, regenerated from canonical docs 2026-07-15
├── rules/                   # 17 chapters + expansions + index stub
├── spells/                  # 68 spell pages
├── creatures/               # 80 monster pages
└── tools/                   # legacy WordPress calculator exports (unrendered; superseded by real tools)

lib/
├── game-data/               # THE data layer: types, rules (formulas/charts),
│   │                        #   dice, skills, talents, species, professions,
│   │                        #   spells, equipment, lifepath (+ index)
├── character-generator.ts   # seeded generator engine (mulberry32; seed in URL)
├── character-data.ts        # legacy builder data (being migrated onto game-data)
├── markdown.ts              # gray-matter content loading
└── supabase.ts

scripts/
├── validate-game-data.ts    # referential integrity (npm run validate:data)
└── test-generator.ts        # generator invariants stress test

components/                  # Navigation, CharacterBuilder/*, CharacterSheet,
                             # CharacterList, CharacterQuickStats, DiceRoller, ...
contexts/CharacterContext.tsx  # active-character state (formulas delegate to game-data/rules)
hooks/useCharacters.ts         # Supabase character CRUD (snake_case rows ↔ camelCase)
```

## Core Formulas (errata-backed, in lib/game-data/rules.ts)
- HP = CON + SIZ (unconscious at 0; dead at −10 at start of next round)
- SP = ACU; base mana = ⌊ACU/2⌋ (granted by any mana talent), cap = INT×5
- Characteristic roll = value × 5; Will=ACU, Reflex=DEX, Fortitude/Stamina=CON
- Crit = round(skill/20), Special = round(skill/5) — round-half-up matches the printed chart; fumble = 100 only; 01–05 auto-success floor
- Creation: stats 7–19 (SG beyond), 250 professional + INT×10 personal skill points, 75% creation cap (languages exempt at 90%), 3 talent points, skill category bonus = ⌈linked char/2⌉ (mandatory)
- Advancement: +2 per experience roll, 90 cap without a Talent; characteristic training = value×25 hours
- Turn = 10 min = 60 rounds (10 s each); MOV by SIZ (Medium 25')

## MDX Content Conventions
- Frontmatter: `title`, `order` (chapter sort), `category` (`chapter` | `spell` | `creature`), `description`.
- **Pipe tables only** (remark-gfm is wired into every MDXRemote renderer — never raw HTML tables).
- Escape literal `*` footnote markers as `&#42;`, and `<` `>` `{` `}` as entities. MDX treats `{}` as JSX.
- Chapter slugs are stable for SEO (`3-professions`, `1-talents`, `a-spot-rules`, ...). The SRD index in `app/rules/RulesPageClient.tsx` is a hardcoded list — update it when adding chapters.

## Environment
`.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (project `uuayqmspuiyolwayuhxz`). `SUPABASE_SERVICE_ROLE_KEY` only if admin features need it.

## Roadmap to 1.0
- [x] SRD re-imported from canonical docs (2026-07-15), spells + bestiary complete
- [x] Game-data layer + validator + quick generator
- [x] Production build green; legacy formula bugs fixed (HP, SP, MOV, XP bonus, damage mod)
- [ ] Migrate the character builder's internal species/skill/profession data onto `lib/game-data` (single source of truth; it still carries its own copies)
- [ ] Character sheet polish: live HP/SP tracking on saved characters, PDF export, shareable links (Phase 3)
- [ ] Encounter/NPC tooling on top of the bestiary + Creature Compendium tiers
- [ ] Equipment data: shields, ammunition, mounts, vehicles, siege weapons (deferred in equipment.ts)
- [ ] Admin content editing (or accept the Drive→re-import pipeline as the workflow)
- [ ] Retire `content/tools/` WordPress exports once real tools cover them
