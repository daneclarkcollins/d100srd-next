# Expansion System — Design

Status: **planning approved-pending-questions** (2026-07-25). Tracking lives in
the vault (`projects/SagaBorn Tavern Expansions.md`); this file is the
technical design and lives with the code.

## Goal

Sellable expansions (extended rules, professions, archetypes, species, gear)
that users unlock on their account. Near-term: free beta expansions that can
be toggled on/off, plus a minimal admin to control availability. First two:
**Kai Disciplines** (mystic-warrior professions/archetypes) and **Starborn**
(space adventures — content TBD).

Design principle: build the account-entitlement shape NOW even though beta is
free, so "selling" later is a new row source, not a rewrite.

## Data model (Supabase)

```sql
-- Catalog + availability. Admin-controlled.
create table expansions (
  id          text primary key,          -- 'kai-disciplines', 'starborn'
  name        text not null,
  description text,
  status      text not null default 'hidden',  -- hidden | beta | live
  price_cents integer,                   -- null = free
  created_at  timestamptz default now()
);

-- Per-user unlock/enable. A future purchase is just source='purchase'.
create table user_expansions (
  user_id      uuid not null references auth.users(id) on delete cascade,
  expansion_id text not null references expansions(id),
  enabled      boolean not null default true,
  source       text not null default 'beta',   -- beta | purchase | grant
  created_at   timestamptz default now(),
  primary key (user_id, expansion_id)
);

-- Minimal admin now, expandable later.
create table admins ( user_id uuid primary key references auth.users(id) );
```

RLS sketch: everyone reads `expansions` where status != 'hidden'; users
read/write their own `user_expansions` (insert allowed only while the
expansion is free/beta — purchases go through the service role later); only
`admins` members update `expansions`. Characters gain an `expansions text[]`
column recording what they were built with.

## Code architecture

- `lib/expansions/types.ts` — `ExpansionContent`: optional arrays of
  professions, archetypes, talents, skills, creatures, spells + rules
  overlays.
- `lib/expansions/<id>/` — one folder per expansion (kai-disciplines first),
  same typed shapes as core `lib/game-data`.
- `lib/expansions/registry.ts` — id → content map.
- `lib/game-data/composed.ts` — `composeGameData(enabledIds)` pure merge of
  core + enabled expansions. Core arrays stay untouched.
- `contexts/ExpansionContext.tsx` — loads the user's enabled expansions once;
  `useGameData()` hook hands components the composed data. Tools/builders
  consume through the hook instead of importing arrays directly.
- Validators run with all expansions enabled (superset must stay coherent).

Type change required: `Archetype` is currently the union
`'Warrior' | 'Expert' | 'Mage'` — becomes a string plus an archetype data
record (name, description, `powerSource: 'mana' | 'kai' | null`,
recommended talent trees).

## Kai mechanics (from the printed Kai Warrior rules)

- Kai = the mana pool renamed, for Kai archetypes. **Pool = ACU × 2** via the
  Kai Mastery talent (2 TP). (Mana by contrast starts at ⌊ACU/2⌋, cap INT×5.)
- `powerSource` on the archetype drives labels (Mana ↔ Kai) across: builder,
  DerivedPreview, character sheet, Level Up modal, quick generator.
  `advancement.mana` stays as the storage field; only presentation + formulas
  swap.
- Printed Kai Warrior talent tree (12 talents) encodes directly:
  Kai Mastery (2 TP, root) → Kai Fist, Kai Protection, Kai Dodge (1 TP each);
  Kai Fist → Kai Speed → Focused Strike → Iron Fist; Focused Strike → The
  Lethal Hand; Kai Speed → Floating Step → Fluttering Jump; Kai Protection →
  Pure Body → Unsoiled Body.
- Weapon Dancer and Ninja need NEW Kai talents (to be written — drafts below
  can be proposed to Mike).

## Kai Disciplines content

Professions (all skills verified to exist in the current data):

| Profession | Skills | Choice grants |
|---|---|---|
| Weapon Master | Acrobatics, First Aid, Strategy, Athletics, Jump, Throw, Command, Dodge, Spot | ONE weapon skill, melee **or** ranged (new `choiceOfGroup: 'any-weapon'`) |
| Martial Artist | Acrobatics, Athletics, Climb, Jump, Throw, Dodge, Brawl, Martial Arts, Listen, Sense | none |
| Ninja | Acrobatics, Hide, Sleight of Hand, Stealth, Climb, Jump, Throw, Disguise | TWO weapon-skill choices (the existing chooser handles multiple grants) |

Archetypes: **Kai Warrior** (unarmed master — printed rules), **Kai Weapon
Dancer** (bonds with a single chosen weapon; talents key off that bond →
character stores a `weaponBond` choice), **Ninja** (stealth/subterfuge in
battle).

## Build order

1. **Foundation** — migration (3 tables + characters.expansions), registry +
   composed data layer + ExpansionContext, dashboard "Expansions" card
   (self-serve toggle of beta expansions), `/admin/expansions` page
   (admins-only: flip hidden/beta/live).
2. **Kai Disciplines** — content modules, Kai pool + label plumbing,
   archetype-as-data refactor, `any-weapon` choice group.
3. **New Kai talents** — draft Weapon Dancer + Ninja trees for Mike's
   sign-off, then encode.
4. **Starborn** — when content arrives (likely adds species/gear/creatures —
   the content shape already supports it).

## Decisions (Dane, 2026-07-25/26)

1. Kai pool: **fixed at ACU×2**, no level-up growth (playtested). Regen
   proposal (rest, meditation substitutes for sleep) awaiting Mike.
2. Lifepath access: **choice-only** — Kai content never appears on the d100
   profession chart or the 1d10 archetype roll.
3. Profession fields: funds = Assassin's (1d4×10+10 gp) for all three;
   rarity Very Rare (display-only); equipment/contacts drafted by us for
   Mike's review. Pairings: Weapon Master→Kai Weapon Dancer, Martial
   Artist→Kai Warrior, Ninja→Ninja. Names may change.
4. **Pools are exclusive** — Kai or mana, never both.
5. Throw ruling (pending Mike's confirm, noted in the draft): Throw = throwing
   things; thrown WEAPONS (shuriken etc.) fall under Ranged Weapons. Weapon
   choice groups therefore exclude Throw.
6. Disabled expansion → existing characters **grandfathered with a warning
   banner**.
7. ⚑ Still open: Kai regen confirm; printed-sheet Kai label; Starborn scope.
8. ⚑ Kai rules must land in the Drive Docs (currently website-only) so the
   canonical pipeline covers them — flagged to Mike in the draft.

## Content draft

Full writeup (professions with equipment/contacts, archetypes, printed Kai
Warrior tree + proposed NEW trees: 8 Kai Warrior additions, 11-talent Kai
Weapon Dancer, 11-talent Ninja) is in Drive for Mike's review:
"Kai Disciplines — Expansion Draft (for Mike's review)" in the D100 SagaBorn
folder (doc id 1cjdms-GEUya8_NSADg752y9E1peMrqzLUOlPRnjMfWA). Once he blesses
it, that doc is the encoding source for lib/expansions/kai-disciplines/.
