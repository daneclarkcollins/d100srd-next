'use client'

import { useState, useEffect } from 'react'
import { useCharacters, SavedCharacter } from '@/hooks/useCharacters'
import { useSupabase } from '@/components/SupabaseProvider'
import { User, Play, Trash2, Download, Upload, Plus, X, CheckCircle } from 'lucide-react'
import { Character } from '@/lib/character-data'

interface CharacterListProps {
  onLoadCharacter: (character: Character, characterId: string) => void
  onCreateNew: () => void
  refreshTrigger?: number // Add a trigger to force refresh
}

export default function CharacterList({ onLoadCharacter, onCreateNew, refreshTrigger }: CharacterListProps) {
  const { user } = useSupabase()
  const { characters, loading, error, deleteCharacter, setActiveCharacter, toCharacter, fetchCharacters } = useCharacters()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Refresh characters when trigger changes
  useEffect(() => {
    if (refreshTrigger && user) {
      fetchCharacters(true) // Force refresh
    }
  }, [refreshTrigger, user, fetchCharacters])

  const handleLoadCharacter = (savedChar: SavedCharacter) => {
    const character = toCharacter(savedChar)
    onLoadCharacter(character, savedChar.id)
  }

  const handleSetActive = async (characterId: string) => {
    try {
      await setActiveCharacter(characterId)
    } catch (err) {
      console.error('Failed to set active character:', err)
    }
  }

  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character? This cannot be undone.')) {
      return
    }

    setDeletingId(characterId)
    try {
      await deleteCharacter(characterId)
    } catch (err) {
      console.error('Failed to delete character:', err)
    }
    setDeletingId(null)
  }

  const handleExportCharacter = (savedChar: SavedCharacter) => {
    const character = toCharacter(savedChar)
    const dataStr = JSON.stringify(character, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${character.name || 'character'}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const formatCharacterSummary = (char: SavedCharacter) => {
    const parts = []
    if (char.species) parts.push(char.species)
    if (char.biology && char.biology !== char.species) parts.push(char.biology)
    if (char.profession) parts.push(char.profession)
    return parts.join(' • ')
  }

  const getCharacterLevel = (char: SavedCharacter) => {
    // Calculate rough "level" based on completion
    if (char.current_step === 'complete') return 'Complete'
    if (char.current_step === 'equipment') return 'Nearly Complete'
    if (char.current_step === 'skills') return 'In Progress'
    return 'Started'
  }

  if (!user) {
    return (
      <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 h-fit">
        <h3 className="text-xl font-semibold text-white mb-4">
          My Characters
        </h3>
        
        <div className="text-center py-8">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">
            Log in to save and manage your characters
          </p>
          <button
            onClick={() => setShowLoginPrompt(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In / Sign Up
          </button>
        </div>

        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Authentication Required</h3>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-300 mb-4">
                Please log in or create an account to save your characters to the cloud.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Log In
                </button>
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 h-fit">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white">
          My Characters
        </h3>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="text-slate-400">Loading characters...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-400">
          Error: {error}
        </div>
      )}

      {!loading && !error && characters.length === 0 && (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">
            No saved characters yet
          </p>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {characters.length === 0 ? 'Create Your First Character' : 'Create Another Character'}
          </button>
        </div>
      )}

      {!loading && characters.length > 0 && (
        <div className="space-y-3">
          {characters.map((char) => (
            <div
              key={char.id}
              className={`border rounded-lg p-4 transition-colors ${
                char.is_active
                  ? 'border-green-500 bg-green-950/20'
                  : 'border-slate-700 bg-slate-800 hover:bg-slate-750'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">
                      {char.name || 'Unnamed Character'}
                    </h4>
                    {char.is_active ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <button
                        onClick={() => handleSetActive(char.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">
                    {formatCharacterSummary(char)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-3">
                <button
                  onClick={() => handleLoadCharacter(char)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Load
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportCharacter(char)}
                    className="flex items-center justify-center flex-1 px-3 py-2 h-10 bg-slate-600 text-white rounded text-sm hover:bg-slate-500 transition-colors"
                    title="Export Character"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteCharacter(char.id)}
                    disabled={deletingId === char.id}
                    className="flex items-center justify-center flex-1 px-3 py-2 h-10 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                    title={deletingId === char.id ? 'Deleting...' : 'Delete Character'}
                  >
                    {deletingId === char.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-500">
          Logged in as {user.email}
        </div>
      </div>
    </div>
  )
}