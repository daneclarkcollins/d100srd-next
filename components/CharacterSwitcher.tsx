'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCharacterContext } from '@/contexts/CharacterContext';
import { User, ChevronDown, Check, Plus, FileText } from 'lucide-react';

/**
 * Active-character chip in the nav — click to open a dropdown and switch
 * which saved character is active.
 */
export default function CharacterSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { activeCharacter, characters, setActiveCharacter, loading } = useCharacterContext();
  const [open, setOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!activeCharacter && characters.length === 0) return null;

  const pick = async (id: string) => {
    if (id === activeCharacter?.id) {
      setOpen(false);
      return;
    }
    setSwitchingId(id);
    try {
      await setActiveCharacter(id);
    } finally {
      setSwitchingId(null);
      setOpen(false);
    }
  };

  const subtitle = (c: { species?: string | null; profession?: string | null }) =>
    [c.species, c.profession].filter(Boolean).join(' ');

  return (
    <div ref={rootRef} className={mobile ? 'relative' : 'relative border-l border-slate-700'}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md ${
          open ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Switch active character"
      >
        <User className="w-4 h-4" />
        <span className="font-medium text-blue-400 max-w-[10rem] truncate">
          {activeCharacter ? activeCharacter.name || 'Unnamed' : 'Characters'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`${
            mobile ? 'relative mt-1 w-full' : 'absolute right-0 mt-1 w-72'
          } bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50`}
          role="listbox"
        >
          <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-700">
            Active character
          </div>
          <div className="max-h-72 overflow-y-auto">
            {characters.map((c) => {
              const isActive = c.id === activeCharacter?.id;
              const isSwitching = c.id === switchingId;
              return (
                <button
                  key={c.id}
                  onClick={() => pick(c.id)}
                  disabled={loading || switchingId !== null}
                  role="option"
                  aria-selected={isActive}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                    isActive ? 'bg-slate-700/60' : 'hover:bg-slate-700/40'
                  } disabled:opacity-60`}
                >
                  <span className="flex-1 min-w-0">
                    <span className={`block truncate font-medium ${isActive ? 'text-blue-400' : 'text-white'}`}>
                      {c.name || 'Unnamed'}
                    </span>
                    {subtitle(c) && (
                      <span className="block truncate text-xs text-slate-400">{subtitle(c)}</span>
                    )}
                  </span>
                  {isSwitching ? (
                    <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    isActive && <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })}
            {characters.length === 0 && (
              <div className="px-3 py-3 text-sm text-slate-500">No saved characters yet.</div>
            )}
          </div>
          <div className="border-t border-slate-700 flex">
            <Link
              href="/tools/character-sheet"
              onClick={() => setOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/40"
            >
              <FileText className="w-3.5 h-3.5" /> View Sheet
            </Link>
            <Link
              href="/tools/character-builder"
              onClick={() => setOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/40 border-l border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" /> New Character
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
