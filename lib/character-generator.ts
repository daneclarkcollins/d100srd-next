/**
 * SagaBorn D100 — Quick Character Generator
 *
 * Rolls a complete random NPC / pickup character from the game-data layer.
 * Every roll follows the canonical creation rules (random method); where the
 * generator makes a play-style choice a human would make (stat assignment,
 * skill point spread, talent picks), it uses sensible archetype-driven
 * heuristics, documented inline.
 *
 * Deterministic: pass a seed to reproduce a character exactly.
 */

import {
  SPECIES, PROFESSIONS, SKILLS, TALENTS, SPELLS, LIFEPATH_TABLES,
  WEAPONS,
} from './game-data';
import type {
  Characteristic, Profession, Skill, Species, Talent, LifepathTable, Archetype,
} from './game-data/types';
import {
  Characteristics, hitPoints, spiritPoints, baseMana, experienceBonus,
  horrorResistance, damageModifier, movement, sizeCategory, categoryBonus,
  personalSkillPoints, PROFESSIONAL_SKILL_POINTS, CREATION_SKILL_CAP,
  STARTING_TALENT_POINTS, startingLanguageCount, STARTING_LANGUAGE_RATING,
  RANDOM_METHOD, archetypeFromRoll,
} from './game-data/rules';
import { rollDice, d100 } from './game-data/dice';

// ---------------------------------------------------------------------------
// Seeded RNG (mulberry32) — reproducible characters
// ---------------------------------------------------------------------------

export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(arr: readonly T[], rng: () => number): T =>
  arr[Math.floor(rng() * arr.length)];

const shuffle = <T,>(arr: readonly T[], rng: () => number): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---------------------------------------------------------------------------
// Output shape
// ---------------------------------------------------------------------------

export interface GeneratedSkill {
  name: string;
  specialty?: string;
  total: number;
  base: number;
  categoryBonus: number;
  allocated: number;
  source: 'profession' | 'personal' | 'lifepath';
}

export interface GeneratedCharacter {
  seed: number;
  name: string;
  species: string;
  profession: string;
  archetype: Archetype;
  characteristics: Characteristics;
  derived: {
    hp: number;
    sp: number;
    mana: number | null;
    horrorResistance: number;
    experienceBonus: number;
    damageModifier: string;
    move: number;
    sizeCategory: string;
  };
  skills: GeneratedSkill[];
  talents: { name: string; cost: number; summary: string }[];
  spells: { name: string; mana: string; summary: string }[];
  equipment: string[];
  fundsGp: number;
  languages: string[];
  lifepath: { label: string; result: string }[];
  age: string;
  traits: string[];
  rollLog: string[];
}

export interface GeneratorOptions {
  seed?: number;
  species?: string;    // exact Species name, or undefined = random
  profession?: string; // exact Profession name, or undefined = roll d100
  archetype?: Archetype; // force archetype (filters talent choices)
}

// ---------------------------------------------------------------------------
// Helpers over game data
// ---------------------------------------------------------------------------

const skillByName = new Map(SKILLS.map((s) => [s.name.replace(/\s*\(various\)$/i, ''), s]));
const talentByName = new Map(TALENTS.map((t) => [t.name, t]));
const table = (id: string): LifepathTable | undefined => LIFEPATH_TABLES.find((t) => t.id === id);

function baseChanceValue(skill: Skill, c: Characteristics): number {
  if (typeof skill.base === 'number') return skill.base;
  if (skill.base === 'per-item') return 0;
  switch (skill.base.formula) {
    case 'INT+ACU': return c.INT + c.ACU;
    case 'DEXx2': return c.DEX * 2;
    case 'INT': return c.INT;
    case 'SOC': return c.SOC;
  }
}

