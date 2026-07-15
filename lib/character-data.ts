/**
 * Character-builder data adapter.
 *
 * HISTORICAL NOTE: this file used to carry its own hand-written copies of the
 * species/culture/profession/skill tables, which had drifted a full generation
 * from the rules (some entries were from a different game system entirely).
 * Everything below is now DERIVED from lib/game-data — the single canonical,
 * validated data layer. Do not add hand-written rules data here.
 */

import { SPECIES, PROFESSIONS, SKILLS, LIFEPATH_TABLES } from './game-data';
import type { LifepathTable, SkillGrant, Characteristic } from './game-data/types';
import { movement } from './game-data/rules';
import { diceRange } from './game-data/dice';

// ---------------------------------------------------------------------------
// Interfaces (unchanged — the builder UI consumes these shapes)
// ---------------------------------------------------------------------------

export interface SpeciesChoice {
  range: [number, number];
  result: string;
  description: string;
  nextTable?: string;
  stats?: {
    lifespan?: number;
    height?: string;
    weight?: string;
    speed?: number;
    equipment?: string;
    funds?: string;
  };
  abilities?: string[];
}

export interface Character {
  name: string;
  species: string | null;
  biology: string | null;
  culture: string | null;
  heritage: string | null;
  profession: string | null;
  archetype: string | null;
  age: number | null;
  characteristics: {
    STR: number;
    CON: number;
    SIZ: number;
    INT: number;
    ACU: number;
    DEX: number;
    SOC: number;
  };
  derivedStats: {
    effort: number;
    stamina: number;
    intellect: number;
    spirit: number;
    agility: number;
    charm: number;
    hitPoints: number;
    spiritPoints: number;
    damageModifier: string;
    experienceBonus: number;
    movementSpeed: number;
    horrorResistance: number;
  };
  skills: Record<string, number>;
  lifespan: number;
  height: string;
  weight: string;
  speed: number;
  specialAbilities: string[];
  startingEquipment: string[];
  startingFunds: string;
  startingFundsAmount: number;
  currentStep: string;
}

// ---------------------------------------------------------------------------
// Internal helpers over the game-data layer
// ---------------------------------------------------------------------------

const lp = (id: string): LifepathTable =>
  LIFEPATH_TABLES.find((t) => t.id === id) ?? { id, title: id, die: '1d10', rows: [] };

/** "Name: description text." → { name, description } */
const splitResult = (result: string): { name: string; description: string } => {
  const idx = result.indexOf(':');
  if (idx === -1) return { name: result.replace(/\.$/, '').trim(), description: '' };
  return { name: result.slice(0, idx).trim(), description: result.slice(idx + 1).trim() };
};

/** Biology row name (as printed in the lifepath docs) → Species record name. */
const BIOLOGY_TO_SPECIES: Record<string, string> = {
  Teran: 'Teran',
  Dworven: 'Dworv',
  Dweran: 'Dweran',
  Elfling: 'Elfling',
  'Feral elfling': 'Feral Elfling',
  'Feral Elfling': 'Feral Elfling',
  Faun: 'Faun',
  Orog: 'Orog',
  Elven: 'Elf',
};

function statsForSpecies(biologyName: string): SpeciesChoice['stats'] {
  const sp = SPECIES.find((s) => s.name === (BIOLOGY_TO_SPECIES[biologyName] ?? biologyName));
  if (!sp) return undefined;
  const [lo, hi] = safeDiceRange(sp.sizRoll);
  const midSiz = Math.round((lo + hi) / 2);
  return {
    lifespan: typeof sp.lifespan === 'number' ? sp.lifespan : undefined,
    height: sp.avgHeight,
    weight: sp.avgWeight,
    speed: movement(midSiz), // MOV derives from SIZ (errata ruling 4)
  };
}

function abilitiesForSpecies(biologyName: string): string[] | undefined {
  const sp = SPECIES.find((s) => s.name === (BIOLOGY_TO_SPECIES[biologyName] ?? biologyName));
  return sp?.traits.length ? sp.traits : undefined;
}

function safeDiceRange(expr: string): [number, number] {
  try { return diceRange(expr); } catch { return [10, 10]; }
}

