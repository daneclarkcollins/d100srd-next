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

## Open questions (blocking items marked ⚑)

1. ⚑ Kai pool lifecycle: fixed at ACU×2, or does it grow (+2 per level-up
   like mana)? Cap? How does Kai regenerate (rest, meditation)?
2. ⚑ Lifepath access: the profession d100 chart tiles exactly 1–100 and the
   archetype roll is 1d10 (W 1–5, E 6–9, M 10). Are Kai professions/
   archetypes choice-only, or does Mike want expansion roll tables?
3. ⚑ Profession table fields: Weapon Master / Martial Artist / Ninja need
   funds dice, starting equipment, contacts, rarity, suggested archetype.
4. Can a Kai archetype also take mana talents (two pools), or are they
   mutually exclusive?
5. Weapon Master's "single weapon type": do options include Throw, or just
   the four melee classes + Ranged Weapons?
6. What happens to a character whose expansion is later disabled/refunded —
   lock it, warn, or grandfather it?
7. Kai on the PRINTED sheet (Mana Max box label).
8. Starborn scope: new species? vehicles? psionics? (Content later, but the
   answer affects how generic the content shape must be.)
