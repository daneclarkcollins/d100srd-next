/**
 * SagaBorn D100 — structured creature stat blocks.
 *
 * Encoded from the canonical monster docs (BRP Monsters Drive folder) via the
 * content/creatures MDX pages. One record per stat block — multi-variant
 * creatures (goblins, elves, skeletons, orlocks...) contribute several records
 * sharing a slug. Records power the encounter builder; the MDX pages remain
 * the human-readable source at /creatures/<slug>.
 */

export interface CreatureStatBlock {
  slug: string;
  name: string;
  pageTitle: string;
  cv: number | null;
  hp: number | null;
  av: number | null;
  avNote?: string;
  speed?: string;
  dmgMod?: string;
  class?: string;
  type?: string;
  horror?: string;
  treasure?: string;
  characteristics?: Partial<Record<'STR' | 'CON' | 'SIZ' | 'INT' | 'ACU' | 'DEX' | 'SOC', number>>;
  attacks: string[];
  skills?: string;
  special: string[];
  weaknesses?: string;
  habitat?: string;
  encounter?: string;
}

import { CREATURES_A } from './creatures-a';
import { CREATURES_B } from './creatures-b';

export const CREATURES: CreatureStatBlock[] = [...CREATURES_A, ...CREATURES_B];

/**
 * NPC tier upgrades from the Creature Compendium (doc 012) / encounter
 * guidance: Minions are ½ CV (half HP, no Dodge/Parry); Champions double
 * survivability (2× HP, 65% Dodge, Resistant); Bosses triple it.
 */
export const CREATURE_TIERS = [
  { key: 'minion', label: 'Minion', cvMultiplier: 0.5, note: '½ HP, no Dodge/Parry' },
  { key: 'standard', label: 'Standard', cvMultiplier: 1, note: 'as printed' },
  { key: 'champion', label: 'Champion', cvMultiplier: 2, note: '2× HP, 65% Dodge, Resistant' },
  { key: 'boss', label: 'Boss', cvMultiplier: 3, note: '3× HP, 75% Dodge, Resistant' },
] as const;

/**
 * Encounter difficulty vs Party Combat Value (PCV = sum of hero TPLs),
 * per doc 012's encounter-building guidance.
 */
export const ENCOUNTER_DIFFICULTY = [
  { key: 'easy', label: 'Easy', ratio: 0.5 },
  { key: 'moderate', label: 'Moderate', ratio: 0.75 },
  { key: 'balanced', label: 'Balanced', ratio: 1.0 },
  { key: 'hard', label: 'Hard', ratio: 1.25 },
  { key: 'deadly', label: 'Deadly', ratio: 1.5 },
] as const;

export function difficultyFor(enemyCv: number, partyCv: number): string {
  if (partyCv <= 0) return '—';
  const r = enemyCv / partyCv;
  if (r < 0.625) return 'Easy';
  if (r < 0.875) return 'Moderate';
  if (r < 1.125) return 'Balanced';
  if (r < 1.5) return 'Hard';
  return 'Deadly';
}
