'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { Character } from '@/lib/character-data'
import { v4 as uuidv4 } from 'uuid'

/**
 * Several components each create their own useCharacters() instance (nav
 * switcher, dashboard, sheet, builder). This event keeps them in sync: any
 * instance that mutates characters dispatches it, and every instance
 * force-refetches on hearing it.
 */
const CHARACTERS_CHANGED_EVENT = 'sagaborn:characters-changed'
const notifyCharactersChanged = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHARACTERS_CHANGED_EVENT))
}

export interface SavedCharacter extends Character {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  is_active: boolean
}

// Temporary function to convert currentStep string to number for database compatibility
function convertCurrentStepToNumber(step: string): number {
  const stepMap: Record<string, number> = {
    'species': 1,
    'terian': 2,
    'fey': 2,
    'elven': 2,
    'teranCulture': 3,
    'dworvenCulture': 3,
    'dweranCulture': 3,
    'elflingCulture': 3,
    'feralElflingCulture': 3,
    'faunCulture': 3,
    'orogCulture': 3,
    'profession': 4,
    'archetype': 5,
    'name': 6,
    'characteristics': 7,
    'skills': 8,
    'equipment': 9,
    'complete': 10
  };
  
  return stepMap[step] || 1;
}

// Convert number back to currentStep string when loading from database
function convertNumberToCurrentStep(stepNumber: number | string): string {
  // Handle both number and string inputs
  const num = typeof stepNumber === 'string' ? parseInt(stepNumber) : stepNumber;
  
  const stepMap: Record<number, string> = {
    1: 'species',
    2: 'terian', // Default for step 2, may need refinement
    3: 'teranCulture', // Default for step 3, may need refinement
    4: 'profession',
    5: 'archetype',
    6: 'name',
    7: 'characteristics',
    8: 'skills',
    9: 'equipment',
    10: 'complete'
  };
  
  return stepMap[num] || 'complete';
}

