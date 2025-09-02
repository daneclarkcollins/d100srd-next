'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { useCharacters, SavedCharacter } from '@/hooks/useCharacters'
import { Character } from '@/lib/character-data'

interface ActiveCharacterStats extends Character {
  id: string
  currentHP: number
  currentSP: number
  maxHP: number
  maxSP: number
  damageModifier: string
  experienceBonus: number
  movementSpeed: number
}

interface CharacterContextType {
  activeCharacter: ActiveCharacterStats | null
  loading: boolean
  error: string | null
  loadActiveCharacter: () => Promise<void>
  setActiveCharacter: (characterId: string) => Promise<void>
  refreshCharacter: () => Promise<void>
  updateCharacterHP: (newHP: number) => Promise<void>
  updateCharacterSP: (newSP: number) => Promise<void>
  adjustHP: (delta: number) => Promise<void>
  adjustSP: (delta: number) => Promise<void>
  clearActiveCharacter: () => void
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

interface CharacterProviderProps {
  children: ReactNode
}

export function CharacterProvider({ children }: CharacterProviderProps) {
  const { user, supabase } = useSupabase()
  const { characters, fetchCharacters, setActiveCharacter: setActiveInDB } = useCharacters()
  const [activeCharacter, setActiveCharacter] = useState<ActiveCharacterStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate damage modifier based on STR + SIZ
  const calculateDamageModifier = (str: number, siz: number): string => {
    const combined = str + siz
    if (combined <= 12) return '-1d4'
    if (combined <= 16) return '-1d6'
    if (combined <= 24) return '0'
    if (combined <= 32) return '+1d4'
    if (combined <= 40) return '+1d6'
    if (combined <= 56) return '+2d6'
    if (combined <= 72) return '+3d6'
    if (combined <= 88) return '+4d6'
    return '+5d6'
  }

  // Calculate experience bonus based on INT + ACU
  const calculateExperienceBonus = (int: number, acu: number): number => {
    const combined = int + acu
    if (combined >= 33) return 4
    if (combined >= 29) return 3
    if (combined >= 25) return 2
    if (combined >= 21) return 1
    return 0
  }

  // Calculate movement speed based on DEX + STR
  const calculateMovementSpeed = (dex: number, str: number, siz: number): number => {
    if (dex >= siz && str >= siz) return 8
    if (dex > siz || str > siz) return 6
    return 4
  }

  // Convert SavedCharacter to ActiveCharacterStats
  const createActiveCharacterStats = (savedChar: SavedCharacter): ActiveCharacterStats => {
    const damageModifier = calculateDamageModifier(
      savedChar.characteristics.STR,
      savedChar.characteristics.SIZ
    )

    const experienceBonus = calculateExperienceBonus(
      savedChar.characteristics.INT,
      savedChar.characteristics.ACU
    )

    const movementSpeed = calculateMovementSpeed(
      savedChar.characteristics.DEX,
      savedChar.characteristics.STR,
      savedChar.characteristics.SIZ
    )

    return {
      id: savedChar.id,
      name: savedChar.name,
      species: savedChar.species,
      biology: savedChar.biology,
      culture: savedChar.culture,
      heritage: savedChar.heritage,
      profession: savedChar.profession,
      archetype: savedChar.archetype,
      age: savedChar.age,
      characteristics: savedChar.characteristics,
      derivedStats: {
        ...savedChar.derived_stats,
        damageModifier,
        experienceBonus,
        movementSpeed
      },
      skills: savedChar.skills,
      lifespan: savedChar.lifespan,
      height: savedChar.height,
      weight: savedChar.weight,
      speed: savedChar.speed,
      specialAbilities: savedChar.special_abilities,
      startingEquipment: savedChar.starting_equipment,
      startingFunds: savedChar.starting_funds,
      startingFundsAmount: savedChar.starting_funds_amount,
      currentStep: savedChar.current_step,
      currentHP: savedChar.derived_stats.hitPoints, // Start with max HP
      currentSP: savedChar.derived_stats.spiritPoints, // Start with max SP
      maxHP: savedChar.derived_stats.hitPoints,
      maxSP: savedChar.derived_stats.spiritPoints,
      damageModifier,
      experienceBonus,
      movementSpeed
    }
  }

  // Load the active character from database
  const loadActiveCharacter = async () => {
    if (!user) {
      setActiveCharacter(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await fetchCharacters()
      
      // Find the active character
      const activeChar = characters.find(char => char.is_active)
      
      if (activeChar) {
        setActiveCharacter(createActiveCharacterStats(activeChar))
      } else {
        setActiveCharacter(null)
      }
    } catch (err) {
      // Don't show error if it's just missing tables - this is expected for new installations
      const errorMessage = err instanceof Error ? err.message : 'Failed to load active character'
      if (!errorMessage.includes('relation "characters" does not exist')) {
        setError(errorMessage)
      }
      console.warn('Error loading active character (this is normal if database tables are not set up yet):', err)
    } finally {
      setLoading(false)
    }
  }

  // Set a character as active
  const setActiveCharacterById = async (characterId: string) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await setActiveInDB(characterId)
      await loadActiveCharacter()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active character')
      console.error('Error setting active character:', err)
    } finally {
      setLoading(false)
    }
  }

