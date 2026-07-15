import Link from 'next/link';
import { getContentByType } from '@/lib/markdown';

export const metadata = {
  title: 'Bestiary - SagaBorn D100 SRD',
  description: 'Creatures, monsters, and NPCs of Atheles for SagaBorn D100.',
};

export default function CreaturesPage() {
  const creatures = getContentByType('creatures').sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Bestiary</h1>
          <p className="text-xl text-slate-400">
            The creatures of Atheles — from dire rats to void demons. Each entry includes a full
            stat block, special abilities, and lore. For building encounters and NPC tiers, see the{' '}
            <Link href="/rules/creature-compendium" className="text-blue-400 hover:underline">
              Creature Compendium
            </Link>
            .
          </p>
        </header>

        {creatures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {creatures.map((creature) => (
              <Link
                key={creature.slug}
                href={`/creatures/${creature.slug}`}
                className="block bg-slate-900 px-5 py-4 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors"
              >
                <h2 className="text-lg font-semibold text-white">{creature.title}</h2>
                {creature.description && (
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{creature.description}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-800 text-center">
            <p className="text-slate-400">The bestiary is being assembled.</p>
          </div>
        )}
      </div>
    </div>
  );
}
