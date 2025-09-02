import Link from 'next/link';
import { getContentByType } from '@/lib/markdown';

export const metadata = {
  title: 'Equipment - SagaBorn D100 SRD',
  description: 'Weapons, armor, and gear for your SagaBorn D100 adventures.',
};

export default function EquipmentPage() {
  const equipment = getContentByType('equipment');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Equipment</h1>
          <p className="text-xl text-slate-400">
            Arm yourself with weapons, armor, and tools necessary for survival in the dangerous world of SagaBorn.
            Every piece of equipment has its place in your hero's journey.
          </p>
        </header>

        {equipment.length > 0 ? (
          <div className="grid gap-6">
            {equipment.map((item) => (
              <Link
                key={item.slug}
                href={`/equipment/${item.slug}`}
                className="block bg-slate-900 p-6 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <h2 className="text-2xl font-semibold text-white mb-2">{item.title}</h2>
                {item.description && (
                  <p className="text-slate-400 mb-4">{item.description}</p>
                )}
                <span className="text-blue-400 font-medium">View Details →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-800 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Equipment Lists Coming Soon</h2>
            <p className="text-slate-400">
              Comprehensive equipment lists including weapons, armor, adventuring gear, and magical items 
              are currently being compiled. Check back soon for detailed statistics and descriptions!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}