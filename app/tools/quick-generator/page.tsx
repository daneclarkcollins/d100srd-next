'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dice6, RefreshCw, Link2, ChevronDown, ChevronUp, ArrowLeft, Printer } from 'lucide-react';
import { generateCharacter, GeneratedCharacter } from '@/lib/character-generator';
import { SPECIES, PROFESSIONS } from '@/lib/game-data';
import type { Archetype } from '@/lib/game-data/types';

const ARCHETYPES: Archetype[] = ['Warrior', 'Expert', 'Mage'];

function QuickGeneratorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [species, setSpecies] = useState<string>(searchParams.get('species') ?? '');
  const [profession, setProfession] = useState<string>(searchParams.get('profession') ?? '');
  const [archetype, setArchetype] = useState<string>(searchParams.get('archetype') ?? '');
  const [showLog, setShowLog] = useState(false);
  const [copied, setCopied] = useState(false);

  const [character, setCharacter] = useState<GeneratedCharacter | null>(() => {
    const seedParam = searchParams.get('seed');
    if (!seedParam) return null;
    return generateCharacter({
      seed: parseInt(seedParam, 10),
      species: searchParams.get('species') || undefined,
      profession: searchParams.get('profession') || undefined,
      archetype: (searchParams.get('archetype') as Archetype) || undefined,
    });
  });

  const build = useCallback((seed?: number) => {
    const ch = generateCharacter({
      seed,
      species: species || undefined,
      profession: profession || undefined,
      archetype: (archetype as Archetype) || undefined,
    });
    setCharacter(ch);
    setCopied(false);
    const params = new URLSearchParams();
    params.set('seed', String(ch.seed));
    if (species) params.set('species', species);
    if (profession) params.set('profession', profession);
    if (archetype) params.set('archetype', archetype);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [species, profession, archetype, router, pathname]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const c = character;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/tools" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Tools
        </Link>
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Quick Character Generator</h1>
          <p className="text-slate-400">
            Instant NPCs and pickup-game characters. Pick as much or as little as you want, then hit Build —
            everything else is rolled by the book: lifepath, characteristics, profession, talents, skills, and gear.
          </p>
        </header>

        {/* Controls */}
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Species</span>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
              >
                <option value="">Any (random)</option>
                {SPECIES.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Profession</span>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
              >
                <option value="">Any (roll d100)</option>
                {[...PROFESSIONS].sort((a, b) => a.name.localeCompare(b.name)).map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Archetype</span>
              <select
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
              >
                <option value="">Match profession</option>
                {ARCHETYPES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => build()}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-md transition-colors"
            >
              <Dice6 className="w-5 h-5" /> Build Character
            </button>
            {c && (
              <>
                <button
                  onClick={() => build()}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-md transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Reroll
                </button>
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-md transition-colors"
                >
                  <Link2 className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-md transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </>
            )}
          </div>
        </div>

        {/* Character card */}
        {c && (
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden print:border-black">
            <div className="bg-slate-800/60 px-6 py-4 border-b border-slate-800 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {c.name} <span className="text-slate-400 font-semibold">— {c.species} {c.profession}</span>
                </h2>
                <p className="text-slate-400 text-sm">
                  {c.archetype} • {c.age} • {c.derived.sizeCategory} • Seed {c.seed}
                </p>
              </div>
              <div className="text-right text-sm text-slate-300">
                <span className="font-semibold text-white">{c.fundsGp} gp</span> starting funds
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Characteristics + derived */}
              <div>
                <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-3">Characteristics</h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {(['STR', 'CON', 'SIZ', 'DEX', 'INT', 'ACU', 'SOC'] as const).map((k) => (
                    <div key={k} className="bg-slate-800 rounded-md px-2 py-2 text-center">
                      <div className="text-xs text-slate-400">{k}</div>
                      <div className="text-lg font-bold text-white">{c.characteristics[k]}</div>
                      <div className="text-[10px] text-slate-500">{c.characteristics[k] * 5}%</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <Stat label="HP" value={c.derived.hp} />
                  <Stat label="SP" value={c.derived.sp} />
                  <Stat label="Mana" value={c.derived.mana ?? '—'} />
                  <Stat label="Dmg Mod" value={c.derived.damageModifier} />
                  <Stat label="Move" value={`${c.derived.move}'`} />
                  <Stat label="Horror Res" value={c.derived.horrorResistance} />
                </div>

                <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mt-5 mb-2">Talents</h3>
                <ul className="space-y-1.5">
                  {c.talents.map((t) => (
                    <li key={t.name} className="text-sm">
                      <span className="text-white font-medium">{t.name}</span>{' '}
                      <span className="text-slate-400">— {t.summary}</span>
                    </li>
                  ))}
                  {c.talents.length === 0 && <li className="text-sm text-slate-500">None</li>}
                </ul>

                {c.spells.length > 0 && (
                  <>
                    <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mt-5 mb-2">Spells</h3>
                    <ul className="space-y-1.5">
                      {c.spells.map((s) => (
                        <li key={s.name} className="text-sm">
                          <span className="text-white font-medium">{s.name}</span>{' '}
                          <span className="text-blue-400">({s.mana} mana)</span>{' '}
                          <span className="text-slate-400">— {s.summary}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Skills + gear */}
              <div>
                <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-3">Skills</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
                  {c.skills.map((s) => (
                    <div key={`${s.name}-${s.specialty ?? ''}`} className="flex justify-between">
                      <span className="text-slate-300 truncate">
                        {s.name}{s.specialty ? ` (${s.specialty})` : ''}
                      </span>
                      <span className="text-white font-semibold ml-2">{s.total}%</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">Equipment</h3>
                <p className="text-sm text-slate-300 mb-4">{c.equipment.join(' • ')}</p>

                <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">Languages</h3>
                <p className="text-sm text-slate-300 mb-4">{c.languages.join(', ')}</p>

                <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">Species Traits</h3>
                <ul className="text-sm text-slate-400 list-disc list-inside space-y-0.5 mb-4">
                  {c.traits.map((t) => <li key={t}>{t}</li>)}
                </ul>

                <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">Background</h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  {c.lifepath.filter((l) => l.label !== 'Age').map((l, i) => (
                    <li key={i}>
                      <span className="text-slate-300 font-medium">{l.label || 'Then'}:</span> {l.result}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Roll log */}
            <div className="border-t border-slate-800 px-6 py-3 print:hidden">
              <button
                onClick={() => setShowLog(!showLog)}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300"
              >
                {showLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Roll log
              </button>
              {showLog && (
                <pre className="mt-2 text-xs text-slate-500 whitespace-pre-wrap font-mono">
                  {c.rollLog.join('\n')}
                </pre>
              )}
            </div>
          </div>
        )}

        {!c && (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-lg p-12 text-center text-slate-500">
            <Dice6 className="w-10 h-10 mx-auto mb-3 opacity-50" />
            Choose your constraints (or don&apos;t) and hit <span className="text-slate-300">Build Character</span>.
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-800 rounded-md px-3 py-2 flex items-center justify-between">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}

export default function QuickGeneratorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <QuickGeneratorInner />
    </Suspense>
  );
}
