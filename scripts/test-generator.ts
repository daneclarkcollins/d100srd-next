/**
 * Stress-test the quick character generator: 1000 random seeds plus every
 * species × archetype combo and every profession, asserting rule invariants.
 * Run: npx tsx scripts/test-generator.ts
 */
import { generateCharacter } from '../lib/character-generator';
import { SPECIES, PROFESSIONS } from '../lib/game-data';
import { CREATION_SKILL_CAP } from '../lib/game-data/rules';

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

console.log(`\n${failures === 0 ? '✓ all generator invariants hold' : `${failures} failure(s)`}`);
const sample = generateCharacter({ seed: 20260714 });
console.log(`\nSample (seed 20260714): ${sample.species} ${sample.profession} (${sample.archetype})`);
console.log(`  Stats: ${Object.entries(sample.characteristics).map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(`  HP ${sample.derived.hp}, SP ${sample.derived.sp}, Mana ${sample.derived.mana ?? '—'}, DM ${sample.derived.damageModifier}, MOV ${sample.derived.move}`);
console.log(`  Talents: ${sample.talents.map((t) => t.name).join(', ')}`);
console.log(`  Top skills: ${sample.skills.slice(0, 5).map((s) => `${s.name}${s.specialty ? ` (${s.specialty})` : ''} ${s.total}%`).join(', ')}`);
console.log(`  Funds: ${sample.fundsGp} gp; Languages: ${sample.languages.join(', ')}`);
process.exit(failures === 0 ? 0 : 1);
