/**
 * Stress-test the quick character generator: 1000 random seeds plus every
 * species × archetype combo and every profession, asserting rule invariants.
 * Run: npx tsx scripts/test-generator.ts
 */
import { generateCharacter } from '../lib/character-generator';
import { generateName, generateNames, NAME_SPECIES, makeRng as nameRng } from '../lib/name-generator';
import { SPECIES, PROFESSIONS } from '../lib/game-data';
import { CREATION_SKILL_CAP, POINT_BUY } from '../lib/game-data/rules';

let failures = 0;
const fail = (seed: number, msg: string) => {
  failures++;
  if (failures <= 20) console.error(`  ✗ seed ${seed}: ${msg}`);
};

function check(opts: Parameters<typeof generateCharacter>[0]) {
  const ch = generateCharacter(opts);
  const { seed, characteristics: c } = ch;

  // Characteristics in legal random-method ranges
  for (const stat of ['STR', 'CON', 'ACU', 'DEX', 'SOC'] as const) {
    if (c[stat] < 3 || c[stat] > 18) fail(seed, `${stat}=${c[stat]} outside 3–18`);
  }
  if (c.INT < 8 || c.INT > 18) fail(seed, `INT=${c.INT} outside 8–18`);
  if (c.SIZ < 4 || c.SIZ > 22) fail(seed, `SIZ=${c.SIZ} outside plausible species range`);

  // Derived
  if (ch.derived.hp !== c.CON + c.SIZ) fail(seed, `HP ${ch.derived.hp} != CON+SIZ ${c.CON + c.SIZ}`);
  if (ch.derived.sp !== c.ACU) fail(seed, `SP != ACU`);
  if (ch.derived.horrorResistance !== c.ACU * 5) fail(seed, `HR != ACU*5`);

  // Skills capped and internally consistent
  for (const s of ch.skills) {
    if (s.total > CREATION_SKILL_CAP) fail(seed, `skill ${s.name} total ${s.total} > ${CREATION_SKILL_CAP}`);
    if (s.total !== Math.min(s.base + s.categoryBonus + s.allocated, CREATION_SKILL_CAP)) {
      fail(seed, `skill ${s.name} total mismatch`);
    }
  }

  // Talent spend within budget; prereq closure
  const spent = ch.talents.reduce((a, t) => a + t.cost, 0);
  if (spent > 3) fail(seed, `talent spend ${spent} > 3 TP`);
  if (ch.archetype === 'Mage' && ch.derived.mana === null) fail(seed, `Mage with no mana talent`);
  if (ch.derived.mana !== null && ch.derived.mana !== Math.floor(c.ACU / 2)) {
    fail(seed, `mana ${ch.derived.mana} != floor(ACU/2)`);
  }
  if (ch.derived.mana !== null && ch.spells.length === 0) fail(seed, `caster knows no spells`);
  if (ch.derived.mana === null && ch.spells.length > 0) fail(seed, `non-caster knows spells`);

  // Reproducibility
  const again = generateCharacter({ ...opts, seed });
  if (JSON.stringify(again) !== JSON.stringify(ch)) fail(seed, `not reproducible from seed`);

  return ch;
}

console.log('1000 random characters...');
for (let i = 0; i < 1000; i++) check({ seed: 42_000 + i });

console.log('every species × archetype...');
for (const sp of SPECIES) {
  for (const arch of ['Warrior', 'Expert', 'Mage'] as const) {
    for (let i = 0; i < 5; i++) check({ seed: 7_000 + i, species: sp.name, archetype: arch });
  }
}

console.log('every profession...');
for (const p of PROFESSIONS) {
  for (let i = 0; i < 5; i++) check({ seed: 11_000 + i, profession: p.name });
}

// Distribution sanity: professions should roughly follow their d100 weights
const seen = new Map<string, number>();
for (let i = 0; i < 2000; i++) {
  const ch = generateCharacter({ seed: 90_000 + i });
  seen.set(ch.profession, (seen.get(ch.profession) ?? 0) + 1);
}
const missing = PROFESSIONS.filter((p) => !seen.has(p.name)).map((p) => p.name);
if (missing.length > 3) { failures++; console.error(`  ✗ professions never rolled in 2000 tries: ${missing.join(', ')}`); }

