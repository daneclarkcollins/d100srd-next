import Link from 'next/link';
import { getContentByType } from '@/lib/markdown';

export const metadata = {
  title: 'Rules - SagaBorn D100 SRD',
  description: 'Core rules and mechanics for the SagaBorn D100 tabletop RPG system.',
};

export default function RulesPage() {
  const rules = getContentByType('rules');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Core Rules</h1>
          <p className="text-xl text-slate-400">
            Learn the fundamental mechanics that power your SagaBorn adventures.
          </p>
        </header>

        <div className="grid gap-6">
          {rules.map((rule) => (
            <Link
              key={rule.slug}
              href={`/rules/${rule.slug}`}
              className="block bg-slate-900 p-6 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <h2 className="text-2xl font-semibold text-white mb-2">{rule.title}</h2>
              {rule.description && (
                <p className="text-slate-400 mb-4">{rule.description}</p>
              )}
              <span className="text-blue-400 font-medium">Read More →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}