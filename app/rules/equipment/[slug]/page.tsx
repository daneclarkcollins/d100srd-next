import { notFound } from 'next/navigation';
import remarkGfm from "remark-gfm";
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getContentBySlug, getAllContentSlugs } from '@/lib/markdown';
import DiceRoller from '@/components/DiceRoller/DiceRoller';

const components = {
  DiceRoller,
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllContentSlugs('equipment');
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const content = getContentBySlug('equipment', slug);
  
  if (!content) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: `${content.title} - SagaBorn D100 SRD`,
    description: content.description,
  };
}

export default async function EquipmentPage({ params }: PageProps) {
  const { slug } = await params;
  const content = getContentBySlug('equipment', slug);

  if (!content) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{content.title}</h1>
          {content.description && (
            <p className="text-xl text-slate-400">{content.description}</p>
          )}
        </header>
        
        <div className="prose prose-invert prose-slate max-w-none">
          <MDXRemote source={content.content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </div>
      </article>
    </div>
  );
}