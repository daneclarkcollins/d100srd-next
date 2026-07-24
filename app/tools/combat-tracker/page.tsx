'use client';

/**
 * Combat Tracker — run a fight by the book (doc 008).
 *
 * Initiative = DEX + 1d10, held for the whole combat. Actions in initiative
 * order; conditions are the canonical Effects list. Encounters flow in from
 * the Encounter Builder ("Run in Combat Tracker"), with Compendium tier
 * adjustments applied (Minion ½ HP, Champion 2×, Boss 3×). State survives a
 * page refresh (kept in sessionStorage until the tab closes).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Minus, X, Swords, Search, Dices, SkipForward, RotateCcw,
  Shield, Heart, User, Skull,
} from 'lucide-react';
import { CREATURES, CREATURE_TIERS, CONDITIONS } from '@/lib/game-data';
import type { CreatureStatBlock } from '@/lib/game-data';
import { useCharacterContext } from '@/contexts/CharacterContext';

// Shared with the Encounter Builder's "Run in Combat Tracker" handoff —
// keep the literal in sync there (page files can't export extra symbols).
const HANDOFF_KEY = 'sagaborn-encounter-handoff';
const STATE_KEY = 'sagaborn-combat-state';

type TierKey = (typeof CREATURE_TIERS)[number]['key'];

interface Combatant {
  id: number;
  name: string;
  side: 'hero' | 'enemy';
  slug?: string;
  tier?: TierKey;
  dex: number | null;
  initiative: number | null;
  maxHp: number;
  hp: number;
  av: number | null;
  dmgMod?: string;
  attacks: string[];
  special: string[];
  conditions: string[];
}

interface Handoff {
  heroes?: number[];
  enemies?: { slug: string; name: string; tier: TierKey; count: number }[];
}

interface SavedState {
  combatants: Combatant[];
  round: number;
  activeId: number | null;
  nextId: number;
}

const tierHpMultiplier = (tier: TierKey): number =>
  tier === 'minion' ? 0.5 : tier === 'champion' ? 2 : tier === 'boss' ? 3 : 1;

const d10 = () => Math.floor(Math.random() * 10) + 1;

export default function CombatTrackerPage() {
  const { activeCharacter } = useCharacterContext();
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [round, setRound] = useState(1);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState({ name: '', hp: 20, dex: 10, side: 'hero' as 'hero' | 'enemy' });
  const [loaded, setLoaded] = useState(false);
  const nextIdRef = useRef(1);

  // ------------------------------------------------------------- load/persist
  useEffect(() => {
    try {
      const handoffRaw = sessionStorage.getItem(HANDOFF_KEY);
      if (handoffRaw) {
        sessionStorage.removeItem(HANDOFF_KEY);
        const handoff: Handoff = JSON.parse(handoffRaw);
        const imported: Combatant[] = [];
        for (const row of handoff.enemies ?? []) {
          const block = CREATURES.find((c) => c.slug === row.slug && c.name === row.name)
            ?? CREATURES.find((c) => c.slug === row.slug);
          if (!block) continue;
          // Compendium tier adjustments: Minion ½ HP, Champion 2×, Boss 3×
          const hp = Math.max(1, Math.ceil((block.hp ?? 10) * tierHpMultiplier(row.tier)));
          for (let i = 0; i < row.count; i++) {
            imported.push({
              id: nextIdRef.current++,
              name: row.count > 1 ? `${block.name} ${i + 1}` : block.name,
              side: 'enemy',
              slug: block.slug,
              tier: row.tier,
              dex: block.characteristics?.DEX ?? null,
              initiative: null,
              maxHp: hp,
              hp,
              av: block.av,
              dmgMod: block.dmgMod,
              attacks: block.attacks,
              special: block.special,
              conditions: [],
            });
          }
        }
        (handoff.heroes ?? []).forEach((tpl, i) => {
          imported.push({
            id: nextIdRef.current++,
            name: `Hero ${i + 1} (TPL ${tpl})`,
            side: 'hero',
            dex: null,
            initiative: null,
            maxHp: 20,
            hp: 20,
            av: null,
            attacks: [],
            special: [],
            conditions: [],
          });
        });
        setCombatants(imported);
        setRound(1);
        setActiveId(null);
      } else {
        const saved = sessionStorage.getItem(STATE_KEY);
        if (saved) {
          const s: SavedState = JSON.parse(saved);
          setCombatants(s.combatants ?? []);
          setRound(s.round ?? 1);
          setActiveId(s.activeId ?? null);
          nextIdRef.current = s.nextId ?? 1000;
        }
      }
    } catch {
      // corrupted storage — start fresh
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({
        combatants, round, activeId, nextId: nextIdRef.current,
      } satisfies SavedState));
    } catch { /* storage full — non-fatal */ }
  }, [combatants, round, activeId, loaded]);

  // ------------------------------------------------------------------ derived
  const ordered = useMemo(
    () =>
      [...combatants].sort((a, b) => {
        if (a.initiative === null && b.initiative === null) return 0;
        if (a.initiative === null) return 1;
        if (b.initiative === null) return -1;
        return b.initiative - a.initiative;
      }),
    [combatants]
  );
  const living = ordered.filter((c) => c.hp > 0);
  const active = combatants.find((c) => c.id === activeId) ?? null;

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CREATURES.filter(
      (c) => c.hp !== null && (c.name.toLowerCase().includes(q) || (c.type ?? '').toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query]);

  // ------------------------------------------------------------------ actions
  const patch = (id: number, p: Partial<Combatant>) =>
    setCombatants((prev) => prev.map((c) => (c.id === id ? { ...c, ...p } : c)));

  const remove = (id: number) => {
    setCombatants((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const rollAllInitiative = () => {
    setCombatants((prev) => prev.map((c) => ({ ...c, initiative: d10() + (c.dex ?? 0) })));
    setRound(1);
    setActiveId(null);
  };

  const nextTurn = () => {
    if (living.length === 0) return;
    if (activeId === null) {
      setActiveId(living[0].id);
      return;
    }
    const idx = living.findIndex((c) => c.id === activeId);
    if (idx === -1 || idx === living.length - 1) {
      setActiveId(living[0].id);
      if (idx !== -1) setRound((r) => r + 1); // wrapped — new round
    } else {
      setActiveId(living[idx + 1].id);
    }
  };

  const resetFight = () => {
    setCombatants((prev) => prev.map((c) => ({ ...c, hp: c.maxHp, initiative: null, conditions: [] })));
    setRound(1);
    setActiveId(null);
  };

  const clearAll = () => {
    setCombatants([]);
    setRound(1);
    setActiveId(null);
  };

  const addCreature = (block: CreatureStatBlock) => {
    const hp = block.hp ?? 10;
    setCombatants((prev) => [...prev, {
      id: nextIdRef.current++,
      name: prev.some((c) => c.slug === block.slug)
        ? `${block.name} ${prev.filter((c) => c.slug === block.slug).length + 1}`
        : block.name,
      side: 'enemy',
      slug: block.slug,
      tier: 'standard',
      dex: block.characteristics?.DEX ?? null,
      initiative: null,
      maxHp: hp,
      hp,
      av: block.av,
      dmgMod: block.dmgMod,
      attacks: block.attacks,
      special: block.special,
      conditions: [],
    }]);
    setQuery('');
  };

  const addCustom = () => {
    if (!custom.name.trim()) return;
    setCombatants((prev) => [...prev, {
      id: nextIdRef.current++,
      name: custom.name.trim(),
      side: custom.side,
      dex: custom.dex,
      initiative: null,
      maxHp: Math.max(1, custom.hp),
      hp: Math.max(1, custom.hp),
      av: null,
      attacks: [],
      special: [],
      conditions: [],
    }]);
    setCustom({ ...custom, name: '' });
  };

  const addActiveCharacter = () => {
    if (!activeCharacter) return;
    if (combatants.some((c) => c.name === (activeCharacter.name || 'My character'))) return;
    setCombatants((prev) => [...prev, {
      id: nextIdRef.current++,
      name: activeCharacter.name || 'My character',
      side: 'hero',
      dex: activeCharacter.characteristics?.DEX ?? null,
      initiative: null,
      maxHp: activeCharacter.maxHP,
      hp: activeCharacter.currentHP,
      av: null,
      dmgMod: activeCharacter.damageModifier,
      attacks: [],
      special: [],
      conditions: [],
    }]);
  };

  const toggleCondition = (id: number, name: string) => {
    setCombatants((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const has = c.conditions.includes(name);
      return { ...c, conditions: has ? c.conditions.filter((x) => x !== name) : [...c.conditions, name] };
    }));
  };

  // ------------------------------------------------------------------- render
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/tools" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Tools
        </Link>

        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Combat Tracker</h1>
            <p className="text-slate-400 max-w-2xl">
              Initiative is DEX + 1d10, kept for the whole fight. Build the encounter in the{' '}
              <Link href="/tools/encounter-builder" className="text-blue-400 hover:text-blue-300">Encounter Builder</Link>{' '}
              and hit &ldquo;Run in Combat Tracker,&rdquo; or add combatants below.
            </p>
          </div>
          {combatants.length > 0 && (
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-slate-500">Round</div>
              <div className="text-4xl font-extrabold text-white leading-none">{round}</div>
            </div>
          )}
        </header>

        {/* Controls */}
        {combatants.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={rollAllInitiative}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
            >
              <Dices className="w-4 h-4" /> Roll initiative (all)
            </button>
            <button
              onClick={nextTurn}
              disabled={living.length === 0}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
            >
              <SkipForward className="w-4 h-4" /> {activeId === null ? 'Start combat' : 'Next turn'}
            </button>
            <button
              onClick={resetFight}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-lg text-sm"
              title="Full HP, clear initiative and conditions"
            >
              <RotateCcw className="w-4 h-4" /> Reset fight
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-red-400 px-3 py-2.5 rounded-lg text-sm ml-auto"
            >
              <X className="w-4 h-4" /> Clear all
            </button>
          </div>
        )}

        {/* Active combatant banner */}
        {active && (
          <div className="mb-4 bg-blue-950/50 border border-blue-800 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
            <Swords className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">{active.name}&apos;s turn</span>
            <span className="text-slate-400 text-sm">
              1 Standard + 1 Move + 2 Free actions
            </span>
            {active.conditions.length > 0 && (
              <span className="text-amber-400 text-sm">({active.conditions.join(', ')})</span>
            )}
          </div>
        )}

        {/* Combatant list */}
        <div className="space-y-2 mb-8">
          {ordered.map((c) => {
            const isActive = c.id === activeId;
            const dead = c.hp <= 0;
            return (
              <div
                key={c.id}
                className={`rounded-lg border px-4 py-3 ${
                  isActive
                    ? 'bg-blue-950/40 border-blue-700'
                    : dead
                      ? 'bg-slate-900/40 border-slate-800 opacity-60'
                      : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {/* Initiative */}
                  <div className="flex items-center gap-1.5 w-24">
                    <input
                      type="number"
                      value={c.initiative ?? ''}
                      placeholder="—"
                      onChange={(e) => patch(c.id, { initiative: e.target.value === '' ? null : Number(e.target.value) })}
                      className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-center"
                      title={`Initiative (DEX ${c.dex ?? '?'} + 1d10)`}
                    />
                    <button
                      onClick={() => patch(c.id, { initiative: d10() + (c.dex ?? 0) })}
                      className="text-slate-500 hover:text-white"
                      title={c.dex !== null ? `Roll 1d10 + ${c.dex}` : 'Roll 1d10 (no DEX known)'}
                    >
                      <Dices className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-[10rem]">
                    <div className="flex items-center gap-2">
                      {dead ? (
                        <Skull className="w-4 h-4 text-slate-600 shrink-0" />
                      ) : c.side === 'hero' ? (
                        <User className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : (
                        <Swords className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      {c.slug ? (
                        <Link href={`/creatures/${c.slug}`} className={`font-medium hover:text-blue-300 ${dead ? 'text-slate-500 line-through' : 'text-white'}`}>
                          {c.name}
                        </Link>
                      ) : (
                        <span className={`font-medium ${dead ? 'text-slate-500 line-through' : 'text-white'}`}>{c.name}</span>
                      )}
                      {c.tier && c.tier !== 'standard' && (
                        <span className="text-[10px] uppercase tracking-wide bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-amber-400">
                          {CREATURE_TIERS.find((t) => t.key === c.tier)?.label}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3">
                      {c.av !== null && <span className="inline-flex items-center gap-1"><Shield className="w-3 h-3" /> AV {c.av}</span>}
                      {c.dmgMod && <span>DM {c.dmgMod}</span>}
                      {c.attacks.length > 0 && <span className="truncate max-w-md" title={c.attacks.join(' • ')}>{c.attacks[0]}</span>}
                    </div>
                  </div>

                  {/* HP */}
                  <div className="flex items-center gap-1.5">
                    <Heart className={`w-4 h-4 ${dead ? 'text-slate-600' : 'text-red-400'}`} />
                    <button onClick={() => patch(c.id, { hp: c.hp - 1 })} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"><Minus className="w-3.5 h-3.5" /></button>
                    <input
                      type="number"
                      value={c.hp}
                      onChange={(e) => patch(c.id, { hp: Number(e.target.value) })}
                      className="w-14 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-white text-center"
                    />
                    <span className="text-slate-500 text-sm">/</span>
                    <input
                      type="number"
                      value={c.maxHp}
                      onChange={(e) => patch(c.id, { maxHp: Math.max(1, Number(e.target.value)) })}
                      className="w-14 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-slate-400 text-center"
                      title="Max HP"
                    />
                    <button onClick={() => patch(c.id, { hp: c.hp + 1 })} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"><Plus className="w-3.5 h-3.5" /></button>
                  </div>

                  {/* Conditions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {c.conditions.map((name) => (
                      <button
                        key={name}
                        onClick={() => toggleCondition(c.id, name)}
                        className="text-xs bg-amber-950/60 border border-amber-800 text-amber-300 rounded-full px-2 py-0.5 hover:border-amber-500"
                        title={`${CONDITIONS.find((x) => x.name === name)?.summary ?? ''} (click to remove)`}
                      >
                        {name} ×
                      </button>
                    ))}
                    <select
                      value=""
                      onChange={(e) => { if (e.target.value) toggleCondition(c.id, e.target.value); }}
                      className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-400"
                      title="Add a condition (canonical Effects, doc 008)"
                    >
                      <option value="">+ effect</option>
                      {CONDITIONS.filter((x) => !c.conditions.includes(x.name)).map((x) => (
                        <option key={x.name} value={x.name} title={x.summary}>{x.name}</option>
                      ))}
                    </select>
                  </div>

                  <button onClick={() => remove(c.id)} className="text-slate-600 hover:text-red-400 ml-auto" title="Remove">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {combatants.length === 0 && loaded && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-10 text-center text-slate-500">
              No combatants yet. Send an encounter over from the Encounter Builder, or add fighters below.
            </div>
          )}
        </div>

        {/* Add combatants */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Add combatants</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-2">From the bestiary</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search creatures…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md pl-9 pr-3 py-2.5 text-white placeholder:text-slate-500"
                />
                {results.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-md shadow-xl max-h-60 overflow-auto">
                    {results.map((c, i) => (
                      <button
                        key={`${c.slug}-${i}`}
                        onClick={() => addCreature(c)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-700 flex items-baseline justify-between"
                      >
                        <span className="text-white">{c.name}</span>
                        <span className="text-slate-400 text-xs ml-3">{c.hp} HP{c.av !== null ? ` • AV ${c.av}` : ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {activeCharacter && (
                <button
                  onClick={addActiveCharacter}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  <User className="w-4 h-4" /> Add {activeCharacter.name || 'my character'} ({activeCharacter.currentHP}/{activeCharacter.maxHP} HP)
                </button>
              )}
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Custom</h3>
              <div className="flex flex-wrap gap-2">
                <input
                  value={custom.name}
                  onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                  placeholder="Name"
                  className="flex-1 min-w-[8rem] bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                />
                <label className="flex items-center gap-1 text-xs text-slate-400">
                  HP
                  <input type="number" value={custom.hp} onChange={(e) => setCustom({ ...custom, hp: Number(e.target.value) })}
                    className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-2 text-white" />
                </label>
                <label className="flex items-center gap-1 text-xs text-slate-400">
                  DEX
                  <input type="number" value={custom.dex} onChange={(e) => setCustom({ ...custom, dex: Number(e.target.value) })}
                    className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-2 text-white" />
                </label>
                <select
                  value={custom.side}
                  onChange={(e) => setCustom({ ...custom, side: e.target.value as 'hero' | 'enemy' })}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-2 text-sm text-white"
                >
                  <option value="hero">Hero</option>
                  <option value="enemy">Enemy</option>
                </select>
                <button
                  onClick={addCustom}
                  disabled={!custom.name.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Imported heroes default to 20 HP — click the numbers to set real values. HP and max HP are always editable.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-4">
          Effects are the canonical list from the combat chapter — hover one for its rule. Dead
          combatants (0 HP) are skipped in the turn order but stay listed. Disabled characters
          lose 1 HP per round; dead is −10 HP.
        </p>
      </div>
    </div>
  );
}
