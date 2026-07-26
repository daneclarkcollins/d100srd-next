'use client';

/**
 * Live derived-stats preview for characteristic buying/rolling.
 *
 * Shows what the points actually DO (Dane 2026-07-24): HP, SP, damage
 * modifier (with distance to the next STR+SIZ threshold), experience bonus,
 * movement, horror resistance, mana, skill points, languages, and the skill
 * category bonuses — all recomputed from the working characteristic values
 * on every change.
 */

import {
  hitPoints, spiritPoints, damageModifier, experienceBonus, horrorResistance,
  movement, baseMana, manaCap, personalSkillPoints, startingLanguageCount,
  PROFESSIONAL_SKILL_POINTS,
} from '@/lib/game-data/rules';
import type { Characteristics } from '@/lib/game-data/rules';

/** Damage-modifier bands by STR+SIZ (002's chart). */
const DM_BANDS: { max: number; label: string }[] = [
  { max: 12, label: '−2' },
  { max: 16, label: '−1' },
  { max: 24, label: '0' },
  { max: 32, label: '+1d4' },
  { max: 40, label: '+1d6' },
  { max: 56, label: '+2d6' },
];

function nextDamageStep(total: number): { away: number; next: string } | null {
  for (let i = 0; i < DM_BANDS.length; i++) {
    if (total <= DM_BANDS[i].max) {
      const next = i + 1 < DM_BANDS.length ? DM_BANDS[i + 1].label : '+3d6';
      return { away: DM_BANDS[i].max + 1 - total, next };
    }
  }
  // beyond 56: +1d6 per additional 16 points
  const extra = Math.ceil((total - 56) / 16);
  const nextAt = 56 + 16 * extra + 1;
  return { away: nextAt - total, next: `+${2 + extra + 1}d6` };
}

/** What each characteristic drives — shown as a caption on stat rows. */
export const STAT_EFFECTS: Record<string, string> = {
  STR: 'damage modifier (with SIZ) • Physical skill bonus',
  CON: 'hit points (with SIZ)',
  SIZ: 'hit points • damage modifier • movement',
  INT: 'experience bonus • personal skill points • languages • mana cap • Mental skill bonus',
  ACU: 'spirit points • horror resistance • starting mana • Perception skill bonus',
  DEX: 'initiative (1d10+DEX) • Combat & Dexterous skill bonus',
  SOC: 'Communication skill bonus • social rolls',
};

export default function DerivedPreview({ stats }: { stats: Record<string, number> }) {
  const c = {
    STR: stats.STR ?? 10, CON: stats.CON ?? 10, SIZ: stats.SIZ ?? 10,
    INT: stats.INT ?? 10, ACU: stats.ACU ?? 10, DEX: stats.DEX ?? 10, SOC: stats.SOC ?? 10,
  } as Characteristics;

  const strSiz = c.STR + c.SIZ;
  const dmStep = nextDamageStep(strSiz);
  const half = (n: number) => Math.ceil(n / 2);

  const cards: { label: string; value: string; hint?: string }[] = [
    { label: 'Hit Points', value: String(hitPoints(c)), hint: `CON ${c.CON} + SIZ ${c.SIZ}` },
    { label: 'Spirit Points', value: String(spiritPoints(c)), hint: `= ACU` },
    {
      label: 'Damage Modifier',
      value: damageModifier(c),
      hint: dmStep ? `STR+SIZ ${strSiz} — ${dmStep.away} more reaches ${dmStep.next}` : `STR+SIZ ${strSiz}`,
    },
    {
      label: 'Experience Bonus',
      value: `+${experienceBonus(c)}`,
      hint: c.INT % 2 === 0 ? `next INT point → +${experienceBonus(c) + 1}` : `INT/2, rounded up`,
    },
    { label: 'Movement', value: `${movement(c.SIZ)}'`, hint: 'from SIZ' },
    { label: 'Horror Resistance', value: String(horrorResistance(c)), hint: 'ACU × 5' },
    { label: 'Mana (if caster)', value: String(baseMana(c)), hint: `ACU/2 • cap ${manaCap(c)} (INT×5)` },
    {
      label: 'Skill Points',
      value: `${PROFESSIONAL_SKILL_POINTS}+${personalSkillPoints(c)}`,
      hint: `250 professional + INT×10 personal`,
    },
    { label: 'Languages', value: String(startingLanguageCount(c.INT)), hint: 'from INT' },
  ];

  const bonuses: { cat: string; char: keyof Characteristics }[] = [
    { cat: 'Combat', char: 'DEX' }, { cat: 'Dexterous', char: 'DEX' },
    { cat: 'Physical', char: 'STR' }, { cat: 'Mental', char: 'INT' },
    { cat: 'Perception', char: 'ACU' }, { cat: 'Communication', char: 'SOC' },
  ];

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 mt-6">
      <h4 className="text-sm font-semibold text-white mb-3">
        What these points give you <span className="text-slate-500 font-normal">(updates live)</span>
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {cards.map((card) => (
          <div key={card.label} className="bg-slate-900/70 rounded-md px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">{card.label}</div>
            <div className="text-lg font-bold text-white leading-tight">{card.value}</div>
            {card.hint && <div className="text-[11px] text-slate-400 mt-0.5">{card.hint}</div>}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-slate-400">
        <span className="text-slate-500 uppercase tracking-wide text-[11px] mr-2">Skill category bonuses (char ÷ 2, rounded up):</span>
        {bonuses.map((b, i) => (
          <span key={b.cat}>
            {i > 0 && ' • '}
            {b.cat} <span className="text-white font-medium">+{half(c[b.char])}%</span>
          </span>
        ))}
      </div>
      <p className="text-[11px] text-slate-500 mt-2">
        Characteristic rolls (saves &amp; heroic actions) are each stat ×5 — every point is +5% there.
        Category bonuses and the experience bonus rise on every 2nd point.
      </p>
    </div>
  );
}
