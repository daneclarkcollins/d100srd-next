import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";
import { MDXRemote } from "next-mdx-remote/rsc";
import { 
  getContentBySlug, 
  getContentBySlugNested, 
  getAllContentSlugs, 
  getAllContentSlugsNested 
} from "@/lib/markdown";
import DiceRoller from "@/components/DiceRoller/DiceRoller";
import CharacterBuilder from "@/components/CharacterBuilder/CharacterBuilder";

const components = {
  DiceRoller,
  CharacterBuilder,
};

interface Props {
  params: Promise<{
    slug: string[]
  }>;
}

export default async function RulePage({ params }: Props) {
  const { slug } = await params;

  let content;
  
  if (slug.length === 1) {
    // Single level: /rules/[slug]
    content = getContentBySlug("rules", slug[0]);
  } else if (slug.length === 2) {
    // Two levels: /rules/[category]/[slug]
    content = getContentBySlugNested("rules", slug[0], slug[1]);
  } else {
    // More than 2 levels not supported currently
    notFound();
  }

  if (!content) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="prose prose-invert prose-slate max-w-4xl mx-auto">
        <h1>{content.title}</h1>
        {content.description && (
          <p className="text-xl text-slate-400 mb-8">{content.description}</p>
        )}
        <MDXRemote source={content.content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  // Get all single-level rules
  const singleLevelSlugs = getAllContentSlugs("rules").map(slug => ({
    slug: [slug]
  }));

  // Get all nested rules (classes, equipment, spells)
  const nestedCategories = ["classes", "equipment", "spells"];
  const nestedSlugs = nestedCategories.flatMap(category => 
    getAllContentSlugsNested("rules", category).map(slug => ({
      slug: [category, slug]
    }))
  );

  return [...singleLevelSlugs, ...nestedSlugs];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  
  let content;
  if (slug.length === 1) {
    content = getContentBySlug("rules", slug[0]);
  } else if (slug.length === 2) {
    content = getContentBySlugNested("rules", slug[0], slug[1]);
  }

  if (!content) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: `${content.title} - SagaBorn D100 SRD`,
    description: content.description || `Learn about ${content.title} in the SagaBorn D100 SRD.`,
  };
}