  // Refresh the current active character
  const refreshCharacter = async () => {
    await loadActiveCharacter()
  }

  // Update character's current HP in database
  const updateCharacterHP = async (newHP: number) => {
    if (!activeCharacter || !user) return

    const clampedHP = Math.max(0, Math.min(newHP, activeCharacter.maxHP))

    try {
      // Update local state first (optimistic update)
      setActiveCharacter(prev => prev ? {
        ...prev,
        currentHP: clampedHP
      } : null)

      // Try to update in database
      const { data: existingData, error: selectError } = await supabase
        .from('character_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('character_id', activeCharacter.id)
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is expected for new records
        throw selectError
      }

      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('character_profiles')
          .update({
            current_hp: clampedHP,
            current_sp: activeCharacter.currentSP,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('character_id', activeCharacter.id)

        if (updateError) throw updateError
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('character_profiles')
          .insert({
            user_id: user.id,
            character_id: activeCharacter.id,
            current_hp: clampedHP,
            current_sp: activeCharacter.currentSP,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) throw insertError
      }

      console.log('HP updated successfully in database')

    } catch (err) {
      let errorMessage = 'Unknown error occurred'
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (err && typeof err === 'object') {
        // Handle Supabase error objects
        errorMessage = (err as any).message || (err as any).error_description || JSON.stringify(err)
      }
      
      console.error('Error updating HP:', errorMessage)
      console.error('Full error object:', err)
      setError(`Failed to update HP: ${errorMessage}`)
    }
  }

  // Update character's current SP in database
  const updateCharacterSP = async (newSP: number) => {
    if (!activeCharacter || !user) return

    const clampedSP = Math.max(0, Math.min(newSP, activeCharacter.maxSP))

    try {
      // Update local state first (optimistic update)
      setActiveCharacter(prev => prev ? {
        ...prev,
        currentSP: clampedSP
      } : null)

      // Try to update in database
      const { data: existingData, error: selectError } = await supabase
        .from('character_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('character_id', activeCharacter.id)
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is expected for new records
        throw selectError
      }

      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('character_profiles')
          .update({
            current_hp: activeCharacter.currentHP,
            current_sp: clampedSP,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('character_id', activeCharacter.id)

        if (updateError) throw updateError
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('character_profiles')
          .insert({
            user_id: user.id,
            character_id: activeCharacter.id,
            current_hp: activeCharacter.currentHP,
            current_sp: clampedSP,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) throw insertError
      }

      console.log('SP updated successfully in database')

    } catch (err) {
      let errorMessage = 'Unknown error occurred'
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (err && typeof err === 'object') {
        // Handle Supabase error objects
        errorMessage = (err as any).message || (err as any).error_description || JSON.stringify(err)
      }
      
      console.error('Error updating SP:', errorMessage)
      console.error('Full error object:', err)
      setError(`Failed to update SP: ${errorMessage}`)
    }
  }

  // Adjust HP by delta
  const adjustHP = async (delta: number) => {
    if (!activeCharacter) return
    await updateCharacterHP(activeCharacter.currentHP + delta)
  }

  // Adjust SP by delta
  const adjustSP = async (delta: number) => {
    if (!activeCharacter) return
    await updateCharacterSP(activeCharacter.currentSP + delta)
  }

  // Clear active character
  const clearActiveCharacter = () => {
    setActiveCharacter(null)
    setError(null)
  }

  // Load active character when user changes or characters list updates
  useEffect(() => {
    if (user && characters.length > 0) {
      loadActiveCharacter()
    } else if (!user) {
      clearActiveCharacter()
    }
  }, [user, characters])

  // Load current HP/SP from character_status table when active character changes
  useEffect(() => {
    const loadCurrentStatus = async () => {
      if (!activeCharacter || !user) return

      try {
        const { data, error } = await supabase
          .from('character_profiles')
          .select('current_hp, current_sp')
          .eq('character_id', activeCharacter.id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          throw error
        }

        if (data) {
          setActiveCharacter(prev => prev ? {
            ...prev,
            currentHP: data.current_hp ?? prev.maxHP,
            currentSP: data.current_sp ?? prev.maxSP
          } : null)
        }
      } catch (err) {
        let errorMessage = 'Unknown error occurred'
        
        if (err instanceof Error) {
          errorMessage = err.message
        } else if (err && typeof err === 'object') {
          // Handle Supabase error objects
          errorMessage = (err as any).message || (err as any).error_description || JSON.stringify(err)
        }
        
        console.error('Error loading character status:', errorMessage)
        console.error('Full error object:', err)
      }
    }

    loadCurrentStatus()
  }, [activeCharacter?.id])

  const value: CharacterContextType = {
    activeCharacter,
    loading,
    error,
    loadActiveCharacter,
    setActiveCharacter: setActiveCharacterById,
    refreshCharacter,
    updateCharacterHP,
    updateCharacterSP,
    adjustHP,
    adjustSP,
    clearActiveCharacter
  }

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacterContext() {
  const context = useContext(CharacterContext)
  if (context === undefined) {
    throw new Error('useCharacterContext must be used within a CharacterProvider')
  }
  return context
}