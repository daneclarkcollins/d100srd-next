import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            SagaBorn <span className="text-blue-400">D100</span>
          </h1>
          <h2 className="text-2xl text-blue-300 mb-6">System Reference Document</h2>
          <p className="text-xl text-slate-300 mb-4 max-w-3xl mx-auto">
            A streamlined fantasy roleplaying system based on Chaosium's Basic Roleplaying (BRP) ruleset, 
            reimagined for fast-paced, narrative-driven adventures in the dark fantasy world of the Dark Return.
          </p>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Featuring percentile-based gameplay with intuitive mechanics, modular character creation, 
            and rich storytelling tools. Perfect for players who want immersive gameplay without complex rule bloat.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/rules" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse SRD Rules
            </Link>
            <Link 
              href="/tools/character-builder" 
              className="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Character
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-800">
            <h2 className="text-2xl font-semibold text-white mb-4">About SagaBorn D100</h2>
            <p className="text-slate-400 mb-4">
              SagaBorn D100 is fully compatible with BRP mechanics, making it easy for fans of 
              percentile-based systems to transition and customize their campaigns. The SRD includes 
              open game content under a generous license.
            </p>
            <p className="text-slate-400">
              Whether you are searching for a free d100 fantasy RPG, a BRP-inspired OSR alternative, 
              or a complete open source ruleset to build your world upon, the SagaBorn D100 SRD is here for you.
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-lg border border-slate-800">
            <h2 className="text-2xl font-semibold text-white mb-4">System Highlights</h2>
            <ul className="text-slate-400 space-y-2">
              <li>• <strong className="text-white">Percentile-based (d100) system</strong> for intuitive resolution</li>
              <li>• <strong className="text-white">Modular character creation</strong> with lifepath system</li>
              <li>• <strong className="text-white">Mana-based magic</strong> with freeform spellcasting</li>
              <li>• <strong className="text-white">Combat Value (CV) scaling</strong> for monsters and NPCs</li>
              <li>• <strong className="text-white">Streamlined rules</strong> without complex bloat</li>
              <li>• <strong className="text-white">Dark fantasy setting</strong> in the world of Atheles</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
