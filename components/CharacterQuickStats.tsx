'use client'

import { useState, useEffect } from 'react'
import { useCharacterContext } from '@/contexts/CharacterContext'
import { 
  User, 
  Heart, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Minus, 
  Plus,
  Users,
  Minimize2,
  Maximize2
} from 'lucide-react'
import Link from 'next/link'

export default function CharacterQuickStats() {
  const { activeCharacter, adjustHP, adjustSP, loading, error } = useCharacterContext()
  const [expanded, setExpanded] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)

  // Add a small delay to prevent rapid flashing
  useEffect(() => {
    if (activeCharacter && !loading && !error) {
      const timer = setTimeout(() => setShouldShow(true), 300)
      return () => clearTimeout(timer)
    } else {
      setShouldShow(false)
    }
  }, [activeCharacter, loading, error])

  if (!shouldShow) {
    return null
  }

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setMinimized(false)}
          className="bg-slate-900 border border-slate-700 rounded-lg p-3 hover:bg-slate-800 transition-colors shadow-lg"
          title="Show character stats"
        >
          <User className="w-5 h-5 text-blue-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-slate-900 border border-slate-700 rounded-lg shadow-lg max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-white text-sm">
            {activeCharacter.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Basic Stats (Always Visible) */}
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-3">
          {/* HP */}
          <div className="bg-slate-800 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-xs text-slate-300">HP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">
                {activeCharacter.currentHP}/{activeCharacter.maxHP}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustHP(-1)}
                  className="w-5 h-5 bg-red-600 hover:bg-red-700 rounded text-xs flex items-center justify-center"
                  disabled={activeCharacter.currentHP <= 0}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => adjustHP(1)}
                  className="w-5 h-5 bg-green-600 hover:bg-green-700 rounded text-xs flex items-center justify-center"
                  disabled={activeCharacter.currentHP >= activeCharacter.maxHP}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* SP */}
          <div className="bg-slate-800 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-slate-300">SP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">
                {activeCharacter.currentSP}/{activeCharacter.maxSP}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustSP(-1)}
                  className="w-5 h-5 bg-red-600 hover:bg-red-700 rounded text-xs flex items-center justify-center"
                  disabled={activeCharacter.currentSP <= 0}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => adjustSP(1)}
                  className="w-5 h-5 bg-green-600 hover:bg-green-700 rounded text-xs flex items-center justify-center"
                  disabled={activeCharacter.currentSP >= activeCharacter.maxSP}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Adjustment Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 text-center">HP</div>
            <div className="flex gap-1 justify-center">
              <button
                onClick={() => adjustHP(-5)}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                disabled={activeCharacter.currentHP <= 0}
              >
                -5
              </button>
              <button
                onClick={() => adjustHP(5)}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                disabled={activeCharacter.currentHP >= activeCharacter.maxHP}
              >
                +5
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400 text-center">SP</div>
            <div className="flex gap-1 justify-center">
              <button
                onClick={() => adjustSP(-5)}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                disabled={activeCharacter.currentSP <= 0}
              >
                -5
              </button>
              <button
                onClick={() => adjustSP(5)}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                disabled={activeCharacter.currentSP >= activeCharacter.maxSP}
              >
                +5
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-700 p-3 space-y-3">
          {/* Characteristics */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Characteristics</h4>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="text-slate-400">STR</div>
                <div className="font-semibold text-white">{activeCharacter.characteristics.STR}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">CON</div>
                <div className="font-semibold text-white">{activeCharacter.characteristics.CON}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">SIZ</div>
                <div className="font-semibold text-white">{activeCharacter.characteristics.SIZ}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">INT</div>
                <div className="font-semibold text-white">{activeCharacter.characteristics.INT}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">ACU</div>
                <div className="font-semibold text-white">{activeCharacter.characteristics.ACU}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">DEX</div>
                <div className="font-semibold text-white">{activeCharacter.characteristics.DEX}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">SOC</div>
                <div className="font-semibold text-white">{activeCharacter.characteristics.SOC}</div>
              </div>
            </div>
          </div>

          {/* Derived Stats */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Derived Stats</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-slate-400">Effort</div>
                <div className="font-semibold text-white">{activeCharacter.derivedStats.effort}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Stamina</div>
                <div className="font-semibold text-white">{activeCharacter.derivedStats.stamina}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Intellect</div>
                <div className="font-semibold text-white">{activeCharacter.derivedStats.intellect}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Spirit</div>
                <div className="font-semibold text-white">{activeCharacter.derivedStats.spirit}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Agility</div>
                <div className="font-semibold text-white">{activeCharacter.derivedStats.agility}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Charm</div>
                <div className="font-semibold text-white">{activeCharacter.derivedStats.charm}</div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Combat</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-slate-400">Damage Modifier</div>
                <div className="font-semibold text-white">{activeCharacter.damageModifier}</div>
              </div>
              <div>
                <div className="text-slate-400">Movement</div>
                <div className="font-semibold text-white">{activeCharacter.movementSpeed} m</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link 
              href="/tools/dice-roller"
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs text-center transition-colors"
            >
              Dice Roller
            </Link>
            <Link 
              href="/tools/character-builder"
              className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded text-xs text-center transition-colors flex items-center justify-center gap-1"
            >
              <Users className="w-3 h-3" />
              Switch
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}