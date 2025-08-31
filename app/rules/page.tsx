import Link from 'next/link';
import { getContentByType } from '@/lib/markdown';

export const metadata = {
  title: 'Rules - SagaBorn D100 SRD',
  description: 'Core rules and mechanics for the SagaBorn D100 tabletop RPG system.',
};

export default function RulesPage() {
  const rules = getContentByType('rules');

  const coreRules = [
    { title: "Complete Character Creation", description: "The complete system for creating SagaBorn D100 characters", href: "/rules/complete-character-creation" },
    { title: "Character Creation (Interactive)", description: "Create your hero step by step with species selection", href: "/rules/character-creation" },
    { title: "Magic System", description: "Complete rules for magic, spellcasting, and mana", href: "/rules/magic-system" },
    { title: "Combat Rules", description: "How combat works in SagaBorn", href: "/rules/combat" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">SagaBorn D100 SRD</h1>
          <p className="text-xl text-slate-400 mb-4">
            The complete system reference document for SagaBorn D100, a streamlined fantasy RPG 
            based on percentile mechanics.
          </p>
          <div className="bg-blue-950 border border-blue-800 p-4 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>Open Game Content:</strong> This SRD contains open game content under a generous license, 
              allowing creators and publishers to develop modules, settings, and homebrew rules using the SagaBorn framework.
            </p>
          </div>
        </header>

        <div className="grid gap-6 mb-12">
          <h2 className="text-2xl font-semibold text-white border-b border-slate-700 pb-2">Core Rules</h2>
          {coreRules.map((rule) => (
            <Link
              key={rule.href}
              href={rule.href}
              className="block bg-slate-900 p-6 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <h3 className="text-xl font-semibold text-white mb-2">{rule.title}</h3>
              <p className="text-slate-400 mb-4">{rule.description}</p>
              <span className="text-blue-400 font-medium">Read Rules →</span>
            </Link>
          ))}
        </div>

        {rules.length > 0 && (
          <div className="grid gap-6">
            <h2 className="text-2xl font-semibold text-white border-b border-slate-700 pb-2">Additional Rules</h2>
            {rules.map((rule) => (
              <Link
                key={rule.slug}
                href={`/rules/${rule.slug}`}
                className="block bg-slate-900 p-6 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{rule.title}</h3>
                {rule.description && (
                  <p className="text-slate-400 mb-4">{rule.description}</p>
                )}
                <span className="text-blue-400 font-medium">Read More →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}