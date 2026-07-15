/**
 * SagaBorn D100 — Advancement (level-up) engine.
 *
 * Canon (doc 007 §Experience & Improving Skills, §Increasing Characteristics,
 * §Talents, §Mana Increases; errata #15/#25):
 *  - Experience checks: mark a skill when used successfully under pressure.
 *    At level-up, roll d100 + experience bonus (⌈INT/2⌉) per checked skill;
 *    if the result EXCEEDS the current rating, the skill gains +2.
 *    No skill can advance past 90 without a Talent.
 *  - Casters gain 2 mana whenever experience rolls are made (cap INT×5).
 *  - Training (a teacher's successful Teach roll): +1d6, +1 on a special,
 *    +2 on a critical; fumble −1d3. Research: +1d4 (±special/crit/fail mods)
 *    after a successful experience roll. Neither can push a skill past 75.
 *  - Characteristic training: value × 25 hours per +1 (50 downtime hours/week);
 *    above 21 needs SG input. Derived stats recompute.
 *  - Talent Points: awarded by the SG at the end of a story arc (usually 1–2).
 *    Talent Point Level = TOTAL TP the character has, spent or unspent
 *    (starting characters begin at TPL 3).
 */

import { TALENTS } from './game-data/talents';
import type { Talent } from './game-data/types';
import { STARTING_TALENT_POINTS, EXPERIENCE_GAIN, ADVANCEMENT_SKILL_CAP, manaCap } from './game-data/rules';
import type { Characteristics } from './game-data/rules';
import type { LegacyItemType } from './game-data/legacy-items';

// ---------------------------------------------------------------------------
// Persisted state (the `advancement` JSONB column on the characters table)
// ---------------------------------------------------------------------------

export interface LegacyItem {
  id: string;
  name: string;
  type: LegacyItemType;
  description?: string;
  gainedAtTpl: number;
  /** Chosen powers, freeform (the tables are guidelines; SG + player decide). */
  powers: { tpl: number; text: string }[];
}

export interface AdvancementLogEntry {
  at: string; // ISO date
  text: string;
}

export interface AdvancementState {
  version: 1;
  /** TP awarded by the SG beyond the starting 3. */
  talentPointsEarned: number;
  /** Canonical talent names the character knows (including starting picks). */
  talentsKnown: string[];
  /** Skill keys currently marked with an experience check. */
  experienceChecks: string[];
  /** Mana pool for casters; null/undefined for non-casters. */
  mana?: { current: number; max: number } | null;
  sagaPoints: number;
  legacyItems: LegacyItem[];
  log: AdvancementLogEntry[];
}

export function emptyAdvancement(): AdvancementState {
  return {
    version: 1,
    talentPointsEarned: 0,
    talentsKnown: [],
    experienceChecks: [],
    mana: null,
    sagaPoints: 0,
    legacyItems: [],
    log: [],
  };
}

export function normalizeAdvancement(raw: unknown): AdvancementState {
  const base = emptyAdvancement();
  if (!raw || typeof raw !== 'object') return base;
  const a = raw as Partial<AdvancementState>;
  return {
    ...base,
    ...a,
    talentPointsEarned: Math.max(0, a.talentPointsEarned ?? 0),
    talentsKnown: Array.isArray(a.talentsKnown) ? a.talentsKnown : [],
    experienceChecks: Array.isArray(a.experienceChecks) ? a.experienceChecks : [],
    legacyItems: Array.isArray(a.legacyItems) ? a.legacyItems : [],
    log: Array.isArray(a.log) ? a.log : [],
    sagaPoints: Math.max(0, a.sagaPoints ?? 0),
    version: 1,
  };
}

// ---------------------------------------------------------------------------
// Talent Points
// ---------------------------------------------------------------------------

export function talentPointLevel(state: AdvancementState): number {
  return STARTING_TALENT_POINTS + state.talentPointsEarned;
}

export function spentTalentPoints(state: AdvancementState): number {
  return state.talentsKnown.reduce((sum, name) => {
    const t = TALENTS.find((x) => x.name === name);
    return sum + (t?.cost ?? 1);
  }, 0);
}

export function unspentTalentPoints(state: AdvancementState): number {
  return talentPointLevel(state) - spentTalentPoints(state);
}

