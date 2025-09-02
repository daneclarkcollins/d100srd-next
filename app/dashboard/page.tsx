'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/components/SupabaseProvider'
import { useCharacters } from '@/hooks/useCharacters'
import { Play, CheckCircle, Download, Trash2, Edit, TrendingUp } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Modal from '@/components/Modal/Modal'

export default function DashboardPage() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { characters, loading: charactersLoading, deleteCharacter, setActiveCharacter, toCharacter } = useCharacters()
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [deletingCharacter, setDeletingCharacter] = useState<string | null>(null)
  const [showLevelUpModal, setShowLevelUpModal] = useState(false)

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login')
    }
    setLoading(false)
  }, [user, router, loading])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteCharacter = async (characterId: string, characterName: string) => {
    if (!confirm(`Are you sure you want to delete "${characterName}"? This cannot be undone.`)) {
      return
    }

    setDeletingCharacter(characterId)
    try {
      await deleteCharacter(characterId)
    } catch (err) {
      console.error('Failed to delete character:', err)
      alert('Failed to delete character. Please try again.')
    } finally {
      setDeletingCharacter(null)
    }
  }

  const handleSetActive = async (characterId: string) => {
    try {
      await setActiveCharacter(characterId)
    } catch (err) {
      console.error('Failed to set active character:', err)
    }
  }

  const handleExportCharacter = (character: any) => {
    const charData = toCharacter(character)
    const dataStr = JSON.stringify(charData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${charData.name || 'character'}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back!
              </h1>
              <p className="text-gray-400">
                Signed in as <span className="text-blue-400 font-medium">{user.email}</span>
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-400 bg-transparent hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>

        {/* Characters Section */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Characters</h2>
            <Link
              href="/tools/character-builder"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Character
            </Link>
          </div>
          
          {charactersLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading characters...</div>
            </div>
          ) : characters.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-600 mb-4">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No characters yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first SagaBorn character to begin your adventure
              </p>
            </div>
          ) : (
            /* Characters Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((character) => (
                <div key={character.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{character.name}</h3>
                      <p className="text-sm text-gray-400">
                        {character.species} {character.profession && `• ${character.profession}`}
                      </p>
                    </div>
                    {character.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetActive(character.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                  
                  {(character as any).derived_stats && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-4">
                      <div>HP: {(character as any).derived_stats.hitPoints}</div>
                      <div>SP: {(character as any).derived_stats.spiritPoints}</div>
                    </div>
                  )}
                  
                  <div className="relative flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/tools/character-sheet?id=${character.id}`}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        title="View Character Sheet"
                      >
                        <Play className="w-4 h-4" />
                        Load
                      </Link>
                      <Link
                        href={`/tools/character-builder?edit=${character.id}&step=characteristics`}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-600 text-white rounded text-sm hover:bg-slate-700 transition-colors"
                        title="Edit Character"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    </div>

                    <button
                      onClick={() => setShowLevelUpModal(true)}
                      className="flex items-center justify-center gap-1 px-3 py-2 mb-8 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors cursor-pointer"
                      title="Level Up Character"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Level Up
                    </button>

                    {/* Small icon buttons in bottom right */}
                    <div className="absolute bottom-0 right-0 flex gap-1">
                      <button
                        onClick={() => handleExportCharacter(character)}
                        className="p-1 bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors cursor-pointer"
                        title="Export Character"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCharacter(character.id, character.name)}
                        disabled={deletingCharacter === character.id}
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        title={deletingCharacter === character.id ? 'Deleting...' : 'Delete Character'}
                      >
                        {deletingCharacter === character.id ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/rules"
            className="bg-slate-800 rounded-lg shadow-xl p-6 hover:bg-slate-700 transition-colors group"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 1 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">
                  Browse Rules
                </h3>
                <p className="text-gray-400 text-sm">
                  Reference the complete SagaBorn ruleset
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/tools"
            className="bg-slate-800 rounded-lg shadow-xl p-6 hover:bg-slate-700 transition-colors group"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition-colors">
                  Game Tools
                </h3>
                <p className="text-gray-400 text-sm">
                  Access dice rollers and utilities
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

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
  )
}