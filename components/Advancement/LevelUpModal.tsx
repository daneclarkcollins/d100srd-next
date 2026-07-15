'use client';

import { useMemo, useState } from 'react';
import {
  X, TrendingUp, Dice6, Sparkles, GraduationCap, Swords, Check, Plus, Minus,
  AlertTriangle, Trash2,
} from 'lucide-react';
import { Character } from '@/lib/character-data';
import { useAdvancement } from '@/hooks/useAdvancement';
import {
  AdvancementState, ExperienceRollResult, LegacyItem,
  talentPointLevel, spentTalentPoints, unspentTalentPoints, learnableTalents,
  runExperienceRolls, manaAfterLevelUp, trainingGain, researchGain,
  applyTrainingCap, characteristicTrainingPlan, TRAINING_SKILL_CAP,
} from '@/lib/advancement';
import {
  hitPoints, spiritPoints, damageModifier, experienceBonus as xpBonusOf,
  horrorResistance, movement, baseMana, manaCap, ADVANCEMENT_SKILL_CAP,
} from '@/lib/game-data/rules';
import type { Characteristics } from '@/lib/game-data/rules';
import { TALENTS } from '@/lib/game-data/talents';
import {
  LEGACY_ITEM_TYPES, LEGACY_ADVANCEMENTS, LEGACY_TIERED_ABILITIES,
  legacySlotsAtTpl, MAX_LEGACY_ITEMS, LEGACY_POWER_TPLS,
} from '@/lib/game-data/legacy-items';
import type { RollQuality } from '@/lib/advancement';

type Tab = 'experience' | 'talents' | 'training' | 'legacy';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  characterId: string;
  /** Persist changes to the character itself (skills, characteristics, derived). */
  onCharacterChange: (updated: Character) => Promise<void> | void;
}

const QUALITIES: { key: RollQuality; label: string }[] = [
  { key: 'critical', label: 'Critical' },
  { key: 'special', label: 'Special' },
  { key: 'success', label: 'Success' },
  { key: 'failure', label: 'Failure' },
  { key: 'fumble', label: 'Fumble' },
];

