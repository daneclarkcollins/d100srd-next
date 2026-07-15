import Link from 'next/link';
import { getContentByType } from '@/lib/markdown';

export const metadata = {
  title: 'Spells - SagaBorn D100 SRD',
  description: 'Magic spells and arcane knowledge for spellcasters in SagaBorn D100.',
};

export default function SpellsPage() {
  const spells = getContentByType('spells');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Spells</h1>
          <p className="text-xl text-slate-400">
            Harness the arcane forces that flow through the world of SagaBorn. From simple cantrips 
            to reality-bending rituals, magic shapes both adventure and legend.
          </p>
        </header>

        {spells.length > 0 ? (
          <div className="grid gap-6">
            {spells.map((spell) => (
              <Link
                key={spell.slug}
                href={`/rules/spells/${spell.slug}`}
                className="block bg-slate-900 p-6 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <h2 className="text-2xl font-semibold text-white mb-2">{spell.title}</h2>
                {spell.description && (
                  <p className="text-slate-400 mb-4">{spell.description}</p>
                )}
                <span className="text-blue-400 font-medium">Cast Spell →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-800 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Spellbook Being Transcribed</h2>
            <p className="text-slate-400">
              The ancient tomes are being carefully transcribed. Soon you'll find detailed spell 
              descriptions, casting requirements, and magical effects for every school of magic!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}