/** Talents currently learnable: affordable, prerequisites met, not already known. */
export function learnableTalents(state: AdvancementState): Talent[] {
  const owned = new Set(state.talentsKnown);
  const budget = unspentTalentPoints(state);
  return TALENTS.filter((t) => {
    if (owned.has(t.name)) return false;
    if (t.cost > budget) return false;
    return t.prerequisites.every((or) =>
      or.some((req) => req.startsWith('special:') || owned.has(req))
    );
  });
}

// ---------------------------------------------------------------------------
// Experience rolls
// ---------------------------------------------------------------------------

export interface ExperienceRollResult {
  skill: string;
  rating: number;
  roll: number;
  bonus: number;
  total: number;
  success: boolean;
  newRating: number;
  capped: boolean;
}

/**
 * Run experience rolls for every checked skill.
 * Success when roll + bonus > current rating (doc 007). +2 on success,
 * capped at 90 (95 for a skill named by the Advanced Skills talent — the
 * cap here stays 90; SG applies the talent's exception manually).
 */
export function runExperienceRolls(
  checks: string[],
  skillRatings: Record<string, number>,
  experienceBonus: number,
  rng: () => number = Math.random
): ExperienceRollResult[] {
  return checks.map((skill) => {
    const rating = skillRatings[skill] ?? 0;
    const roll = Math.floor(rng() * 100) + 1;
    const total = roll + experienceBonus;
    const success = total > rating;
    let newRating = rating;
    let capped = false;
    if (success) {
      newRating = Math.min(rating + EXPERIENCE_GAIN, ADVANCEMENT_SKILL_CAP);
      capped = rating + EXPERIENCE_GAIN > ADVANCEMENT_SKILL_CAP;
      if (rating >= ADVANCEMENT_SKILL_CAP) {
        newRating = rating;
        capped = true;
      }
    }
    return { skill, rating, roll, bonus: experienceBonus, total, success, newRating, capped };
  });
}

/** Casters gain 2 mana whenever experience rolls are made, capped at INT×5. */
export function manaAfterLevelUp(
  mana: { current: number; max: number } | null | undefined,
  characteristics: Pick<Characteristics, 'INT'>
): { current: number; max: number } | null {
  if (!mana) return null;
  const cap = manaCap({ INT: characteristics.INT } as Characteristics);
  const max = Math.min(mana.max + 2, cap);
  return { current: Math.min(mana.current + 2, max), max };
}

// ---------------------------------------------------------------------------
// Training & research (cap 75)
// ---------------------------------------------------------------------------

export const TRAINING_SKILL_CAP = 75;

export type RollQuality = 'critical' | 'special' | 'success' | 'failure' | 'fumble';

/** Teacher's Teach roll result → skill change (doc 007 §Skill Training). */
export function trainingGain(quality: RollQuality, rng: () => number = Math.random): number {
  const d6 = () => Math.floor(rng() * 6) + 1;
  const d3 = () => Math.floor(rng() * 3) + 1;
  switch (quality) {
    case 'critical': return d6() + 2;
    case 'special': return d6() + 1;
    case 'success': return d6();
    case 'failure': return 0;
    case 'fumble': return -d3();
  }
}

/** Research check result → modifier; gain is +1d4 + modifier after a successful experience roll. */
export function researchGain(quality: RollQuality, rng: () => number = Math.random): number {
  const d4 = () => Math.floor(rng() * 4) + 1;
  switch (quality) {
    case 'critical': return d4() + 2;
    case 'special': return d4() + 1;
    case 'success': return d4();
    case 'failure': return -1;
    case 'fumble': return -2;
  }
}

export function applyTrainingCap(current: number, gain: number): number {
  if (gain <= 0) return Math.max(0, current + gain);
  return Math.min(current + gain, Math.max(current, TRAINING_SKILL_CAP));
}

// ---------------------------------------------------------------------------
// Characteristic training
// ---------------------------------------------------------------------------

/** Hours to raise a characteristic by 1 = value × 25 (errata #25). ~50 downtime hrs/week. */
export function characteristicTrainingPlan(currentValue: number): { hours: number; weeks: number } {
  const hours = currentValue * 25;
  return { hours, weeks: Math.ceil(hours / 50) };
}