export default function LevelUpModal({ isOpen, onClose, character, characterId, onCharacterChange }: Props) {
  const { advancement, save, loading, migrationNeeded } = useAdvancement(isOpen ? characterId : null);
  const [tab, setTab] = useState<Tab>('experience');
  const [xpResults, setXpResults] = useState<ExperienceRollResult[] | null>(null);
  const [talentFilter, setTalentFilter] = useState('');
  // Training / research state (all hooks must precede the early return below)
  const [trainSkill, setTrainSkill] = useState('');
  const [trainQuality, setTrainQuality] = useState<RollQuality>('success');
  const [trainMode, setTrainMode] = useState<'training' | 'research'>('training');
  const [trainResult, setTrainResult] = useState<string | null>(null);
  const [charToTrain, setCharToTrain] = useState<keyof Characteristics>('STR');
  const [newItem, setNewItem] = useState({ name: '', type: 'attack' as LegacyItem['type'], description: '' });

  const c = character.characteristics as Characteristics;
  const xpBonus = xpBonusOf(c);
  const tpl = talentPointLevel(advancement);
  const skillNames = useMemo(() => Object.keys(character.skills ?? {}).sort(), [character.skills]);

  if (!isOpen) return null;

  const log = (text: string): AdvancementState['log'] => [
    { at: new Date().toISOString(), text },
    ...advancement.log,
  ].slice(0, 100);

  // ---------------------------------------------------------------- helpers
  const toggleCheck = (skill: string) => {
    const has = advancement.experienceChecks.includes(skill);
    save({
      ...advancement,
      experienceChecks: has
        ? advancement.experienceChecks.filter((s) => s !== skill)
        : [...advancement.experienceChecks, skill],
    });
  };

  const rollExperience = async () => {
    const results = runExperienceRolls(advancement.experienceChecks, character.skills, xpBonus);
    setXpResults(results);
    const improved = results.filter((r) => r.success && r.newRating !== r.rating);
    if (improved.length > 0) {
      const updatedSkills = { ...character.skills };
      for (const r of improved) updatedSkills[r.skill] = r.newRating;
      await onCharacterChange({ ...character, skills: updatedSkills });
    }
    const newMana = manaAfterLevelUp(advancement.mana, c);
    const summary = `Experience rolls: ${improved.length}/${results.length} improved (+2 each)` +
      (newMana && advancement.mana ? `; mana ${advancement.mana.max}→${newMana.max}` : '');
    save({ ...advancement, experienceChecks: [], mana: newMana ?? advancement.mana, log: log(summary) });
  };

  const awardTp = (delta: number) => {
    const next = Math.max(0, advancement.talentPointsEarned + delta);
    save({
      ...advancement,
      talentPointsEarned: next,
      log: delta > 0 ? log(`SG awarded ${delta} Talent Point${delta > 1 ? 's' : ''} (TPL now ${3 + next})`) : advancement.log,
    });
  };

  const learnTalent = (name: string) => {
    save({ ...advancement, talentsKnown: [...advancement.talentsKnown, name], log: log(`Learned talent: ${name}`) });
  };

  const forgetTalent = (name: string) => {
    save({ ...advancement, talentsKnown: advancement.talentsKnown.filter((t) => t !== name) });
  };

  const enableMana = () => {
    const base = baseMana(c);
    save({ ...advancement, mana: { current: base, max: base }, log: log(`Mana pool started at ${base} (ACU/2)`) });
  };


  const applyTraining = async () => {
    if (!trainSkill) return;
    const current = character.skills[trainSkill] ?? 0;
    if (current >= TRAINING_SKILL_CAP) {
      setTrainResult(`${trainSkill} is already at ${current}% — training and research cap at ${TRAINING_SKILL_CAP}%. Only experience can push it higher.`);
      return;
    }
    const gain = trainMode === 'training' ? trainingGain(trainQuality) : researchGain(trainQuality);
    const next = applyTrainingCap(current, gain);
    if (next !== current) {
      await onCharacterChange({ ...character, skills: { ...character.skills, [trainSkill]: next } });
    }
    const verb = trainMode === 'training' ? 'Training' : 'Research';
    setTrainResult(`${verb} (${trainQuality}): ${trainSkill} ${current}% → ${next}% (${gain >= 0 ? '+' : ''}${gain})`);
    save({ ...advancement, log: log(`${verb}: ${trainSkill} ${current}%→${next}%`) });
  };

  const trainChar = async () => {
    const value = c[charToTrain];
    const updated: Characteristics = { ...c, [charToTrain]: value + 1 };
    const derived = {
      ...character.derivedStats,
      hitPoints: hitPoints(updated),
      spiritPoints: spiritPoints(updated),
      damageModifier: damageModifier(updated),
      experienceBonus: xpBonusOf(updated),
      movementSpeed: movement(updated.SIZ),
      horrorResistance: horrorResistance(updated),
    };
    await onCharacterChange({ ...character, characteristics: updated, derivedStats: derived });
    // mana cap can grow with INT
    const mana = advancement.mana
      ? { current: advancement.mana.current, max: Math.min(advancement.mana.max, manaCap(updated)) }
      : advancement.mana;
    save({ ...advancement, mana, log: log(`Characteristic training: ${charToTrain} ${value}→${value + 1}`) });
  };

  // Legacy items
  const slots = legacySlotsAtTpl(tpl);
  const addLegacyItem = () => {
    if (!newItem.name.trim()) return;
    const item: LegacyItem = {
      id: crypto.randomUUID(),
      name: newItem.name.trim(),
      type: newItem.type,
      description: newItem.description.trim() || undefined,
      gainedAtTpl: tpl,
      powers: [],
    };
    save({ ...advancement, legacyItems: [...advancement.legacyItems, item], log: log(`Gained Legacy Item: ${item.name}`) });
    setNewItem({ name: '', type: 'attack', description: '' });
  };
  const removeLegacyItem = (id: string) => {
    save({ ...advancement, legacyItems: advancement.legacyItems.filter((i) => i.id !== id) });
  };
  const addPower = (id: string, tplTier: number, text: string) => {
    if (!text.trim()) return;
    save({
      ...advancement,
      legacyItems: advancement.legacyItems.map((i) =>
        i.id === id ? { ...i, powers: [...i.powers, { tpl: tplTier, text: text.trim() }] } : i
      ),
    });
  };
  const removePower = (id: string, idx: number) => {
    save({
      ...advancement,
      legacyItems: advancement.legacyItems.map((i) =>
        i.id === id ? { ...i, powers: i.powers.filter((_, j) => j !== idx) } : i
      ),
    });
  };

  const typeCount = (t: LegacyItem['type']) => advancement.legacyItems.filter((i) => i.type === t).length;

  // ---------------------------------------------------------------- render
  const tabs: { key: Tab; label: string; icon: typeof Dice6 }[] = [
    { key: 'experience', label: 'Experience', icon: Dice6 },
    { key: 'talents', label: 'Talents', icon: Sparkles },
    { key: 'training', label: 'Training', icon: GraduationCap },
    { key: 'legacy', label: 'Legacy Items', icon: Swords },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Level Up — {character.name || 'Unnamed'}</h2>
              <p className="text-xs text-slate-400">
                Talent Point Level {tpl} • {unspentTalentPoints(advancement)} TP unspent • XP bonus +{xpBonus}
                {advancement.mana ? ` • Mana ${advancement.mana.current}/${advancement.mana.max}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {migrationNeeded && (
          <div className="mx-6 mt-4 flex items-start gap-2 bg-amber-950/60 border border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-200">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              The database needs a one-line migration before advancement can be saved: run{' '}
              <code className="bg-slate-800 px-1 rounded">supabase/migrations/20260716_advancement.sql</code>{' '}
              in the Supabase SQL editor. Everything below works, but won&apos;t persist until then.
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-700 px-6 gap-1 mt-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : tab === 'experience' ? (
            <div>
              <p className="text-sm text-slate-400 mb-4">
                During play, check each skill your character used successfully in a dramatic moment.
                At level-up, each checked skill rolls d100 + your experience bonus (+{xpBonus}) —
                beat the current rating and the skill gains +2 (cap {ADVANCEMENT_SKILL_CAP} without a Talent).
                {advancement.mana ? ' Casters also gain 2 mana.' : ''}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-4">
                {skillNames.map((s) => {
                  const checked = advancement.experienceChecks.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleCheck(s)}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm text-left transition-colors ${
                        checked ? 'bg-blue-950/70 border border-blue-700 text-white' : 'bg-slate-800 border border-transparent text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="truncate">{s}</span>
                      <span className="flex items-center gap-1.5 ml-2 shrink-0">
                        <span className="text-slate-500 text-xs">{character.skills[s]}%</span>
                        {checked && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </span>
                    </button>
                  );
                })}
                {skillNames.length === 0 && <p className="text-slate-500 text-sm col-span-3">No skills on this character yet.</p>}
              </div>
              <button
                onClick={rollExperience}
                disabled={advancement.experienceChecks.length === 0}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-md"
              >
                <Dice6 className="w-4 h-4" />
                Roll Experience ({advancement.experienceChecks.length} check{advancement.experienceChecks.length === 1 ? '' : 's'})
              </button>

              {xpResults && (
                <div className="mt-5 bg-slate-800/60 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-left border-b border-slate-700">
                        <th className="px-3 py-2">Skill</th>
                        <th className="px-3 py-2">Roll</th>
                        <th className="px-3 py-2">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {xpResults.map((r) => (
                        <tr key={r.skill} className="border-b border-slate-700/50">
                          <td className="px-3 py-2 text-white">{r.skill}</td>
                          <td className="px-3 py-2 text-slate-300">{r.roll}+{r.bonus}={r.total} vs {r.rating}</td>
                          <td className="px-3 py-2">
                            {r.success && r.newRating > r.rating ? (
                              <span className="text-green-400 font-medium">+2 → {r.newRating}%</span>
                            ) : r.capped ? (
                              <span className="text-amber-400">at cap ({ADVANCEMENT_SKILL_CAP}%)</span>
                            ) : (
                              <span className="text-slate-500">no gain</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : tab === 'talents' ? (
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-sm text-slate-300">
                  SG-awarded Talent Points: <span className="text-white font-semibold">{advancement.talentPointsEarned}</span>
                  <span className="text-slate-500"> (TPL {tpl}, {spentTalentPoints(advancement)} spent)</span>
                </span>
                <button onClick={() => awardTp(1)} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200" title="Add awarded TP"><Plus className="w-4 h-4" /></button>
                <button onClick={() => awardTp(-1)} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200" title="Remove awarded TP"><Minus className="w-4 h-4" /></button>
                {!advancement.mana && (
                  <button onClick={enableMana} className="ml-auto text-xs text-blue-400 hover:text-blue-300">
                    This character has a mana talent → start mana pool (ACU/2 = {baseMana(c)})
                  </button>
                )}
              </div>

              {advancement.talentsKnown.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Known talents</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {advancement.talentsKnown.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-sm text-white">
                        {t}
                        <button onClick={() => forgetTalent(t)} className="text-slate-500 hover:text-red-400" title="Remove"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                Learnable now ({unspentTalentPoints(advancement)} TP unspent)
              </h4>
              <input
                value={talentFilter}
                onChange={(e) => setTalentFilter(e.target.value)}
                placeholder="Filter talents…"
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white mb-2"
              />
              <div className="max-h-64 overflow-y-auto space-y-1">
                {learnableTalents(advancement)
                  .filter((t) => t.name.toLowerCase().includes(talentFilter.toLowerCase()))
                  .map((t) => (
                    <div key={t.name} className="flex items-start gap-3 bg-slate-800/60 rounded-md px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium">{t.name}</span>
                        <span className="text-slate-500 text-xs ml-2">({t.cost} TP{t.grantsMana ? ', grants mana' : ''})</span>
                        <p className="text-xs text-slate-400 mt-0.5">{t.summary}</p>
                      </div>
                      <button
                        onClick={() => learnTalent(t.name)}
                        className="shrink-0 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded"
                      >
                        Learn
                      </button>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-slate-600 mt-3">
                Prerequisites are enforced from the canonical talent trees. If your starting three talents
                aren&apos;t listed as known yet, add them here first — the SG-awarded counter only tracks points beyond the starting 3.
              </p>
            </div>
          ) : tab === 'training' ? (
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Skill training & research</h4>
                <p className="text-xs text-slate-400 mb-3">
                  A teacher&apos;s successful Teach roll grants +1d6 (special +1, crit +2; fumble −1d3).
                  Research grants +1d4 with the same style of modifiers after a successful experience roll.
                  Neither can raise a skill past {TRAINING_SKILL_CAP}% — mastery beyond that comes only from experience.
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <select value={trainMode} onChange={(e) => setTrainMode(e.target.value as 'training' | 'research')}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-2 text-sm text-white">
                    <option value="training">Training (teacher)</option>
                    <option value="research">Research (solo)</option>
                  </select>
                  <select value={trainSkill} onChange={(e) => setTrainSkill(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-2 text-sm text-white min-w-[10rem]">
                    <option value="">Choose skill…</option>
                    {skillNames.map((s) => (
                      <option key={s} value={s}>{s} ({character.skills[s]}%)</option>
                    ))}
                  </select>
                  <select value={trainQuality} onChange={(e) => setTrainQuality(e.target.value as RollQuality)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-2 text-sm text-white">
                    {QUALITIES.map((q) => <option key={q.key} value={q.key}>{trainMode === 'training' ? "Teacher's roll" : 'Research roll'}: {q.label}</option>)}
                  </select>
                  <button onClick={applyTraining} disabled={!trainSkill}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded">
                    Apply
                  </button>
                </div>
                {trainResult && <p className="text-sm text-slate-300 mt-2">{trainResult}</p>}
                <p className="text-xs text-slate-600 mt-1">
                  Time: hours equal to the skill&apos;s current rating (~50 downtime hours/week).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Characteristic training</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Raising a characteristic by 1 takes its current value × 25 hours. All derived stats recompute.
                  Improvements above 21 should involve your SG. SIZ normally doesn&apos;t change.
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <select value={charToTrain} onChange={(e) => setCharToTrain(e.target.value as keyof Characteristics)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-2 text-sm text-white">
                    {(['STR', 'CON', 'DEX', 'INT', 'ACU', 'SOC', 'SIZ'] as const).map((k) => (
                      <option key={k} value={k}>{k} ({c[k]})</option>
                    ))}
                  </select>
                  <span className="text-sm text-slate-400">
                    {characteristicTrainingPlan(c[charToTrain]).hours} hours (~{characteristicTrainingPlan(c[charToTrain]).weeks} weeks)
                  </span>
                  <button onClick={trainChar}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded">
                    Complete training (+1 {charToTrain})
                  </button>
                  {c[charToTrain] >= 21 && (
                    <span className="text-xs text-amber-400">Above 21 — get SG input</span>
                  )}
                </div>
              </div>

              {advancement.log.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Advancement log</h4>
                  <ul className="text-xs text-slate-400 space-y-1 max-h-40 overflow-y-auto">
                    {advancement.log.map((e, i) => (
                      <li key={i}>
                        <span className="text-slate-600">{new Date(e.at).toLocaleDateString()}</span> — {e.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-400 mb-4">
                Legacy Items grow with your hero. You can hold at most {MAX_LEGACY_ITEMS}, gained at
                TPL 4, 7 and 10 — you have <span className="text-white font-medium">{slots}</span> slot{slots === 1 ? '' : 's'} unlocked at TPL {tpl}.
                Items gain powers based on your total TPL, even if gained later. They never detect as magic.
              </p>

              {advancement.legacyItems.map((item) => {
                const typeLabel = LEGACY_ITEM_TYPES.find((t) => t.key === item.type)?.label ?? item.type;
                const table = LEGACY_ADVANCEMENTS[item.type];
                return (
                  <div key={item.id} className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-white font-semibold">{item.name}</h4>
                        <p className="text-xs text-slate-400">{typeLabel} • gained at TPL {item.gainedAtTpl}</p>
                        {item.description && <p className="text-sm text-slate-300 mt-1">{item.description}</p>}
                      </div>
                      <button onClick={() => removeLegacyItem(item.id)} className="text-slate-500 hover:text-red-400 p-1" title="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <h5 className="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">Powers</h5>
                      {item.powers.length === 0 && <p className="text-xs text-slate-500 mb-2">None chosen yet.</p>}
                      <ul className="space-y-1 mb-3">
                        {item.powers.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                            <span className="text-blue-400 text-xs mt-0.5 shrink-0">TPL {p.tpl}</span>
                            <span className="flex-1">{p.text}</span>
                            <button onClick={() => removePower(item.id, i)} className="text-slate-600 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                          </li>
                        ))}
                      </ul>
                      <details className="text-xs text-slate-400">
                        <summary className="cursor-pointer hover:text-white">Add a power (guidelines for this type)</summary>
                        <div className="mt-2 space-y-1.5">
                          {table.map((row) => (
                            <div key={row.tpl} className={`flex items-start gap-2 ${tpl >= row.tpl ? '' : 'opacity-40'}`}>
                              <span className="shrink-0 w-12 text-blue-400">TPL {row.tpl}</span>
                              <span className="flex-1">{row.text}</span>
                              <button
                                onClick={() => addPower(item.id, row.tpl, row.text)}
                                disabled={tpl < row.tpl}
                                className="shrink-0 text-blue-400 hover:text-blue-300 disabled:cursor-not-allowed"
                              >
                                + take
                              </button>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-slate-700 mt-2">
                            <p className="mb-1 text-slate-500">Tiered abilities (stackable — or invent your own with your SG):</p>
                            {LEGACY_TIERED_ABILITIES.map((a) => (
                              <div key={a} className="flex items-start gap-2">
                                <span className="flex-1">{a}</span>
                                <button onClick={() => addPower(item.id, tpl, a)} className="shrink-0 text-blue-400 hover:text-blue-300">+ take</button>
                              </div>
                            ))}
                            <CustomPowerInput onAdd={(text) => addPower(item.id, tpl, text)} />
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}

              {advancement.legacyItems.length < Math.min(slots, MAX_LEGACY_ITEMS) ? (
                <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Add a Legacy Item</h4>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Name (e.g. Thornfang, my father's blade)"
                      className="flex-1 min-w-[12rem] bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                    />
                    <select
                      value={newItem.type}
                      onChange={(e) => setNewItem({ ...newItem, type: e.target.value as LegacyItem['type'] })}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-2 text-sm text-white"
                    >
                      {LEGACY_ITEM_TYPES.map((t) => (
                        <option key={t.key} value={t.key} disabled={typeCount(t.key) >= t.maxOfType}>
                          {t.label}{t.note ? ` — ${t.note}` : ''}
                        </option>
                      ))}
                    </select>
                    <button onClick={addLegacyItem} disabled={!newItem.name.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded">
                      Add
                    </button>
                  </div>
                  <input
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Its story (optional)"
                    className="w-full mt-2 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                  />
                </div>
              ) : advancement.legacyItems.length >= MAX_LEGACY_ITEMS ? (
                <p className="text-xs text-slate-500">All three Legacy Item slots are filled.</p>
              ) : (
                <p className="text-xs text-slate-500">
                  Next Legacy Item slot unlocks at TPL {LEGACY_ITEM_TPLS_NEXT(tpl)} (you&apos;re TPL {tpl}).
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LEGACY_ITEM_TPLS_NEXT(tpl: number): number {
  if (tpl < 4) return 4;
  if (tpl < 7) return 7;
  return 10;
}

function CustomPowerInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="flex gap-2 mt-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Custom power (worked out with your SG)…"
        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white"
      />
      <button
        onClick={() => { onAdd(text); setText(''); }}
        disabled={!text.trim()}
        className="text-blue-400 hover:text-blue-300 disabled:opacity-40"
      >
        + add
      </button>
    </div>
  );
}
