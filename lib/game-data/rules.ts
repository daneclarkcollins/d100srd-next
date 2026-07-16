/**
 * SagaBorn D100 — Core rules formulas and reference charts
 *
 * Every value here traces to the 2026-07-13 errata (canonical) or the
 * 2026-07-14 chapter docs. Errata wins on conflict.
 */

import { Characteristic, SkillCategory, CATEGORY_CHARACTERISTIC } from './types';

export type Characteristics = Record<Characteristic, number>;

// ---------------------------------------------------------------------------
// Characteristic generation
// ---------------------------------------------------------------------------

/** Errata ruling #2: base-game starting characteristics run 7–19 (SG can allow beyond). */
export const CREATION_MIN = 7;
export const CREATION_MAX = 19;
/** Physical hero cap; INT/ACU unlimited; above 21 needs SG input (ruling #6). */
export const HERO_CAP = 21;

export const POINT_BUY = {
  startingValue: 10,
  points: 24,
  /** Cost per point when raising, by band. */
  cost(char: Characteristic, from: number): number {
    // STR/CON/SOC: 1/pt to 15, 2/pt 16–19. DEX/INT/ACU: 1/pt to 13, 3/pt 14–16, 4/pt 17–19.
    const to = from + 1;
    if (char === 'STR' || char === 'CON' || char === 'SOC') return to <= 15 ? 1 : 2;
    if (char === 'DEX' || char === 'INT' || char === 'ACU') {
      if (to <= 13) return 1;
      if (to <= 16) return 3;
      return 4;
    }
    return 1; // SIZ is species-rolled, not point-bought
  },
  /** Refund per point when lowering below 10 (floor 7; INT floor 8). */
  refund(char: Characteristic): number {
    return char === 'DEX' || char === 'INT' || char === 'ACU' ? 2 : 1;
  },
  floor(char: Characteristic): number {
    return char === 'INT' ? 8 : CREATION_MIN;
  },
} as const;

/** Random method: 5×3d6 assigned to STR/CON/ACU/DEX/SOC; INT = 2d6+6; SIZ by species. */
export const RANDOM_METHOD = {
  rolledStats: ['STR', 'CON', 'ACU', 'DEX', 'SOC'] as Characteristic[],
  rolledDice: '3d6',
  intDice: '2d6+6',
  /** Errata Part 2 #19: redistribute up to 3 points among STR, DEX, CON, ACU, SOC. */
  redistributeMax: 3,
  redistributeAmong: ['STR', 'DEX', 'CON', 'ACU', 'SOC'] as Characteristic[],
} as const;

// ---------------------------------------------------------------------------
// Derived characteristics
// ---------------------------------------------------------------------------

/** Errata ruling #1: HP is always CON + SIZ. */
export function hitPoints(c: Characteristics): number {
  return c.CON + c.SIZ;
}

/** Unconscious at 0 HP; dead at −10 HP at the start of the next round (errata Part 2 #10). */
export const HP_UNCONSCIOUS = 0;
export const HP_DEAD = -10;

/** Spirit Points = ACU. Fuel talents/Boons/special abilities — never spells (errata #19). */
export function spiritPoints(c: Characteristics): number {
  return c.ACU;
}

/** Base mana = ACU/2 (rounded down), granted by the first mana-granting talent. */
export function baseMana(c: Characteristics): number {
  return Math.floor(c.ACU / 2);
}

/** Errata ruling #8: max mana cannot exceed the Intelligence Roll (INT × 5). */
export function manaCap(c: Characteristics): number {
  return c.INT * 5;
}

/** Experience bonus = half INT, rounded up. */
export function experienceBonus(c: Characteristics): number {
  return Math.ceil(c.INT / 2);
}

/** Horror Resistance = ACU × 5. Horror gained lowers it like wounds lower HP. */
export function horrorResistance(c: Characteristics): number {
  return c.ACU * 5;
}

/** Characteristic roll = value × 5 (Will=ACU roll, Reflex=DEX roll, etc. — errata #1). */
export function characteristicRoll(value: number): number {
  return value * 5;
}

/**
 * The six paired characteristic pools shown on the sheet
 * (effort/stamina/intellect/spirit/agility/charm — each ⌊(a+b)/2⌋).
 * Recompute these whenever a characteristic changes (doc 007 §Increasing Characteristics).
 */
export function characteristicPools(c: Characteristics): {
  effort: number; stamina: number; intellect: number;
  spirit: number; agility: number; charm: number;
} {
  const half = (a: number, b: number) => Math.floor((a + b) / 2);
  return {
    effort: half(c.STR, c.CON),
    stamina: half(c.CON, c.SIZ),
    intellect: half(c.INT, c.ACU),
    spirit: half(c.INT, c.SOC),
    agility: half(c.DEX, c.ACU),
    charm: half(c.SOC, c.INT),
  };
}

/** Damage modifier by STR+SIZ (flat values per 002's table). */
export function damageModifier(c: Characteristics): string {
  const t = c.STR + c.SIZ;
  if (t <= 12) return '-2';
  if (t <= 16) return '-1';
  if (t <= 24) return '0';
  if (t <= 32) return '+1d4';
  if (t <= 40) return '+1d6';
  if (t <= 56) return '+2d6';
  // +1d6 per additional 16 points beyond 56
  const extra = Math.ceil((t - 56) / 16);
  return `+${2 + extra}d6`;
}

