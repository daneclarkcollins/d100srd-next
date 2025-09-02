'use client';

import Link from 'next/link';
import { useState } from 'react';
import SpellModal from '@/components/Modal/SpellModal';

interface ContentItem {
  slug: string;
  title: string;
  description?: string;
}

interface RulesPageClientProps {
  initialSpells: ContentItem[];
  initialCreatures: ContentItem[];
  initialTools: ContentItem[];
}

export default function RulesPageClient({ 
  initialSpells, 
  initialCreatures, 
  initialTools 
}: RulesPageClientProps) {
  const [selectedSpell, setSelectedSpell] = useState<ContentItem | null>(null);
  const [spellContent, setSpellContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSpellContent = async (spell: ContentItem) => {
    setSelectedSpell(spell);
    setIsLoading(true);
    setIsModalOpen(true);
    
    try {
      const response = await fetch(`/api/content/spells/${spell.slug}`);
      if (response.ok) {
        const data = await response.json();
        setSpellContent(data.content);
      } else {
        setSpellContent('Failed to load spell content.');
      }
    } catch (error) {
      console.error('Error loading spell:', error);
      setSpellContent('Failed to load spell content.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSpell(null);
    setSpellContent('');
  };

  const coreChapters = [
    { title: "1. Introduction", description: "Welcome to SagaBorn D100 and the basics of play", href: "/rules/introduction", order: 1 },
    { title: "2. Creating Your Character", description: "Complete character creation including species, characteristics, and professions", href: "/rules/creating-your-character", order: 2 },
    { title: "2.3 Professions", description: "Character professions and their abilities", href: "/rules/3-professions", order: 2.3 },
    { title: "3. Skills and Talents", description: "The skill system and character talents", href: "/rules/skills-and-talents", order: 3 },
    { title: "3.2 Talents", description: "Complete list of talents", href: "/rules/1-talents", order: 3.2 },
    { title: "4. Magic", description: "Magic system and spellcasting rules", href: "/rules/magic", order: 4 },
    { title: "5. Equipment", description: "Weapons, armor, and gear", href: "/rules/equipment", order: 5 },
    { title: "5.a Crafting", description: "Rules for crafting items", href: "/rules/a-sagaborn-brp-crafting", order: 5.1 },
    { title: "6. Strongholds and Homes", description: "Building and maintaining strongholds", href: "/rules/strongholds-and-homes", order: 6 },
    { title: "6.a Allies and Enemies", description: "Managing allies and dealing with enemies", href: "/rules/a-allies-and-enemies", order: 6.1 },
    { title: "7. System", description: "Core game mechanics and rules", href: "/rules/system", order: 7 },
    { title: "7.a Spot Rules", description: "Situational rules and edge cases", href: "/rules/a-spot-rules", order: 7.1 },
    { title: "7.b Horror (Optional)", description: "Optional horror and sanity rules", href: "/rules/b-horror-optional", order: 7.2 },
    { title: "8. Combat", description: "Complete combat rules and procedures", href: "/rules/combat", order: 8 },
    { title: "9. Into the World", description: "Adventures and worldbuilding", href: "/rules/into-the-world", order: 9 },
    { title: "10. Storyguide's Codex", description: "Running SagaBorn D100 games", href: "/rules/storyguides-codex", order: 10 },
    { title: "11. Creature Compendium", description: "Monsters and NPCs for your adventures", href: "/rules/creature-compendium", order: 11 },
    { title: "12. Expansions", description: "Optional rules and variants", href: "/rules/expansions", order: 12 },
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
          <h2 className="text-2xl font-semibold text-white border-b border-slate-700 pb-2">Core Chapters</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {coreChapters.map((chapter) => (
              <Link
                key={chapter.href}
                href={chapter.href}
                className="block bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{chapter.title}</h3>
                <p className="text-slate-400 text-sm mb-3">{chapter.description}</p>
                <span className="text-blue-400 font-medium text-sm">Read Chapter →</span>
              </Link>
            ))}
          </div>
        </div>

        {initialSpells.length > 0 && (
          <div className="grid gap-6 mb-12">
            <h2 className="text-2xl font-semibold text-white border-b border-slate-700 pb-2">
              Spells ({initialSpells.length})
            </h2>
            <p className="text-slate-400 mb-4">Individual spell descriptions from Chapter 4: Magic</p>
            <div className="grid md:grid-cols-3 gap-4">
              {initialSpells.slice(0, 12).map((spell) => (
                <button
                  key={spell.slug}
                  className="block bg-slate-900 p-3 rounded border border-slate-800 hover:border-slate-700 transition-colors text-left"
                  onClick={() => loadSpellContent(spell)}
                >
                  <h3 className="text-white font-medium text-sm">{spell.title}</h3>
                </button>
              ))}
              {initialSpells.length > 12 && (
                <Link
                  href="/rules/magic"
                  className="block bg-blue-950 p-3 rounded border border-blue-800 hover:border-blue-700 transition-colors text-center"
                >
                  <span className="text-blue-400 font-medium text-sm">
                    View All {initialSpells.length} Spells →
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}

        {initialCreatures.length > 0 && (
          <div className="grid gap-6 mb-12">
            <h2 className="text-2xl font-semibold text-white border-b border-slate-700 pb-2">
              Bestiary ({initialCreatures.length})
            </h2>
            <p className="text-slate-400 mb-4">Creatures from the Creature Compendium</p>
            <div className="grid md:grid-cols-3 gap-4">
              {initialCreatures.map((creature) => (
                <Link
                  key={creature.slug}
                  href={`/rules/creature-compendium#${creature.slug}`}
                  className="block bg-slate-900 p-3 rounded border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <h3 className="text-white font-medium text-sm">{creature.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
      
      {/* Spell Modal */}
      <SpellModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedSpell?.title || ''}
        content={spellContent}
        isLoading={isLoading}
      />
    </div>
  );
}