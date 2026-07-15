"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CharacterSheet from '@/components/CharacterSheet';
import LevelUpModal from '@/components/Advancement/LevelUpModal';
import { useCharacters } from '@/hooks/useCharacters';
import { Character } from '@/lib/character-data';

function CharacterSheetPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const characterId = searchParams.get('id');
  
  const { characters, loading: charactersLoading, saveCharacter } = useCharacters();
  const [character, setCharacter] = useState<Character | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!charactersLoading && characterId) {
      const foundCharacter = characters.find(c => c.id === characterId);
      if (foundCharacter) {
        setCharacter(foundCharacter as any);
      }
    }
    setLoading(charactersLoading);
  }, [characterId, characters, charactersLoading]);

  const handleEdit = () => {
    if (character) {
      // Navigate to character builder with the character loaded at characteristics step
      router.push(`/tools/character-builder?edit=${characterId}&step=characteristics`);
    }
  };

  const handleSave = async () => {
    if (character) {
      try {
        await saveCharacter(character, characterId ?? undefined);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        console.error('Failed to save character:', error);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateNew = () => {
    router.push('/tools/character-builder');
  };

  const handleLevelUp = () => {
    setShowLevelUpModal(true);
  };

  const handleAdvancementChange = async (updated: Character) => {
    setCharacter(updated);
    try {
      await saveCharacter(updated, characterId ?? undefined);
    } catch (error) {
      console.error('Failed to save advancement changes:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading character...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Character not found</p>
          <Link
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Character Sheet */}
        <CharacterSheet
          character={character}
          onEdit={handleEdit}
          onSave={handleSave}
          onPrint={handlePrint}
          onCreateNew={handleCreateNew}
          onLevelUp={handleLevelUp}
          saveSuccess={saveSuccess}
        />

        {/* Level Up Modal */}
        {characterId && (
          <LevelUpModal
            isOpen={showLevelUpModal}
            onClose={() => setShowLevelUpModal(false)}
            character={character}
            characterId={characterId}
            onCharacterChange={handleAdvancementChange}
          />
        )}
      </div>
    </div>
  );
}
export default function CharacterSheetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <CharacterSheetPageInner />
    </Suspense>
  );
}