export function useCharacters() {
  const { supabase, user } = useSupabase()
  const [characters, setCharacters] = useState<SavedCharacter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<number>(0)

  // Fetch characters for the current user
  const fetchCharacters = useCallback(async (force = false) => {
    if (!user) return

    // Skip fetch if we've fetched recently (within 30 seconds) unless forced
    const now = Date.now()
    if (!force && characters.length > 0 && (now - lastFetched) < 30000) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      setCharacters(data || [])
      setLastFetched(Date.now())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch characters'
      
      // Don't set error state if it's just missing tables - this is expected for new installations
      if (!errorMessage.includes('relation "characters" does not exist')) {
        setError(errorMessage)
        console.error('Error fetching characters:', err)
      } else {
        console.warn('Characters table not found (this is normal if database is not set up yet):', err)
        setCharacters([]) // Set empty array instead of error
      }
    } finally {
      setLoading(false)
    }
  }, [user, supabase, characters.length, lastFetched]);

  // Save a new character or update an existing one
  const saveCharacter = async (character: Character, characterId?: string) => {
    if (!user) {
      throw new Error('Must be logged in to save character')
    }

    setLoading(true)
    setError(null)

    try {
      // NOTE: is_active is deliberately NOT written here — an upsert leaves
      // omitted columns untouched on conflict, so saving a sheet or applying
      // a level-up no longer deactivates the active character. Likewise
      // current_step is only written when the caller actually knows it, so a
      // finished character can't be regressed to step 1 by a save from a
      // partially-hydrated object.
      const characterData: Record<string, unknown> = {
        id: characterId || uuidv4(),
        user_id: user.id,
        name: character.name,
        species: character.species,
        biology: character.biology,
        culture: character.culture,
        heritage: character.heritage,
        profession: character.profession,
        archetype: character.archetype,
        age: character.age,
        characteristics: character.characteristics,
        derived_stats: character.derivedStats,
        skills: character.skills,
        lifespan: character.lifespan,
        height: character.height,
        weight: character.weight,
        speed: character.speed,
        special_abilities: character.specialAbilities,
        starting_equipment: character.startingEquipment,
        starting_funds: character.startingFunds,
        starting_funds_amount: character.startingFundsAmount,
        updated_at: new Date().toISOString()
      }
      if (character.currentStep) {
        characterData.current_step = convertCurrentStepToNumber(character.currentStep)
      } else if (!characterId) {
        characterData.current_step = 1 // brand-new row needs a value
      }

      const { data, error } = await supabase
        .from('characters')
        .upsert(characterData)
        .select()
        .single()

      if (error) {
        console.error('Character save error:', error.message, error);
        throw new Error(`Database error: ${error.message || 'Unknown error'}`);
      }

      // Update local state from the row the DB actually returned (a forced
      // refetch here used to race the 30s cache and revert fresh edits).
      setCharacters(prev => {
        const exists = prev.some(c => c.id === data.id)
        return exists ? prev.map(c => (c.id === data.id ? data : c)) : [data, ...prev]
      })
      setLastFetched(Date.now())
      notifyCharactersChanged()

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save character';
      console.error('useCharacters: Full error:', err);
      console.error('useCharacters: Error type:', typeof err);
      console.error('useCharacters: Error instanceof Error:', err instanceof Error);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false)
    }
  }

  // Delete a character
  const deleteCharacter = async (characterId: string) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setCharacters(prev => prev.filter(char => char.id !== characterId))
      notifyCharactersChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character')
      console.error('Error deleting character:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Set active character
  const setActiveCharacter = async (characterId: string) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // First, set all characters to inactive
      await supabase
        .from('characters')
        .update({ is_active: false })
        .eq('user_id', user.id)

      // Then set the selected character as active
      const { error } = await supabase
        .from('characters')
        .update({ is_active: true })
        .eq('id', characterId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setCharacters(prev =>
        prev.map(char => ({
          ...char,
          is_active: char.id === characterId
        }))
      )
      notifyCharactersChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active character')
      console.error('Error setting active character:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get active character
  const getActiveCharacter = () => {
    return characters.find(char => char.is_active) || null
  }

  // Convert SavedCharacter back to Character for use in builder
  // savedChar arrives as a raw Supabase row (snake_case) — TODO(game-data refactor): add a DbCharacterRow type
  const toCharacter = (savedChar: any): Character => ({
    name: savedChar.name,
    species: savedChar.species,
    biology: savedChar.biology,
    culture: savedChar.culture,
    heritage: savedChar.heritage,
    profession: savedChar.profession,
    archetype: savedChar.archetype,
    age: savedChar.age,
    characteristics: savedChar.characteristics,
    derivedStats: savedChar.derived_stats,
    skills: savedChar.skills,
    lifespan: savedChar.lifespan,
    height: savedChar.height,
    weight: savedChar.weight,
    speed: savedChar.speed,
    specialAbilities: savedChar.special_abilities,
    startingEquipment: savedChar.starting_equipment,
    startingFunds: savedChar.starting_funds,
    startingFundsAmount: savedChar.starting_funds_amount,
    currentStep: convertNumberToCurrentStep(savedChar.current_step)
  })

  // Load characters when user changes
  useEffect(() => {
    if (user) {
      fetchCharacters()
    } else {
      setCharacters([])
    }
  }, [user])

  // Stay in sync when a different useCharacters() instance mutates data
  useEffect(() => {
    if (!user) return
    const onChanged = () => fetchCharacters(true)
    window.addEventListener(CHARACTERS_CHANGED_EVENT, onChanged)
    return () => window.removeEventListener(CHARACTERS_CHANGED_EVENT, onChanged)
  }, [user, fetchCharacters])

  return {
    characters,
    loading,
    error,
    fetchCharacters,
    saveCharacter,
    deleteCharacter,
    setActiveCharacter,
    getActiveCharacter,
    toCharacter
  }
}