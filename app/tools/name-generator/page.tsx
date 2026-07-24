'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Dices, Copy, Check } from 'lucide-react';
import {
  NAME_SPECIES, NameSpecies, GeneratedName, generateNames, makeRng,
} from '@/lib/name-generator';

const COUNT = 12;

export default function NameGeneratorPage() {
  const [species, setSpecies] = useState<NameSpecies | 'Any'>('Any');
  const [names, setNames] = useState<GeneratedName[]>([]);
  const [seed, setSeed] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const roll = (s: NameSpecies | 'Any' = species) => {
    const newSeed = Math.floor(Math.random() * 2 ** 31);
    setSeed(newSeed);
    setNames(generateNames(s, COUNT, makeRng(newSeed)));
  };

  const copy = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(name);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard unavailable (unlikely) — silently ignore
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/tools" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Tools
        </Link>

        <header className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Name Generator</h1>
          <p className="text-slate-400">
            Names built from each species&apos; own sounds — the same lists and
            style notes the rulebook uses. Elflings come with their long true
            name; click any name to copy it.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={species}
            onChange={(e) => {
              const s = e.target.value as NameSpecies | 'Any';
              setSpecies(s);
              roll(s);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white"
          >
            <option value="Any">Any species</option>
            {NAME_SPECIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => roll()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg"
          >
            <Dices className="w-4 h-4" />
            {names.length ? 'Roll again' : 'Roll names'}
          </button>
          {seed !== null && (
            <span className="text-xs text-slate-600" title="Seed for this batch">seed {seed}</span>
          )}
        </div>

        {names.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-10 text-center text-slate-500">
            Pick a species (or leave it on Any) and roll.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {names.map((n) => (
              <button
                key={`${n.species}:${n.name}`}
                onClick={() => copy(n.name)}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-lg px-4 py-3 text-left transition-colors"
                title="Copy name"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-lg text-white font-medium">{n.name}</span>
                  {copied === n.name ? (
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
                  )}
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  {n.species}
                  {n.detail ? ` — ${n.detail}` : ''}
                </span>
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-600 mt-6">
          Canon common names (doc 002) appear in the mix alongside generated
          ones. Building a full character? The{' '}
          <Link href="/tools/character-builder" className="text-blue-400 hover:text-blue-300">Character Builder</Link>{' '}
          and <Link href="/tools/quick-generator" className="text-blue-400 hover:text-blue-300">Quick Generator</Link>{' '}
          use this same generator.
        </p>
      </div>
    </div>
  );
}