const rowToChoice = (
  row: { roll: [number, number]; result: string; next?: string },
  nextTable?: string,
  withSpecies = false
): SpeciesChoice => {
  const { name, description } = splitResult(row.result);
  return {
    range: row.roll,
    result: name,
    description,
    nextTable,
    ...(withSpecies ? { stats: statsForSpecies(name), abilities: abilitiesForSpecies(name) } : {}),
  };
};

// ---------------------------------------------------------------------------
// Lifepath tables for the builder (derived from game-data lifepath)
// ---------------------------------------------------------------------------

const NEXT_BY_TABLE: Record<string, string> = {
  LT1: 'terian', F1: 'fey', E1: 'elven',
  LT2: 'teranCulture', LT3: 'dworvenCulture', LT4: 'dweranCulture',
  F2: 'elflingCulture', F3: 'feralElflingCulture', F4: 'faunCulture', F5: 'orogCulture',
};

export const speciesTable: SpeciesChoice[] = lp('L1').rows.map((r) =>
  rowToChoice(r, r.next ? NEXT_BY_TABLE[r.next] : undefined)
);

export const terianBiologyTable: SpeciesChoice[] = lp('LT1').rows.map((r) =>
  rowToChoice(r, r.next ? NEXT_BY_TABLE[r.next] : undefined, true)
);

export const feyBiologyTable: SpeciesChoice[] = lp('F1').rows.map((r) =>
  rowToChoice(r, r.next ? NEXT_BY_TABLE[r.next] : undefined, true)
);

export const elvenCultureTable: SpeciesChoice[] = lp('E1').rows.map((r) => ({
  ...rowToChoice(r),
  stats: statsForSpecies('Elven'),
  abilities: abilitiesForSpecies('Elven'),
}));

const cultureTable = (id: string): SpeciesChoice[] => lp(id).rows.map((r) => rowToChoice(r));

export const teranCultureTable: SpeciesChoice[] = cultureTable('LT2');
export const dworvenCultureTable: SpeciesChoice[] = cultureTable('LT3');
export const dweranCultureTable: SpeciesChoice[] = cultureTable('LT4');
export const elflingCultureTable: SpeciesChoice[] = cultureTable('F2');
export const feralElflingCultureTable: SpeciesChoice[] = cultureTable('F3');
export const faunCultureTable: SpeciesChoice[] = cultureTable('F4');
export const orogCultureTable: SpeciesChoice[] = cultureTable('F5');

export const archetypeTable: SpeciesChoice[] = lp('ARCHETYPE').rows.map((r) => {
  const [name, rest] = r.result.split('—').map((s) => s.trim());
  return { range: r.roll, result: name, description: rest ?? '' };
});

// ---------------------------------------------------------------------------
// Skills (derived from the canonical skill list)
// ---------------------------------------------------------------------------

const displaySkillName = (name: string) => name.replace(/\s*\(various\)$/i, '');

/** Legacy lowercase category keys, preserved for the SkillSelection UI. */
export const skillCategories: Record<
  string,
  { characteristic: Characteristic; skills: string[] }
> = (() => {
  const keyMap: Record<string, string> = {
    Communication: 'communication',
    Perception: 'perception',
    Dexterous: 'dexterous',
    Mental: 'mental',
    Physical: 'physical',
    Combat: 'combat',
  };
  const charMap = {
    Communication: 'SOC', Perception: 'ACU', Dexterous: 'DEX',
    Mental: 'INT', Physical: 'STR', Combat: 'DEX',
  } as const;
  const out: Record<string, { characteristic: Characteristic; skills: string[] }> = {};
  for (const skill of SKILLS) {
    const key = keyMap[skill.category];
    if (!out[key]) out[key] = { characteristic: charMap[skill.category], skills: [] };
    out[key].skills.push(displaySkillName(skill.name));
  }
  for (const k of Object.keys(out)) out[k].skills.sort();
  return out;
})();

/**
 * Flat base chances. Formula-based skills (Craft/Gaming INT+ACU, Dodge DEX×2)
 * are 0 here — use getSkillBase(name, characteristics) for the true value.
 */
