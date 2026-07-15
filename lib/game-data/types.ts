/**
 * SagaBorn D100 — Game data type definitions
 *
 * Canonical sources: the numbered Google Docs (000 Errata – 012 Creature Compendium).
 * RULE OF PRECEDENCE: the errata (doc 000) wins over chapter text when they disagree.
 * Encoded from the 2026-07-13 errata + 2026-07-14 doc pulls.
 */

// ---------------------------------------------------------------------------
// Core enums
// ---------------------------------------------------------------------------

export type Characteristic = 'STR' | 'CON' | 'SIZ' | 'INT' | 'ACU' | 'DEX' | 'SOC';

export const CHARACTERISTICS: Characteristic[] = ['STR', 'CON', 'SIZ', 'INT', 'ACU', 'DEX', 'SOC'];

export type SkillCategory =
  | 'Combat'
  | 'Communication'
  | 'Dexterous'
  | 'Mental'
  | 'Perception'
  | 'Physical';

/** Category bonus = ceil(linked characteristic / 2). Mandatory (errata Part 2 #5). */
export const CATEGORY_CHARACTERISTIC: Record<SkillCategory, Characteristic> = {
  Combat: 'DEX', // errata #7: "Fixed combat in the chart" — DEX, not STR
  Communication: 'SOC',
  Dexterous: 'DEX',
  Mental: 'INT',
  Perception: 'ACU',
  Physical: 'STR',
};

export type Archetype = 'Warrior' | 'Expert' | 'Mage';

/** A dice expression, e.g. "3d6", "1d4+1", "2d6+6", "1d4x10+20". Parsed by lib/dice. */
export type DiceExpr = string;

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

/**
 * Base chance for a skill:
 *  - number      → flat percentage
 *  - formula     → computed from characteristics
 *  - 'per-item'  → depends on the specific weapon/shield wielded (Parry, Shield)
 */
export type BaseChance =
  | number
  | { formula: 'INT+ACU' | 'DEXx2' | 'INT' | 'SOC' }
  | 'per-item';

export interface Skill {
  /** Canonical name — exact-match key used everywhere else. */
  name: string;
  category: SkillCategory;
  base: BaseChance;
  /** For "(various)" skills: known specialties. Open-ended unless closed=true. */
  specialties?: string[];
  /** True when the specialty list is exhaustive (e.g. Pilot: Air/Land/Sea). */
  closedSpecialties?: boolean;
  /** Skill-group memberships (errata #12: umbrellas are groups, not skills). */
  groups?: SkillGroup[];
  /** One-line rules summary (not the full doc text). */
  summary?: string;
}

/** Errata #12: melee/missile umbrellas are groups of skills. */
export type SkillGroup = 'melee-weapon' | 'missile-weapon';

// ---------------------------------------------------------------------------
// Talents
// ---------------------------------------------------------------------------

export type TalentTree =
  | 'Fighter'
  | 'Berserker'
  | 'Archeon'
  | 'Factor'
  | 'Rogue'
  | 'Ranger'
  | 'Bard'
  | 'Luminar'
  | 'Wylder'
  | 'Skill'
  | 'Combat'
  | 'Magic'
  | 'Special';

/**
 * Prerequisite expression: outer array = AND, inner array = OR.
 * Entries are canonical talent names, or "special:<text>" for non-talent
 * requirements (e.g. "special:SG permission").
 */
export type Prereq = string[][];

export interface Talent {
  name: string;
  cost: number; // Talent Points
  /** Trees this talent appears in (unified talents appear in several). */
  trees: TalentTree[];
  prerequisites: Prereq;
  /** True if taking this talent grants mana (= "a spellcasting Talent", errata). */
  grantsMana?: boolean;
  /** Multi-rank talents (Elemental Focus I–IV). Rank talents are exempt from learn-once. */
  ranks?: number;
  summary: string;
}

// ---------------------------------------------------------------------------
// Species (playable biologies)
// ---------------------------------------------------------------------------

export interface Species {
  name: string;
  /** SIZ roll at creation (errata #5: Feral Elfling = Elfling = 1d3+3). */
  sizRoll: DiceExpr;
  /** Biology traits, semi-structured. */
  traits: string[];
  adulthoodAge?: number;
  oldAge?: number;
  lifespan?: number | 'unknown';
  avgHeight?: string;
  avgWeight?: string;
  /** Magic-attitude lifepath modifier (dworv +4; elf/faun/elfling exempt). */
  magicAttitudeModifier?: number | 'exempt';
}

