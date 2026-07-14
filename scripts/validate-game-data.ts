/**
 * SagaBorn D100 game-data referential-integrity validator.
 *
 * Run: npm run validate:data   (npx tsx scripts/validate-game-data.ts)
 *
 * Catches the whole class of "name that doesn't join" and "table that doesn't
 * tile" errors found in the July 2026 rules audit — automatically, every time
 * the data is re-encoded after Mike edits the canonical docs.
 */

import { SKILLS } from '../lib/game-data/skills';
import { TALENTS } from '../lib/game-data/talents';
import { SPECIES } from '../lib/game-data/species';
import { LIFEPATH_TABLES } from '../lib/game-data/lifepath';
import { PROFESSIONS } from '../lib/game-data/professions';
import { SPELLS } from '../lib/game-data/spells';
import { WEAPONS, ARMOR, GEAR } from '../lib/game-data/equipment';
import { parseDice, diceRange } from '../lib/game-data/dice';

let errors = 0;
let warnings = 0;
const err = (msg: string) => { errors++; console.error(`  ✗ ${msg}`); };
const warn = (msg: string) => { warnings++; console.warn(`  ⚠ ${msg}`); };
const section = (name: string) => console.log(`\n${name}`);

// Normalize a skill name for lookup: strip "(various)" suffixes.
const skillKey = (name: string) => name.replace(/\s*\(various\)\s*$/i, '').trim();
const skillNames = new Set(SKILLS.map((s) => skillKey(s.name)));
const talentNames = new Set(TALENTS.map((t) => t.name));
const tableIds = new Set(LIFEPATH_TABLES.map((t) => t.id));
const professionNames = new Set(PROFESSIONS.map((p) => p.name));

// ---------------------------------------------------------------------------
section('Duplicates');
for (const [label, names] of [
  ['skill', SKILLS.map((s) => s.name)],
  ['talent', TALENTS.map((t) => t.name)],
  ['species', SPECIES.map((s) => s.name)],
  ['profession', PROFESSIONS.map((p) => p.name)],
  ['spell', SPELLS.map((s) => s.name)],
  ['weapon', WEAPONS.map((w) => w.name)],
  ['armor', ARMOR.map((a) => a.name)],
  ['gear', GEAR.map((g) => g.name)],
  ['lifepath table', LIFEPATH_TABLES.map((t) => t.id)],
] as const) {
  const seen = new Set<string>();
  for (const n of names) {
    if (seen.has(n)) err(`duplicate ${label}: "${n}"`);
    seen.add(n);
  }
}

// ---------------------------------------------------------------------------
section('Professions');
for (const p of PROFESSIONS) {
  if (p.skills.length !== 10) warn(`${p.name}: ${p.skills.length} skill grants (expected 10)`);
  for (const g of p.skills) {
    if ('skill' in g && !skillNames.has(skillKey(g.skill))) {
      err(`${p.name}: grants unknown skill "${g.skill}"`);
    }
    if ('choiceOf' in g) {
      for (const s of g.choiceOf) {
        if (!skillNames.has(skillKey(s))) err(`${p.name}: choiceOf unknown skill "${s}"`);
      }
    }
  }
  if (!parseDice(p.funds)) err(`${p.name}: unparseable funds "${p.funds}"`);
  for (const path of p.talentPaths) {
    if (!TALENTS.some((t) => t.trees.includes(path))) {
      warn(`${p.name}: talent path "${path}" has no talents`);
    }
  }
}
// d100 tiling
{
  const covered = new Array<string | null>(101).fill(null);
  for (const p of PROFESSIONS) {
    if (!p.d100) continue;
    const [lo, hi] = p.d100;
    for (let i = lo; i <= hi; i++) {
      if (covered[i]) err(`profession d100 overlap at ${i}: ${covered[i]} vs ${p.name}`);
      covered[i] = p.name;
    }
  }
  for (let i = 1; i <= 100; i++) if (!covered[i]) err(`profession d100 gap at ${i}`);
}

// ---------------------------------------------------------------------------
section('Talents');
for (const t of TALENTS) {
  for (const orGroup of t.prerequisites) {
    for (const req of orGroup) {
      if (req.startsWith('special:')) continue;
      if (!talentNames.has(req)) err(`${t.name}: prerequisite "${req}" is not a talent`);
    }
  }
  if (t.cost < 1 || t.cost > 3) warn(`${t.name}: unusual cost ${t.cost}`);
}
// Every tree that professions reference must be reachable: root talents exist (no prereqs or special-only)
for (const tree of new Set(TALENTS.flatMap((t) => t.trees))) {
  const inTree = TALENTS.filter((t) => t.trees.includes(tree));
  const hasRoot = inTree.some((t) =>
    t.prerequisites.length === 0 ||
    t.prerequisites.every((g) => g.every((r) => r.startsWith('special:')))
  );
  if (!hasRoot) warn(`tree "${tree}" has no prerequisite-free root talent`);
}