export const skillBaseChances: Record<string, number> = Object.fromEntries(
  SKILLS.map((s) => [displaySkillName(s.name), typeof s.base === 'number' ? s.base : 0])
);

/** True base chance for a skill given a character's characteristics. */
export function getSkillBase(
  skillName: string,
  characteristics?: Partial<Record<Characteristic, number>>
): number {
  const skill = SKILLS.find((s) => displaySkillName(s.name) === skillName);
  if (!skill) return skillBaseChances[skillName] ?? 0;
  if (typeof skill.base === 'number') return skill.base;
  if (skill.base === 'per-item') return 0;
  const c = characteristics ?? {};
  switch (skill.base.formula) {
    case 'INT+ACU': return (c.INT ?? 0) + (c.ACU ?? 0);
    case 'DEXx2': return (c.DEX ?? 0) * 2;
    case 'INT': return c.INT ?? 0;
    case 'SOC': return c.SOC ?? 0;
  }
}

// ---------------------------------------------------------------------------
// Professions (derived from the canonical profession data)
// ---------------------------------------------------------------------------

const grantDisplay = (g: SkillGrant): string => {
  if ('choiceOfGroup' in g) {
    return g.choiceOfGroup === 'melee-weapon' ? 'Melee Weapon Skill (Any)' : 'Ranged Weapons';
  }
  if ('choiceOf' in g) return `Choice of ${g.choiceOf.join(' or ')}`;
  return g.specialty ? `${g.skill} (${g.specialty})` : g.skill;
};

export const professionSkills: Record<string, string[]> = Object.fromEntries(
  PROFESSIONS.map((p) => [p.name, p.skills.map(grantDisplay)])
);

export const professionTable: SpeciesChoice[] = [...PROFESSIONS]
  .filter((p) => p.d100)
  .sort((a, b) => a.d100![0] - b.d100![0])
  .map((p) => ({
    range: p.d100!,
    result: p.name,
    description: p.description ?? '',
    stats: {
      equipment: p.equipment.join(', ') + `, ${p.contacts} contact${p.contacts === 1 ? '' : 's'}`,
      funds: `${p.funds} gp`,
    },
    abilities: p.skills.map(grantDisplay),
  }));

/** Funds dice expression for a profession (e.g. "1d4x10+10"). */
export function professionFunds(professionName: string | null): string {
  return PROFESSIONS.find((p) => p.name === professionName)?.funds ?? '1d4x10+10';
}

// ---------------------------------------------------------------------------
// Builder plumbing (unchanged API)
// ---------------------------------------------------------------------------

export const createNewCharacter = (): Character => ({
  name: '',
  species: null,
  biology: null,
  culture: null,
  heritage: null,
  profession: null,
  archetype: null,
  age: null,
  characteristics: {
    STR: 0, CON: 0, SIZ: 0, INT: 0, ACU: 0, DEX: 0, SOC: 0
  },
  derivedStats: {
    effort: 0, stamina: 0, intellect: 0, spirit: 0, agility: 0, charm: 0,
    hitPoints: 0, spiritPoints: 0, damageModifier: 'None', experienceBonus: 0,
    movementSpeed: 25, horrorResistance: 0
  },
  skills: {},
  lifespan: 0,
  height: '',
  weight: '',
  speed: 25,
  specialAbilities: [],
  startingEquipment: [],
  startingFunds: '',
  startingFundsAmount: 0,
  currentStep: 'species'
});

export const rollDice = (sides: number, count: number = 1): number[] => {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
};

export const getTableForStep = (step: string) => {
  switch (step) {
    case 'species': return speciesTable;
    case 'terian': return terianBiologyTable;
    case 'fey': return feyBiologyTable;
    case 'elven': return elvenCultureTable;
    case 'teranCulture': return teranCultureTable;
    case 'dworvenCulture': return dworvenCultureTable;
    case 'dweranCulture': return dweranCultureTable;
    case 'elflingCulture': return elflingCultureTable;
    case 'feralElflingCulture': return feralElflingCultureTable;
    case 'faunCulture': return faunCultureTable;
    case 'orogCulture': return orogCultureTable;
    case 'profession': return professionTable;
    case 'archetype': return archetypeTable;
    default: return [];
  }
};
