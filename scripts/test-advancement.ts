/**
 * Advancement engine invariants. Run: npx tsx scripts/test-advancement.ts
 */
import {
  emptyAdvancement, normalizeAdvancement, talentPointLevel, spentTalentPoints,
  unspentTalentPoints, learnableTalents, runExperienceRolls, manaAfterLevelUp,
  trainingGain, researchGain, applyTrainingCap, characteristicTrainingPlan,
  TRAINING_SKILL_CAP,
} from '../lib/advancement';
import { legacySlotsAtTpl, LEGACY_ADVANCEMENTS, LEGACY_ITEM_TYPES } from '../lib/game-data/legacy-items';
import { TALENTS } from '../lib/game-data/talents';
import { makeRng } from '../lib/character-generator';

let failures = 0;
const check = (cond: boolean, msg: string) => {
  if (!cond) { failures++; console.error(`  ✗ ${msg}`); }
};

// --- TPL & talent points ---------------------------------------------------
const a = emptyAdvancement();
check(talentPointLevel(a) === 3, 'starting TPL is 3');
a.talentPointsEarned = 4;
check(talentPointLevel(a) === 7, 'TPL = 3 + earned');
a.talentsKnown = ['Gain Health', 'Bardic Knowledge']; // 1 + 2 TP
check(spentTalentPoints(a) === 4, `spent TP = 4 (Gain Health 2 + Bardic Knowledge 2; got ${spentTalentPoints(a)})`);
check(unspentTalentPoints(a) === 3, 'unspent TP = TPL - spent');

// learnable respects prereqs and budget
const learnable = learnableTalents(a);
check(learnable.every((t) => t.cost <= 4), 'learnable all affordable');
check(!learnable.some((t) => t.name === 'Gain Health'), 'known talents not re-learnable');
const withPrereq = TALENTS.find((t) => t.prerequisites.length > 0 && t.prerequisites.every((g) => g.every((r) => !r.startsWith('special:'))));
if (withPrereq) {
  const bare = emptyAdvancement();
  bare.talentPointsEarned = 20;
  check(!learnableTalents(bare).some((t) => t.name === withPrereq.name),
    `prereq-gated talent (${withPrereq.name}) not learnable without prereqs`);
}

// --- experience rolls --------------------------------------------------------
const rng = makeRng(42);
const results = runExperienceRolls(['Dodge', 'Spot', 'Climb'], { Dodge: 50, Spot: 89, Climb: 90 }, 7, rng);
check(results.length === 3, 'one result per check');
for (const r of results) {
  check(r.total === r.roll + r.bonus, 'total = roll + bonus');
  if (r.success) check(r.newRating <= 90, `gain capped at 90 (${r.skill} -> ${r.newRating})`);
  if (!r.success) check(r.newRating === r.rating, 'no gain on failure');
}
const at90 = runExperienceRolls(['X'], { X: 90 }, 50, makeRng(1))[0];
check(at90.newRating === 90, 'skill at 90 cannot gain without a Talent');
const at89 = runExperienceRolls(['X'], { X: 89 }, 50, makeRng(1))[0];
check(at89.success ? at89.newRating === 90 : at89.newRating === 89, '89 + 2 caps to 90');

// Advanced Skills talent: the picked skill caps at 95 instead of 90
const adv90 = runExperienceRolls(['X'], { X: 90 }, 50, makeRng(1), 'X')[0];
check(adv90.success ? adv90.newRating === 92 : adv90.newRating === 90, 'Advanced Skills pick can pass 90');
const adv94 = runExperienceRolls(['X'], { X: 94 }, 50, makeRng(1), 'X')[0];
check(adv94.success ? adv94.newRating === 95 : adv94.newRating === 94, 'Advanced Skills pick caps at 95');
const adv95 = runExperienceRolls(['X'], { X: 95 }, 99, makeRng(1), 'X')[0];
check(adv95.newRating === 95, 'Advanced Skills pick cannot pass 95');
const notPick = runExperienceRolls(['Y'], { Y: 90 }, 99, makeRng(1), 'X')[0];
check(notPick.newRating === 90, 'non-picked skills still cap at 90');

// determinism
const r1 = runExperienceRolls(['A', 'B'], { A: 10, B: 20 }, 5, makeRng(7));
const r2 = runExperienceRolls(['A', 'B'], { A: 10, B: 20 }, 5, makeRng(7));
check(JSON.stringify(r1) === JSON.stringify(r2), 'experience rolls reproducible from seed');

// --- mana ---------------------------------------------------------------------
check(manaAfterLevelUp(null, { INT: 14 } as any) === null, 'non-casters gain no mana');
const m = manaAfterLevelUp({ current: 5, max: 6 }, { INT: 14 } as any)!;
check(m.max === 8 && m.current === 7, `+2 mana on level up (got ${m.current}/${m.max})`);
const mCap = manaAfterLevelUp({ current: 69, max: 69 }, { INT: 14 } as any)!;
check(mCap.max === 70, 'mana max capped at INT x 5');

// --- training / research ---------------------------------------------------------
const tr = makeRng(3);
for (let i = 0; i < 200; i++) {
  const g = trainingGain('success', tr);
  check(g >= 1 && g <= 6, 'training success gain in 1d6');
  const gc = trainingGain('critical', tr);
  check(gc >= 3 && gc <= 8, 'training crit gain = 1d6+2');
  const gf = trainingGain('fumble', tr);
  check(gf <= -1 && gf >= -3, 'training fumble loss in -1d3');
  const rg = researchGain('failure', tr);
  check(rg >= 0 && rg <= 3, 'research failure is 1d4-1 (canon: -1 modifier to the d4)');
  const rf = researchGain('fumble', tr);
  check(rf >= -1 && rf <= 2, 'research fumble is 1d4-2');
  const rs = researchGain('success', tr);
  check(rs >= 1 && rs <= 4, 'research success is 1d4');
}
check(applyTrainingCap(74, 6) === TRAINING_SKILL_CAP, 'training capped at 75');
check(applyTrainingCap(80, 5) === 80, 'training never raises a skill already above 75');
check(applyTrainingCap(10, -3) === 7, 'losses apply normally');

// --- characteristic training -------------------------------------------------------
const plan = characteristicTrainingPlan(13);
check(plan.hours === 325 && plan.weeks === 7, `13 x 25 = 325 hrs / 7 weeks (got ${plan.hours}/${plan.weeks})`);

// --- legacy items -------------------------------------------------------------------
check(legacySlotsAtTpl(3) === 0, 'no legacy slots below TPL 4');
check(legacySlotsAtTpl(4) === 1 && legacySlotsAtTpl(7) === 2 && legacySlotsAtTpl(10) === 3, 'slots at 4/7/10');
check(legacySlotsAtTpl(16) === 3, 'slots max at 3');
for (const t of LEGACY_ITEM_TYPES) {
  const table = LEGACY_ADVANCEMENTS[t.key];
  check(table.length === 5, `${t.key} advancement table has 5 tiers`);
  check(JSON.stringify(table.map((r) => r.tpl)) === JSON.stringify([4, 7, 10, 13, 16]), `${t.key} tiers at 4/7/10/13/16`);
}

// --- normalization -----------------------------------------------------------------
const junk = normalizeAdvancement({ talentPointsEarned: -5, talentsKnown: 'nope', legacyItems: null });
check(junk.talentPointsEarned === 0 && Array.isArray(junk.talentsKnown) && Array.isArray(junk.legacyItems),
  'normalizeAdvancement repairs junk');

console.log(failures === 0 ? '✓ all advancement invariants hold' : `${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
