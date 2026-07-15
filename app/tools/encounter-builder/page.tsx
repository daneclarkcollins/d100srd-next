'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, X, Swords, Users, Search } from 'lucide-react';
import {
  CREATURES, CREATURE_TIERS, ENCOUNTER_DIFFICULTY, difficultyFor,
} from '@/lib/game-data';
import type { CreatureStatBlock } from '@/lib/game-data';

type TierKey = (typeof CREATURE_TIERS)[number]['key'];

interface EnemyRow {
  id: number;
  block: CreatureStatBlock;
  tier: TierKey;
  count: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-green-400',
  Moderate: 'text-lime-400',
  Balanced: 'text-yellow-400',
  Hard: 'text-orange-400',
  Deadly: 'text-red-400',
  '—': 'text-slate-500',
};

export default function EncounterBuilderPage() {
  const [heroes, setHeroes] = useState<number[]>([3, 3, 3, 3]);
  const [enemies, setEnemies] = useState<EnemyRow[]>([]);
  const [query, setQuery] = useState('');
  const [nextId, setNextId] = useState(1);

  const pcv = heroes.reduce((a, b) => a + b, 0);

  const enemyCv = useMemo(
    () =>
      enemies.reduce((sum, e) => {
        const mult = CREATURE_TIERS.find((t) => t.key === e.tier)?.cvMultiplier ?? 1;
        return sum + (e.block.cv ?? 0) * mult * e.count;
      }, 0),
    [enemies]
  );

  const verdict = difficultyFor(enemyCv, pcv);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CREATURES.filter(
      (c) =>
        c.cv !== null &&
        (c.name.toLowerCase().includes(q) ||
          c.pageTitle.toLowerCase().includes(q) ||
          (c.type ?? '').toLowerCase().includes(q))
    ).slice(0, 12);
  }, [query]);

  const addEnemy = (block: CreatureStatBlock) => {
    setEnemies((prev) => {
      const existing = prev.find((e) => e.block === block && e.tier === 'standard');
      if (existing) {
        return prev.map((e) => (e === existing ? { ...e, count: e.count + 1 } : e));
      }
      return [...prev, { id: nextId, block, tier: 'standard', count: 1 }];
    });
    setNextId((n) => n + 1);
    setQuery('');
  };

  const updateEnemy = (id: number, patch: Partial<EnemyRow>) =>
    setEnemies((prev) =>
      prev
        .map((e) => (e.id === id ? { ...e, ...patch } : e))
        .filter((e) => e.count > 0)
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/tools" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Tools
        </Link>
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Encounter Builder</h1>
          <p className="text-slate-400">
            Balance encounters the Creature Compendium way: each hero contributes their Talent
            Point Level to the Party Combat Value, and the enemies&apos; total CV is measured
            against it. A balanced fight sits near 100% of PCV; deadly starts around 150%.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Party */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Party
              </h2>
              <span className="text-slate-300 text-sm">
                PCV <span className="text-2xl font-bold text-white ml-1">{pcv}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              One entry per hero — set each hero&apos;s Talent Point Level (starting characters are TPL 3).
            </p>
            <div className="space-y-2">
              {heroes.map((tpl, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-800/60 rounded-md px-3 py-2">
                  <span className="text-slate-400 text-sm w-16">Hero {i + 1}</span>
                  <button
                    onClick={() => setHeroes(heroes.map((t, j) => (j === i ? Math.max(1, t - 1) : t)))}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                    aria-label="Lower TPL"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-white font-semibold w-14 text-center">TPL {tpl}</span>
                  <button
                    onClick={() => setHeroes(heroes.map((t, j) => (j === i ? t + 1 : t)))}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                    aria-label="Raise TPL"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setHeroes(heroes.filter((_, j) => j !== i))}
                    className="ml-auto p-1 rounded text-slate-500 hover:text-red-400"
                    aria-label="Remove hero"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setHeroes([...heroes, 3])}
              className="mt-3 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4" /> Add hero
            </button>
          </div>

          {/* Verdict */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Swords className="w-5 h-5 text-red-400" /> Encounter
              </h2>
              <span className="text-slate-300 text-sm">
                Enemy CV <span className="text-2xl font-bold text-white ml-1">{enemyCv % 1 === 0 ? enemyCv : enemyCv.toFixed(1)}</span>
              </span>
            </div>
            <div className="text-center my-4">
              <div className={`text-5xl font-extrabold ${DIFFICULTY_COLORS[verdict]}`}>{verdict}</div>
              {pcv > 0 && (
                <div className="text-slate-500 text-sm mt-2">
                  {Math.round((enemyCv / pcv) * 100)}% of party CV
                </div>
              )}
            </div>
            <div className="mt-auto">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                {ENCOUNTER_DIFFICULTY.map((d) => (
                  <span key={d.key}>{d.label} {Math.round(d.ratio * 100)}%</span>
                ))}
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                  style={{ width: `${Math.min(100, pcv > 0 ? (enemyCv / (pcv * 1.75)) * 100 : 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enemy picker */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-3">Enemies</h2>
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the bestiary — name or type (goblin, undead, demon...)"
              className="w-full bg-slate-800 border border-slate-700 rounded-md pl-9 pr-3 py-2.5 text-white placeholder:text-slate-500"
            />
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-md shadow-xl max-h-72 overflow-auto">
                {results.map((c, i) => (
                  <button
                    key={`${c.slug}-${c.name}-${i}`}
                    onClick={() => addEnemy(c)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-700 flex items-baseline justify-between"
                  >
                    <span className="text-white">{c.name}</span>
                    <span className="text-slate-400 text-sm ml-3">
                      CV {c.cv} {c.type ? `• ${c.type}` : ''} {c.hp ? `• ${c.hp} HP` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {enemies.length === 0 ? (
            <p className="text-slate-500 text-sm">No enemies yet — search above to add some.</p>
          ) : (
            <div className="space-y-2">
              {enemies.map((e) => {
                const tier = CREATURE_TIERS.find((t) => t.key === e.tier)!;
                const rowCv = (e.block.cv ?? 0) * tier.cvMultiplier * e.count;
                return (
                  <div key={e.id} className="flex flex-wrap items-center gap-3 bg-slate-800/60 rounded-md px-4 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/creatures/${e.block.slug}`}
                        className="text-white font-medium hover:text-blue-300"
                      >
                        {e.block.name}
                      </Link>
                      <div className="text-xs text-slate-500">
                        CV {e.block.cv}{e.block.hp ? ` • ${e.block.hp} HP` : ''}{e.block.av !== null ? ` • AV ${e.block.av}` : ''} — {tier.note}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <select
                        value={e.tier}
                        onChange={(ev) => updateEnemy(e.id, { tier: ev.target.value as TierKey })}
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      >
                        {CREATURE_TIERS.map((t) => (
                          <option key={t.key} value={t.key}>
                            {t.label} (×{t.cvMultiplier})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => updateEnemy(e.id, { count: e.count - 1 })}
                        className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                        aria-label="Fewer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{e.count}</span>
                      <button
                        onClick={() => updateEnemy(e.id, { count: e.count + 1 })}
                        className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                        aria-label="More"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-slate-300 text-sm w-16 text-right">
                        = {rowCv % 1 === 0 ? rowCv : rowCv.toFixed(1)} CV
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-slate-600 mt-4">
            Action economy matters more than raw CV: six weaker foes usually make a livelier fight
            than one strong one. Champion/Boss upgrades are from the Creature Compendium.
          </p>
        </div>
      </div>
    </div>
  );
}
