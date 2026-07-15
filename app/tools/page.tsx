import Link from 'next/link';

export const metadata = {
  title: 'Tools - SagaBorn D100 SRD',
  description: 'Interactive tools and utilities for SagaBorn D100 players and game masters.',
};

export default function ToolsPage() {
  const tools = [
    {
      title: 'Quick Character Generator',
      href: '/tools/quick-generator',
      description: 'Instant NPCs and pickup-game characters. Optionally pick species, profession, or archetype, hit Build, and get a complete character rolled by the book — stats, lifepath, talents, skills, spells, and gear.',
      status: 'Available',
      icon: '⚡'
    },
    {
      title: 'Encounter Builder',
      href: '/tools/encounter-builder',
      description: 'Balance fights the Creature Compendium way. Set your party\'s Talent Point Levels, add creatures from the bestiary with Minion/Champion/Boss tiers, and see the difficulty verdict live.',
      status: 'Available',
      icon: '⚔️'
    },
    {
      title: 'Character Builder',
      href: '/tools/character-builder',
      description: 'Create and customize your SagaBorn character step by step. Select species, allocate characteristics, choose skills, and calculate all derived statistics automatically.',
      status: 'Available',
      icon: '👤'
    },
    {
      title: 'Dice Roller',
      href: '/tools/dice-roller',
      description: 'A comprehensive dice rolling tool supporting all standard dice types with modifiers. Perfect for quick skill checks and damage rolls.',
      status: 'Available',
      icon: '🎲'
    },
    {
      title: 'Combat Tracker',
      href: '/tools/combat-tracker',
      description: 'Manage initiative, track hit points, and organize combat encounters with multiple participants.',
      status: 'Planned',
      icon: '⚔️'
    },
    {
      title: 'Name Generator',
      href: '/tools/name-generator',
      description: 'Generate authentic names for characters, places, and organizations that fit the SagaBorn setting.',
      status: 'Planned',
      icon: '📝'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Interactive Tools</h1>
          <p className="text-xl text-slate-400">
            Enhance your SagaBorn gaming experience with these interactive tools designed 
            to streamline character creation, gameplay, and campaign management.
          </p>
        </header>

        <div className="grid gap-6">
          {tools.map((tool) => (
            <div
              key={tool.href}
              className={`bg-slate-900 p-6 rounded-lg border border-slate-800 ${
                tool.status === 'Available' 
                  ? 'hover:border-slate-700 transition-colors' 
                  : 'opacity-75'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{tool.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold text-white">{tool.title}</h2>
                    <span 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tool.status === 'Available' 
                          ? 'bg-green-900 text-green-300 border border-green-700'
                          : tool.status === 'Coming Soon'
                          ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                          : 'bg-slate-800 text-slate-400 border border-slate-600'
                      }`}
                    >
                      {tool.status}
                    </span>
                  </div>
                  <p className="text-slate-400 mb-4">{tool.description}</p>
                  {tool.status === 'Available' ? (
                    <Link 
                      href={tool.href} 
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Use Tool →
                    </Link>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      {tool.status === 'Coming Soon' ? 'In Development' : 'Future Release'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-slate-900 p-6 rounded-lg border border-slate-800">
          <h2 className="text-xl font-semibold text-white mb-3">Request a Tool</h2>
          <p className="text-slate-400">
            Have an idea for a tool that would enhance your SagaBorn gaming experience? 
            Let us know what utilities would be most helpful for your campaigns!
          </p>
        </div>
      </div>
    </div>
  );
}