// ---------------------------------------------------------------------------
// Professions
// ---------------------------------------------------------------------------

/**
 * A skill granted by a profession. `skill` must exist in SKILLS.
 * `specialty` optional ("Any" = player choice). `choiceOf` models grants like
 * "Melee Weapon Skill (Any)" → player picks one skill from the group.
 */
export type SkillGrant =
  | { skill: string; specialty?: string }
  | { choiceOfGroup: SkillGroup }
  | { choiceOf: string[] };

export interface Profession {
  name: string;
  /** One-line flavor description from doc 002. */
  description?: string;
  /** d100 range on the Profession Lifepath table; null = choose-only (none currently). */
  d100: [number, number] | null;
  rarity: 'Very Common' | 'Common' | 'Uncommon' | 'Rare' | 'Very Rare';
  /** Recommended archetype from the profession table. */
  archetype: Archetype;
  /** Exactly the 10 starting skills (as printed, normalized names). */
  skills: SkillGrant[];
  /** Starting equipment, normalized to catalog names where they resolve. */
  equipment: string[];
  funds: DiceExpr; // gold pieces
  contacts: number;
  /** Recommended talent paths (tree names). */
  talentPaths: TalentTree[];
}

// ---------------------------------------------------------------------------
// Spells
// ---------------------------------------------------------------------------

export type SpellType =
  | 'Buff'
  | 'Creation'
  | 'Damage'
  | 'Debuff'
  | 'Healing'
  | 'Mind'
  | 'Utility'
  | 'Trap'
  | 'Summoning';

export interface SpellTier {
  mana: number;
  effect: string;
}

export interface Spell {
  name: string;
  type: SpellType;
  /** Flat cost, tiered costs, or per-level scaling. */
  mana: { flat?: number; tiers?: SpellTier[]; perLevel?: boolean; min?: number };
  castingTime?: string;
  range?: string;
  duration?: string;
  target?: string;
  avoidance?: string;
  summary: string;
  /** Elemental spell using the unified rider table (errata #22). */
  elemental?: boolean;
  /** Known data problems, pending Mike's doc edits. */
  dataNotes?: string[];
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

export type WeaponClass = 'Light' | 'Medium' | 'Large' | 'Ranged';
export type DamageType = 'P' | 'S' | 'B';

export interface Weapon {
  name: string;
  class: WeaponClass;
  /** Governing skill name (must exist in SKILLS). */
  skill: string;
  damageType?: DamageType;
  damage: DiceExpr; // "+dm" handled by the damage-modifier rule, not encoded here
  addDamageModifier: boolean;
  hands: '1h' | '2h' | '1h/2h';
  /** STR/DEX minimums; for 1h/2h weapons, per grip. */
  str?: number;
  dex?: number;
  grip2h?: { damage: DiceExpr; str?: number; dex?: number };
  range?: string; // ranged weapons: "60'/200'"
  costGp: number | null;
  weightLb?: number | null;
  hp?: number | null;
  special?: string;
}

export interface Armor {
  name: string;
  av: number;
  costGp: number;
  weightLb?: number;
  skillPenalty?: string;
  fitsSiz?: number; // negative semantics pending Mike (round-2 list)
}

export interface GearItem {
  name: string;
  costGp: number | null;
  weightLb?: number | null;
  note?: string;
}

// ---------------------------------------------------------------------------
// Lifepath tables
// ---------------------------------------------------------------------------

export interface LifepathRow {
  /** Inclusive roll range on the table's die. */
  roll: [number, number];
  result: string;
  /** Table id to proceed to, if branching. */
  next?: string;
  /** Structured bonus when the row grants one (e.g. Craftsman +3% Craft (Any)). */
  bonus?: { skill?: string; specialty?: string; amount?: number; note?: string };
}

export interface LifepathTable {
  id: string; // e.g. "L1", "LT5", "F3", "E1", "CR01"
  title: string;
  die: DiceExpr;
  /** Which species/paths use this table. */
  appliesTo?: string[];
  rows: LifepathRow[];
}