// ---------------------------------------------------------------------------
section('Species');
for (const s of SPECIES) {
  if (!parseDice(s.sizRoll)) err(`${s.name}: unparseable sizRoll "${s.sizRoll}"`);
}

// ---------------------------------------------------------------------------
section('Lifepath tables');
for (const t of LIFEPATH_TABLES) {
  const range = diceRangeSafe(t.die);
  if (!range) { err(`${t.id}: unparseable die "${t.die}"`); continue; }
  const [min, max] = range;
  const covered = new Array<number>(max + 1).fill(0);
  for (const row of t.rows) {
    const [lo, hi] = row.roll;
    if (lo > hi) err(`${t.id}: inverted range ${lo}-${hi}`);
    for (let i = lo; i <= hi; i++) if (i >= min && i <= max) covered[i]++;
    if (row.next && !tableIds.has(row.next)) err(`${t.id}: next table "${row.next}" not found`);
    if (row.bonus?.skill && !skillNames.has(skillKey(row.bonus.skill))) {
      err(`${t.id}: bonus references unknown skill "${row.bonus.skill}"`);
    }
  }
  for (let i = min; i <= max; i++) {
    if (covered[i] === 0) warn(`${t.id}: die value ${i} not covered`);
    if (covered[i] > 1) err(`${t.id}: die value ${i} covered ${covered[i]} times`);
  }
}
// PROFESSION table results must be real professions
const profTable = LIFEPATH_TABLES.find((t) => t.id === 'PROFESSION');
if (profTable) {
  for (const row of profTable.rows) {
    if (!professionNames.has(row.result)) {
      err(`PROFESSION table row ${row.roll[0]}-${row.roll[1]}: "${row.result}" is not a profession`);
    }
  }
} else warn('no PROFESSION lifepath table found');

// ---------------------------------------------------------------------------
section('Spells');
for (const s of SPELLS) {
  if (s.mana.flat === undefined && !s.mana.tiers?.length && !s.mana.perLevel) {
    err(`${s.name}: no mana cost model`);
  }
}

// ---------------------------------------------------------------------------
section('Equipment');
for (const w of WEAPONS) {
  if (!skillNames.has(skillKey(w.skill))) err(`weapon ${w.name}: unknown skill "${w.skill}"`);
  if (w.damage !== '0' && !parseDice(w.damage)) err(`weapon ${w.name}: unparseable damage "${w.damage}"`);
  if (w.grip2h && !parseDice(w.grip2h.damage)) err(`weapon ${w.name}: unparseable 2h damage`);
}
for (const a of ARMOR) {
  if (a.av < 0 || a.av > 10) warn(`armor ${a.name}: suspicious AV ${a.av}`);
}

// ---------------------------------------------------------------------------
// Cross-check: profession equipment strings that name specific catalog items
section('Profession equipment references');
const catalog = new Set(
  [...WEAPONS, ...ARMOR, ...GEAR].map((i) => i.name.toLowerCase())
);
const GENERIC = /^(a |an |any |\d|two |three |basic|fine|traveler|set of|kit of|assorted|soft leather armor|light weapon|medium weapon|large weapon|clothing)/i;
for (const p of PROFESSIONS) {
  for (const e of p.equipment) {
    const s = e.toLowerCase().trim();
    if (GENERIC.test(s)) continue;
    if (!catalog.has(s)) warn(`${p.name}: equipment "${e}" not in catalog (ok if intentionally generic)`);
  }
}

// ---------------------------------------------------------------------------
function diceRangeSafe(expr: string): [number, number] | null {
  try { return diceRange(expr); } catch { return null; }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Validation complete: ${errors} error(s), ${warnings} warning(s)`);
console.log(`Datasets: ${SKILLS.length} skills, ${TALENTS.length} talents, ${SPECIES.length} species, ${PROFESSIONS.length} professions, ${SPELLS.length} spells, ${WEAPONS.length} weapons, ${ARMOR.length} armor, ${GEAR.length} gear, ${LIFEPATH_TABLES.length} lifepath tables`);
process.exit(errors > 0 ? 1 : 0);
