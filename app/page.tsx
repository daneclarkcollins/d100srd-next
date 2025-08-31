import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            SagaBorn <span className="text-blue-400">D100</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            A fantasy tabletop RPG system that combines classic d100 mechanics with modern storytelling.
            Build legendary heroes and forge epic sagas.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/rules" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Core Rules
            </Link>
            <Link 
              href="/tools/character-builder" 
              className="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Character Builder
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h3 className="text-xl font-semibold text-white mb-3">Core Rules</h3>
            <p className="text-slate-400 mb-4">
              Learn the fundamental mechanics of SagaBorn D100, from character creation to combat.
            </p>
            <Link href="/rules" className="text-blue-400 hover:text-blue-300 font-medium">
              Start Learning →
            </Link>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h3 className="text-xl font-semibold text-white mb-3">Character Classes</h3>
            <p className="text-slate-400 mb-4">
              Explore the diverse classes available to create your perfect hero.
            </p>
            <Link href="/classes" className="text-blue-400 hover:text-blue-300 font-medium">
              View Classes →
            </Link>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h3 className="text-xl font-semibold text-white mb-3">Interactive Tools</h3>
            <p className="text-slate-400 mb-4">
              Use our character builder and other tools to enhance your gameplay.
            </p>
            <Link href="/tools" className="text-blue-400 hover:text-blue-300 font-medium">
              Use Tools →
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-lg border border-slate-800 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Recent Updates</h2>
          <p className="text-slate-400">
            Stay tuned for the latest rules updates and new content additions.
          </p>
        </div>
      </main>
    </div>
  );
}