/** MOV by SIZ (002/007 table, post-errata: 31-50 band fixed). */
export function movement(siz: number): number {
  if (siz <= 1) return 5;
  if (siz <= 3) return 10;
  if (siz <= 6) return 15;
  if (siz <= 14) return 25;
  if (siz <= 25) return 30;
  if (siz <= 30) return 35;
  if (siz <= 50) return 40;
  return 40; // 51+ pending a canonical row (round-2 list); clamp to the top band
}

/** SIZ category per the Size Chart (002; canonicalized bands). */
export function sizeCategory(siz: number): string {
  if (siz <= 1) return 'Tiny';
  if (siz <= 3) return 'Very Small';
  if (siz <= 6) return 'Small';
  if (siz <= 19) return 'Medium';
  if (siz <= 30) return 'Large';
  if (siz <= 50) return 'Huge';
  return 'Gigantic';
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

/** Skill pools at creation. */
export const PROFESSIONAL_SKILL_POINTS = 250;
export function personalSkillPoints(c: Characteristics): number {
  return c.INT * 10;
}
/** No starting skill above 75% — languages exempt (errata ruling #3). */
export const CREATION_SKILL_CAP = 75;
/** No skill past 90 without a Talent (errata ruling #15). */
export const ADVANCEMENT_SKILL_CAP = 90;
/** Starting languages sit at 90% understanding. */
export const STARTING_LANGUAGE_RATING = 90;

/** Category bonus = ceil(linked characteristic / 2). Mandatory. */
export function categoryBonus(category: SkillCategory, c: Characteristics): number {
  return Math.ceil(c[CATEGORY_CHARACTERISTIC[category]] / 2);
}

/** Starting languages by INT (002 chart; 19+ row pending — extrapolated). */
export function startingLanguageCount(int: number): number {
  if (int <= 8) return 1;
  if (int <= 14) return 2;
  if (int <= 18) return 3;
  return 4; // INT 19+ — pending Mike's added row (round-2 list)
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

/**
 * Crit/special thresholds: crit = 1/20 of skill, special = 1/5, rounded to
 * nearest (0.5 up) — reproduces the printed Special/Critical Percentage Chart.
 */
export function critThreshold(skill: number): number {
  return Math.round(skill / 20);
}
export function specialThreshold(skill: number): number {
  return Math.round(skill / 5);
}
/** A roll of 100 is always a fumble (errata #16). 99 is not. */
export const FUMBLE_ROLL = 100;
/** Skills with base ≥5% always succeed on 01–05 even if modified below 5%. */
export const AUTO_SUCCESS_MAX = 5;
/** Parry/Dodge: unlimited uses at cumulative −30 each; a 01 always succeeds (errata #29). */
export const DEFENSE_SUCCESSIVE_PENALTY = -30;

export type SuccessLevel = 'critical' | 'special' | 'success' | 'failure' | 'fumble';

export function resolveRoll(roll: number, skill: number): SuccessLevel {
  if (roll === FUMBLE_ROLL) return 'fumble';
  if (roll <= critThreshold(skill)) return 'critical';
  if (roll <= specialThreshold(skill)) return 'special';
  if (roll <= skill) return 'success';
  if (roll <= AUTO_SUCCESS_MAX) return 'success'; // 01–05 floor for base ≥5% skills
  return 'failure';
}

// ---------------------------------------------------------------------------
// Time & advancement
// ---------------------------------------------------------------------------

export const ROUND_SECONDS = 10;
/** A turn is 10 minutes = 60 rounds (errata #26, corrected 7-14). */
export const TURN_MINUTES = 10;
export const ROUNDS_PER_TURN = 60;

/** After a successful experience roll: +2 to the skill rating (errata #15). */
export const EXPERIENCE_GAIN = 2;
/** Characteristic training: current value × 25 hours (errata #25). */
export function characteristicTrainingHours(current: number): number {
  return current * 25;
}
/** Natural healing: 1d4+1 HP per 4 hours of rest (errata Part 2 #3). */
export const NATURAL_HEALING = { dice: '1d4+1', perHours: 4 } as const;
/** Mana: half pool per 4 hours rest, full per 8 (007 intervals). */
export const MANA_RECOVERY = { halfHours: 4, fullHours: 8 } as const;

// ---------------------------------------------------------------------------
// Character creation flow constants
// ---------------------------------------------------------------------------

export const STARTING_TALENT_POINTS = 3;

/** Archetype roll (1d10): Warrior 1–5, Expert 6–9, Mage 10. */
export function archetypeFromRoll(d10: number): 'Warrior' | 'Expert' | 'Mage' {
  if (d10 <= 5) return 'Warrior';
  if (d10 <= 9) return 'Expert';
  return 'Mage';
}

/** Elemental rider effects — unified table (errata #22). */
export const ELEMENTAL_EFFECTS: Record<string, string> = {
  Fire: 'Flammable items catch fire; low-melting-point metals melt. Target gains the On Fire effect.',
  Water: 'Puts out mundane fires or dilutes acid.',
  Ice: 'Slows creatures by 1/2. STR roll to negate.',
  Earth: 'Covers objects in dust and dirt, outlining invisible objects or creatures.',
  Electricity: 'Extra 1d4 damage to anyone in heavy metal armor (chainmail, breastplate, half plate, full plate).',
  Air: 'Knocks SIZ 20 or smaller creatures prone. DEX roll to negate falling.',
};
