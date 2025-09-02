"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CharacterSheet from '@/components/CharacterSheet';
import Modal from '@/components/Modal/Modal';
import { useCharacters } from '@/hooks/useCharacters';
import { Character } from '@/lib/character-data';

export default function CharacterSheetPage() {
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
        await saveCharacter(character);
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
        <Modal
          isOpen={showLevelUpModal}
          onClose={() => setShowLevelUpModal(false)}
          title="Level Up - Coming Soon!"
          size="sm"
        >
          <div className="text-center py-4">
            <div className="text-6xl mb-4">🎲</div>
            <p className="text-white text-lg mb-2">
              The Level Up feature is coming soon!
            </p>
            <p className="text-slate-400">
              You'll be able to advance your character, gain new skills, and increase your abilities.
            </p>
            <button
              onClick={() => setShowLevelUpModal(false)}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}