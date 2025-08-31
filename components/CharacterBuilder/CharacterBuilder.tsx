"use client";

import Link from 'next/link';

export default function CharacterBuilder() {
  return (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 my-6">
      <h3 className="text-xl font-semibold text-white mb-4">Character Builder</h3>
      <p className="text-slate-400 mb-4">
        Use our interactive character builder to create your SagaBorn hero step by step.
      </p>
      <Link 
        href="/tools/character-builder" 
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
      >
        Start Building →
      </Link>
    </div>
  );
}