// --- point-buy costs (002; Dane's bug report 2026-07-24: builder was flat-charging 2/pt for INT/ACU) ---
{
  const spend = (char: any, to: number) => {
    let c = 0;
    for (let v = 10; v < to; v++) c += POINT_BUY.cost(char, v);
    return c;
  };
  if (POINT_BUY.cost('INT', 10) !== 1) { failures++; console.error('  ✗ INT 10→11 costs 1'); }
  if (POINT_BUY.cost('ACU', 12) !== 1) { failures++; console.error('  ✗ ACU 12→13 costs 1'); }
  if (POINT_BUY.cost('DEX', 13) !== 3) { failures++; console.error('  ✗ DEX 13→14 costs 3'); }
  if (POINT_BUY.cost('INT', 16) !== 4) { failures++; console.error('  ✗ INT 16→17 costs 4'); }
  if (POINT_BUY.cost('STR', 14) !== 1) { failures++; console.error('  ✗ STR 14→15 costs 1'); }
  if (POINT_BUY.cost('STR', 15) !== 2) { failures++; console.error('  ✗ STR 15→16 costs 2'); }
  if (spend('INT', 13) !== 3) { failures++; console.error('  ✗ INT 10→13 totals 3'); }
  if (spend('INT', 16) !== 12) { failures++; console.error('  ✗ INT 10→16 totals 12'); }
  if (spend('INT', 19) !== 24) { failures++; console.error('  ✗ INT 10→19 totals 24 (the whole pool)'); }
  if (spend('SOC', 19) !== 13) { failures++; console.error('  ✗ SOC 10→19 totals 13'); }
  if (POINT_BUY.refund('ACU') !== 2 || POINT_BUY.refund('CON') !== 1) { failures++; console.error('  ✗ refunds 2 (DEX/INT/ACU) / 1 (others)'); }
}

// --- name generator ---------------------------------------------------------
{
  for (const sp of NAME_SPECIES) {
    const batch = generateNames(sp, 12, nameRng(1234));
    if (batch.length !== 12) { failures++; console.error(`  ✗ ${sp}: batch of 12 unique names`); }
    for (const n of batch) {
      if (!(n.name.length >= 2 && n.name.length <= 14)) { failures++; console.error(`  ✗ ${sp}: name length sane (${n.name})`); }
      if (!/^[A-Z][a-z]+$/.test(n.name) && !/^[A-Z][a-z]*$/.test(n.name)) { failures++; console.error(`  ✗ ${sp}: name shape (${n.name})`); }
      if (n.species !== sp) { failures++; console.error(`  ✗ ${sp}: species tag`); }
    }
    const a = generateNames(sp, 6, nameRng(777)).map((n: { name: string }) => n.name).join(',');
    const b = generateNames(sp, 6, nameRng(777)).map((n: { name: string }) => n.name).join(',');
    if (a !== b) { failures++; console.error(`  ✗ ${sp}: names reproducible from seed`); }
  }
  const anyBatch = generateNames('Any', 20, nameRng(5));
  if (anyBatch.length !== 20) { failures++; console.error('  ✗ Any-species batch of 20'); }
  const elfling = Array.from({ length: 30 }, (_, i) => generateName('Elfling', nameRng(100 + i)));
  if (!elfling.some((n: { detail?: string }) => n.detail?.startsWith('short for '))) {
    failures++; console.error('  ✗ Elflings sometimes carry a long true name');
  }
}

console.log(`\n${failures === 0 ? '✓ all generator invariants hold' : `${failures} failure(s)`}`);
const sample = generateCharacter({ seed: 20260714 });
console.log(`\nSample (seed 20260714): ${sample.species} ${sample.profession} (${sample.archetype})`);
console.log(`  Stats: ${Object.entries(sample.characteristics).map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(`  HP ${sample.derived.hp}, SP ${sample.derived.sp}, Mana ${sample.derived.mana ?? '—'}, DM ${sample.derived.damageModifier}, MOV ${sample.derived.move}`);
console.log(`  Talents: ${sample.talents.map((t) => t.name).join(', ')}`);
console.log(`  Top skills: ${sample.skills.slice(0, 5).map((s) => `${s.name}${s.specialty ? ` (${s.specialty})` : ''} ${s.total}%`).join(', ')}`);
console.log(`  Funds: ${sample.fundsGp} gp; Languages: ${sample.languages.join(', ')}`);
process.exit(failures === 0 ? 0 : 1);
