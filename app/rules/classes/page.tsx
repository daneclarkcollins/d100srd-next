import Link from 'next/link';
import { getContentByType } from '@/lib/markdown';

export const metadata = {
  title: 'Character Classes - SagaBorn D100 SRD',
  description: 'Explore the diverse character classes available in SagaBorn D100, from warriors to mages.',
};

export default function ClassesPage() {
  const classes = getContentByType('classes');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Character Classes</h1>
          <p className="text-xl text-slate-400">
            Choose your path and define your hero's role in the world of SagaBorn.
            Each class offers unique abilities, skills, and approaches to adventure.
          </p>
        </header>

        {classes.length > 0 ? (
          <div className="grid gap-6">
            {classes.map((classItem) => (
              <Link
                key={classItem.slug}
                href={`/classes/${classItem.slug}`}
                className="block bg-slate-900 p-6 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <h2 className="text-2xl font-semibold text-white mb-2">{classItem.title}</h2>
                {classItem.description && (
                  <p className="text-slate-400 mb-4">{classItem.description}</p>
                )}
                <span className="text-blue-400 font-medium">Learn More →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-800 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Classes Coming Soon</h2>
            <p className="text-slate-400">
              Character class descriptions are currently being prepared. Check back soon for detailed 
              information about Warriors, Mages, Rogues, and more!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}