/** Stat-assignment priority per archetype (highest roll → first listed). */
const STAT_PRIORITY: Record<Archetype, Characteristic[]> = {
  Warrior: ['STR', 'CON', 'DEX', 'SOC', 'ACU'],
  Expert: ['DEX', 'ACU', 'SOC', 'CON', 'STR'],
  Mage: ['ACU', 'SOC', 'CON', 'DEX', 'STR'],
};

const MELEE_SKILLS = ['Slashing Weapons', 'Piercing Weapons', 'Bludgeoning Weapons'];

const LANGUAGES = [
  'Common', 'Dweran', 'Dworven', 'Elfin', 'Faun', 'Orog', 'Sylvan',
  'Terian', 'Wastelander', 'Kaal', 'Nethyr',
]; // Restricted (Eldar, Valantian) excluded from random selection

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export function generateCharacter(opts: GeneratorOptions = {}): GeneratedCharacter {
  const seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rng = makeRng(seed);
  const log: string[] = [];

  // --- Species ------------------------------------------------------------
  const species: Species = opts.species
    ? SPECIES.find((s) => s.name === opts.species) ?? pick(SPECIES, rng)
    : pick(SPECIES, rng);
  log.push(`Species: ${species.name}${opts.species ? ' (chosen)' : ' (random)'}`);

  // --- Profession (d100 unless chosen) -------------------------------------
  let profession: Profession;
  if (opts.profession) {
    profession = PROFESSIONS.find((p) => p.name === opts.profession) ?? pick(PROFESSIONS, rng);
    log.push(`Profession: ${profession.name} (chosen)`);
  } else {
    const roll = d100(rng);
    profession =
      PROFESSIONS.find((p) => p.d100 && roll >= p.d100[0] && roll <= p.d100[1]) ??
      pick(PROFESSIONS, rng);
    log.push(`Profession: d100=${roll} → ${profession.name}`);
  }

  // --- Archetype ------------------------------------------------------------
  // Use the profession's recommended archetype unless forced; NPCs stay coherent.
  let archetype: Archetype;
  if (opts.archetype) {
    archetype = opts.archetype;
    log.push(`Archetype: ${archetype} (chosen)`);
  } else if (profession.archetype) {
    archetype = profession.archetype;
    log.push(`Archetype: ${archetype} (profession default)`);
  } else {
    const r = Math.floor(rng() * 10) + 1;
    archetype = archetypeFromRoll(r);
    log.push(`Archetype: 1d10=${r} → ${archetype}`);
  }

  // --- Characteristics (random method) --------------------------------------
  const rolls = RANDOM_METHOD.rolledStats.map(() => rollDice(RANDOM_METHOD.rolledDice, rng));
  rolls.sort((a, b) => b - a);
  const c = {} as Characteristics;
  STAT_PRIORITY[archetype].forEach((stat, i) => { c[stat] = rolls[i]; });
  c.INT = rollDice(RANDOM_METHOD.intDice, rng);
  c.SIZ = rollDice(species.sizRoll, rng);
  log.push(
    `Characteristics: 5×3d6=[${rolls.join(',')}] by ${archetype} priority; INT 2d6+6=${c.INT}; SIZ ${species.sizRoll}=${c.SIZ}`
  );

  // --- Lifepath flavor -------------------------------------------------------
  const lifepath: { label: string; result: string }[] = [];
  const lifepathBonuses: { skill: string; specialty?: string; amount: number }[] = [];
  const rollTable = (id: string, label: string, depth = 0): void => {
    const t = table(id);
    if (!t || depth > 4) return;
    const [lo, hi] = diceBounds(t.die);
    const roll = lo + Math.floor(rng() * (hi - lo + 1));
    const row = t.rows.find((r) => roll >= r.roll[0] && roll <= r.roll[1]) ?? t.rows[0];
    lifepath.push({ label: label || t.title, result: row.result });
    log.push(`${t.id} (${t.die}=${roll}): ${row.result.slice(0, 80)}`);
    if (row.bonus?.skill && typeof row.bonus.amount === 'number') {
      lifepathBonuses.push({ skill: row.bonus.skill, specialty: row.bonus.specialty, amount: row.bonus.amount });
    }
    if (row.next && row.next !== 'PROFESSION') rollTable(row.next, '', depth + 1);
  };
  // Each species enters the lifepath at its own culture table (L1 is only for
  // rolling a random species; culture chains carry their own heritage tables).
  const SPECIES_ENTRY: Record<string, string> = {
    Teran: 'LT2', Dworv: 'LT3', Dweran: 'LT4',
    Elfling: 'F2', 'Feral Elfling': 'F3', Faun: 'F4', Orog: 'F5',
    Elf: 'E1',
  };
  const entry = SPECIES_ENTRY[species.name];
  if (entry && table(entry)) rollTable(entry, 'Culture');
  if (table('H1')) rollTable('H1', 'Important person');
  if (table('H2')) rollTable('H2', 'Family');
  if (table('R1')) rollTable('R1', 'Belief');
  if (table('MAGIC')) rollTable('MAGIC', 'View of magic');
  if (table('P1')) rollTable('P1', 'Passion');
  if (table('AGE')) rollTable('AGE', 'Age');
  const age = lifepath.find((l) => l.label === 'Age')?.result ?? 'Adult';

  // --- Talents ---------------------------------------------------------------
  // Spend 3 TP along the profession's recommended path, honoring prerequisites.
  // Mage archetypes buy a mana-granting talent first.
  const owned = new Set<string>();
  const talents: Talent[] = [];
  let tp = STARTING_TALENT_POINTS;
  const prereqsMet = (t: Talent) =>
    t.prerequisites.every((or) => or.some((r) => r.startsWith('special:') || owned.has(r)));
  const affordable = (pool: Talent[]) =>
    shuffle(pool.filter((t) => !owned.has(t.name) && t.cost <= tp && prereqsMet(t)), rng);
  const buy = (t: Talent) => { owned.add(t.name); talents.push(t); tp -= t.cost; };

  const preferredTrees = profession.talentPaths.length
    ? profession.talentPaths
    : archetype === 'Warrior' ? ['Fighter' as const]
    : archetype === 'Mage' ? ['Luminar' as const, 'Wylder' as const]
    : ['Rogue' as const];
  const treePool = TALENTS.filter((t) => t.trees.some((tr) => preferredTrees.includes(tr)));
  const anyPool = TALENTS.filter((t) => t.trees.some((tr) => ['Skill', 'Combat', 'Special'].includes(tr)));

  if (archetype === 'Mage') {
    const manaTalents = affordable(TALENTS.filter((t) => t.grantsMana));
    if (manaTalents.length) buy(manaTalents[0]);
  }
  let guard = 0;
  while (tp > 0 && guard++ < 20) {
    const options = affordable(treePool);
    const fallback = affordable(anyPool);
    const choice = options[0] ?? fallback[0];
    if (!choice) break;
    buy(choice);
  }
  log.push(`Talents: ${talents.map((t) => `${t.name} (${t.cost})`).join(', ') || 'none affordable'}`);

  // --- Craft (CR01) — rolled after talents so the Artificing gate is known ----
  // The Artificing row itself says: only with a mana-giving Talent, else reroll.
  const manaKnown = talents.some((t) => t.grantsMana);
  let craftSpecialty: string | undefined;
  const cr = table('CR01');
  if (cr) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const [lo, hi] = diceBounds(cr.die);
      const roll = lo + Math.floor(rng() * (hi - lo + 1));
      const row = cr.rows.find((r) => roll >= r.roll[0] && roll <= r.roll[1]);
      let name = (row?.result ?? '').split(/[—:]/)[0].trim();
      if (name === 'Leather Working') name = 'Leatherworking';
      if (name.startsWith('Artificing') && !manaKnown) continue; // reroll per CR01
      craftSpecialty = name || undefined;
      if (craftSpecialty) log.push(`Craft (CR01 ${cr.die}=${roll}): ${craftSpecialty}`);
      break;
    }
    if (!craftSpecialty) craftSpecialty = 'Cooking'; // reroll exhaustion fallback
  }

  // --- Derived stats -----------------------------------------------------------
  const hasMana = manaKnown;
  const derived = {
    hp: hitPoints(c),
    sp: spiritPoints(c),
    mana: hasMana ? baseMana(c) : null,
    horrorResistance: horrorResistance(c),
    experienceBonus: experienceBonus(c),
    damageModifier: damageModifier(c),
    move: movement(c.SIZ),
    sizeCategory: sizeCategory(c.SIZ),
  };

  // --- Skills -----------------------------------------------------------------
  // Professional points: 250 across the profession's 10 grants (weighted spread).
  // Personal points: INT×10 across a few thematic extras. Cap 75 total.
  const skills: GeneratedSkill[] = [];
  const addSkill = (
    name: string, specialty: string | undefined, points: number,
    source: GeneratedSkill['source']
  ): number => {
    const def = skillByName.get(name);
    if (!def) return 0;
    const base = baseChanceValue(def, c);
    const cat = categoryBonus(def.category, c);
    const existing = skills.find((s) => s.name === name && s.specialty === specialty);
    const already = existing ? existing.total : base + cat;
    const room = Math.max(0, CREATION_SKILL_CAP - already);
    const spend = Math.min(points, room);
    if (existing) {
      existing.allocated += spend;
      existing.total += spend;
    } else {
      skills.push({
        name, specialty,
        base, categoryBonus: cat, allocated: spend,
        total: Math.min(base + cat + spend, CREATION_SKILL_CAP),
        source,
      });
    }
    return spend;
  };

  // Resolve profession grants to concrete (skill, specialty) pairs
  const grants: { skill: string; specialty?: string }[] = profession.skills.map((g) => {
    if ('choiceOfGroup' in g) {
      return { skill: g.choiceOfGroup === 'melee-weapon' ? pick(MELEE_SKILLS, rng) : 'Ranged Weapons' };
    }
    if ('choiceOf' in g) return { skill: pick(g.choiceOf, rng) };
    let specialty = g.specialty;
    if (specialty === 'Any') {
      const def = skillByName.get(g.skill);
      specialty = def?.specialties?.length
        ? pick(def.specialties, rng).replace(/\s*\(Restricted\)/i, '')
        : undefined;
      if (g.skill === 'Craft' && craftSpecialty) specialty = craftSpecialty;
    }
    return { skill: g.skill, specialty };
  });

  // Weighted professional spread (sums to 250)
  const weights = [40, 35, 30, 25, 25, 20, 20, 20, 20, 15];
  let professionalLeft = PROFESSIONAL_SKILL_POINTS;
  shuffle(grants, rng).forEach((g, i) => {
    professionalLeft -= addSkill(g.skill, g.specialty, weights[i] ?? 15, 'profession');
  });
  // Redistribute any capped-out remainder onto the character's best skills
  guard = 0;
  while (professionalLeft > 0 && guard++ < 30) {
    const open = skills.filter((s) => s.source === 'profession' && s.total < CREATION_SKILL_CAP);
    if (!open.length) break;
    professionalLeft -= addSkill(pick(open, rng).name, undefined, Math.min(5, professionalLeft), 'profession') || breakLoop();
    function breakLoop() { guard = 99; return 0; }
  }

  // Personal points: Dodge + Spot + archetype-flavored picks
  let personalLeft = personalSkillPoints(c);
  const personalPicks = shuffle(
    ['Dodge', 'Spot', 'Listen', 'First Aid', 'Insight', 'Athletics', 'Stealth', 'Persuade', 'Survival', 'Brawl'],
    rng
  ).slice(0, 5);
  if (hasMana && !grants.some((g) => g.skill === 'Spellcraft')) personalPicks.unshift('Spellcraft');
  for (const name of personalPicks) {
    if (personalLeft <= 0) break;
    const chunk = Math.min(20 + Math.floor(rng() * 11), personalLeft); // 20–30
    personalLeft -= addSkill(name, undefined, chunk, 'personal');
  }

  // Lifepath bonuses (Craftsman +3% etc.)
  for (const b of lifepathBonuses) {
    addSkill(b.skill, b.specialty === 'Any' ? craftSpecialty : b.specialty, b.amount, 'lifepath');
  }
  // The character's craft (INT+ACU base) if not already granted
  if (craftSpecialty && !skills.some((s) => s.name === 'Craft')) {
    addSkill('Craft', craftSpecialty, 0, 'lifepath');
  }
  skills.sort((a, b) => b.total - a.total);

  // --- Spells (mages) -----------------------------------------------------------
  const spells: GeneratedCharacter['spells'] = [];
  if (hasMana) {
    // Approximation: at Talent Point Level 1–3 a starting caster knows a
    // handful of low-mana spells (Spellbook/Spell Memory ≈ 3, Bardic ≈ 1).
    const isBard = owned.has('Bardic Knowledge') && !owned.has('Spellbook') && !owned.has('Spell Memory');
    const count = isBard ? 1 : 3;
    const castable = SPELLS.filter((s) => {
      const min = s.mana.flat ?? s.mana.tiers?.[0]?.mana ?? s.mana.min ?? 1;
      return min <= 2;
    });
    for (const s of shuffle(castable, rng).slice(0, count)) {
      const manaStr = s.mana.flat != null ? String(s.mana.flat)
        : s.mana.tiers ? s.mana.tiers.map((t) => t.mana).join('/')
        : `${s.mana.min ?? 1}+/level`;
      spells.push({ name: s.name, mana: manaStr, summary: s.summary });
    }
    log.push(`Spells (${count}): ${spells.map((s) => s.name).join(', ')}`);
  }

  // --- Equipment & funds ----------------------------------------------------------
  const equipment = profession.equipment.map((e) => {
    if (/^a light weapon$/i.test(e.trim())) {
      const w = pick(WEAPONS.filter((w) => w.class === 'Light'), rng);
      return `${w.name} (light weapon)`;
    }
    if (/^an? medium weapon$|^a medium weapon$/i.test(e.trim())) {
      const w = pick(WEAPONS.filter((w) => w.class === 'Medium'), rng);
      return `${w.name} (medium weapon)`;
    }
    return e;
  });
  const fundsGp = rollDice(profession.funds, rng);
  log.push(`Funds: ${profession.funds} = ${fundsGp} gp`);

  // --- Languages --------------------------------------------------------------------
  const langCount = startingLanguageCount(c.INT);
  const languages = ['Common', ...shuffle(LANGUAGES.filter((l) => l !== 'Common'), rng).slice(0, Math.max(0, langCount - 1))]
    .map((l) => `${l} (${STARTING_LANGUAGE_RATING}%)`);

  const name = species.commonNames?.length ? pick(species.commonNames, rng) : 'Unnamed';

  return {
    seed,
    name,
    species: species.name,
    profession: profession.name,
    archetype,
    characteristics: c,
    derived,
    skills,
    talents: talents.map((t) => ({ name: t.name, cost: t.cost, summary: t.summary })),
    spells,
    equipment,
    fundsGp,
    languages,
    lifepath,
    age,
    traits: species.traits,
    rollLog: log,
  };
}

function diceBounds(die: string): [number, number] {
  // local import-free bounds (diceRange throws on odd expressions)
  try {
    const m = /^(\d+)d(\d+)([+-]\d+)?$/i.exec(die.trim());
    if (m) {
      const n = +m[1], s = +m[2], b = m[3] ? +m[3] : 0;
      return [n + b, n * s + b];
    }
  } catch { /* fall through */ }
  return [1, 100];
}
