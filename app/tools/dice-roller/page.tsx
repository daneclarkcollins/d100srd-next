'use client'

import { useState, useEffect } from 'react'
import { useCharacterContext } from '@/contexts/CharacterContext'
import { 
  Dice1, 
  Dice2, 
  Dice3, 
  Dice4, 
  Dice5, 
  Dice6, 
  RotateCcw, 
  Target, 
  Zap, 
  Sword,
  Calculator,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

interface RollResult {
  id: string
  type: 'basic' | 'skill' | 'characteristic' | 'damage'
  description: string
  dice: string
  result: number[]
  total: number
  modifier?: number
  target?: number
  success?: boolean
  critical?: 'success' | 'failure' | null
  timestamp: Date
}

export default function DiceRollerPage() {
  const { activeCharacter } = useCharacterContext()
  const [rollHistory, setRollHistory] = useState<RollResult[]>([])
  const [customRoll, setCustomRoll] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedCharacteristic, setSelectedCharacteristic] = useState('')
  const [damageType, setDamageType] = useState('1d6')
  const [animating, setAnimating] = useState(false)

  // Roll dice function
  const rollDice = (sides: number, count: number = 1): number[] => {
    const rolls = []
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1)
    }
    return rolls
  }

  // Parse dice notation like "3d6+2"
  const parseDiceNotation = (notation: string): { count: number, sides: number, modifier: number } | null => {
    const match = notation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i)
    if (!match) return null
    
    const count = parseInt(match[1]) || 1
    const sides = parseInt(match[2])
    const modifier = parseInt(match[3]) || 0
    
    return { count, sides, modifier }
  }

  // Add roll to history
  const addRollToHistory = (roll: Omit<RollResult, 'id' | 'timestamp'>) => {
    const newRoll: RollResult = {
      ...roll,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setRollHistory(prev => [newRoll, ...prev.slice(0, 9)]) // Keep last 10 rolls
  }

  // Animate dice roll
  const animateRoll = async () => {
    setAnimating(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    setAnimating(false)
  }

  // Basic dice roll
  const rollBasicDice = async (sides: number, count: number = 1) => {
    await animateRoll()
    
    const results = rollDice(sides, count)
    const total = results.reduce((sum, roll) => sum + roll, 0)
    
    addRollToHistory({
      type: 'basic',
      description: `${count}d${sides}`,
      dice: `${count}d${sides}`,
      result: results,
      total
    })
  }

  // Skill check roll
  const rollSkillCheck = async (skillName: string) => {
    if (!activeCharacter) return
    
    await animateRoll()
    
    const skillValue = activeCharacter.skills[skillName] || 0
    const roll = rollDice(100, 1)[0]
    const success = roll <= skillValue
    const critical = roll <= 5 ? 'success' : roll >= 96 ? 'failure' : null
    
    addRollToHistory({
      type: 'skill',
      description: `${skillName} Check`,
      dice: '1d100',
      result: [roll],
      total: roll,
      target: skillValue,
      success,
      critical
    })
  }

  // Characteristic test
  const rollCharacteristicTest = async (characteristic: string) => {
    if (!activeCharacter) return
    
    await animateRoll()
    
    const charValue = activeCharacter.characteristics[characteristic as keyof typeof activeCharacter.characteristics]
    const target = charValue * 5
    const roll = rollDice(100, 1)[0]
    const success = roll <= target
    const critical = roll <= 5 ? 'success' : roll >= 96 ? 'failure' : null
    
    addRollToHistory({
      type: 'characteristic',
      description: `${characteristic} Test`,
      dice: '1d100',
      result: [roll],
      total: roll,
      target,
      success,
      critical
    })
  }

  // Damage roll
  const rollDamage = async (diceNotation: string) => {
    await animateRoll()
    
    const parsed = parseDiceNotation(diceNotation)
    if (!parsed) return
    
    const { count, sides, modifier } = parsed
    const results = rollDice(sides, count)
    const baseTotal = results.reduce((sum, roll) => sum + roll, 0)
    
    // Add character damage modifier if available
    let damageModifier = 0
    let modifierText = ''
    if (activeCharacter?.damageModifier && activeCharacter.damageModifier !== '0') {
      const dmMod = activeCharacter.damageModifier
      if (dmMod.includes('d')) {
        // Roll the damage modifier dice
        const dmParsed = parseDiceNotation(dmMod.replace('+', '').replace('-', ''))
        if (dmParsed) {
          const dmRolls = rollDice(dmParsed.sides, dmParsed.count)
          damageModifier = dmRolls.reduce((sum, roll) => sum + roll, 0)
          if (dmMod.startsWith('-')) damageModifier = -damageModifier
          modifierText = ` ${dmMod}`
        }
      }
    }
    
    const total = Math.max(0, baseTotal + modifier + damageModifier)
    
    addRollToHistory({
      type: 'damage',
      description: `Damage${modifierText}`,
      dice: diceNotation + (modifierText ? modifierText : ''),
      result: results,
      total,
      modifier: modifier + damageModifier
    })
  }

  // Custom roll
  const rollCustom = async () => {
    if (!customRoll.trim()) return
    
    const parsed = parseDiceNotation(customRoll.trim())
    if (!parsed) return
    
    await animateRoll()
    
    const { count, sides, modifier } = parsed
    const results = rollDice(sides, count)
    const total = results.reduce((sum, roll) => sum + roll, 0) + modifier
    
    addRollToHistory({
      type: 'basic',
      description: `Custom: ${customRoll}`,
      dice: customRoll,
      result: results,
      total,
      modifier: modifier || undefined
    })
  }

  // Get skill options
  const skillOptions = activeCharacter ? 
    Object.entries(activeCharacter.skills)
      .filter(([_, value]) => value > 0)
      .sort(([a], [b]) => a.localeCompare(b))
    : []

  // Clear history
  const clearHistory = () => {
    setRollHistory([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">SagaBorn Dice Roller</h1>
          <p className="text-xl text-slate-400">
            Professional dice roller with character integration
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Dice Rolling Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Dice */}
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Dice6 className="w-5 h-5" />
                Quick Dice
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[4, 6, 8, 10, 20, 100].map(sides => (
                  <button
                    key={sides}
                    onClick={() => rollBasicDice(sides)}
                    disabled={animating}
                    className={`p-4 rounded-lg border-2 border-slate-700 hover:border-blue-500 transition-all ${
                      animating ? 'animate-pulse' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-2xl font-bold text-white">d{sides}</div>
                    <div className="text-xs text-slate-400">1-{sides}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Character Skills */}
            {activeCharacter && skillOptions.length > 0 && (
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Skill Checks
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="">Select a skill...</option>
                      {skillOptions.map(([skill, value]) => (
                        <option key={skill} value={skill}>
                          {skill} ({value}%)
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => selectedSkill && rollSkillCheck(selectedSkill)}
                      disabled={!selectedSkill || animating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Roll d100
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Characteristic Tests */}
            {activeCharacter && (
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Characteristic Tests
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(activeCharacter.characteristics).map(([char, value]) => (
                    <button
                      key={char}
                      onClick={() => rollCharacteristicTest(char)}
                      disabled={animating}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-center"
                    >
                      <div className="font-bold text-white">{char}</div>
                      <div className="text-sm text-slate-300">{value}</div>
                      <div className="text-xs text-slate-400">vs {value * 5}%</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Damage Rolls */}
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Sword className="w-5 h-5" />
                Damage Rolls
                {activeCharacter?.damageModifier && activeCharacter.damageModifier !== '0' && (
                  <span className="text-sm text-green-400">
                    (DM: {activeCharacter.damageModifier})
                  </span>
                )}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['1d4', '1d6', '1d8', '1d10', '2d6', '3d6'].map(dice => (
                    <button
                      key={dice}
                      onClick={() => rollDamage(dice)}
                      disabled={animating}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <div className="font-bold text-white">{dice}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={damageType}
                    onChange={(e) => setDamageType(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="1d4">1d4 (Dagger, etc.)</option>
                    <option value="1d6">1d6 (Sword, etc.)</option>
                    <option value="1d8">1d8 (Longsword, etc.)</option>
                    <option value="1d10">1d10 (Polearm, etc.)</option>
                    <option value="2d6">2d6 (Greatsword, etc.)</option>
                    <option value="1d6+1">1d6+1 (Magic weapon +1)</option>
                    <option value="1d8+2">1d8+2 (Magic weapon +2)</option>
                  </select>
                  <button
                    onClick={() => rollDamage(damageType)}
                    disabled={animating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Roll Damage
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Roll */}
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Custom Roll
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRoll}
                    onChange={(e) => setCustomRoll(e.target.value)}
                    placeholder="e.g., 3d6+2, 2d10-1, 1d20"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400"
                    onKeyPress={(e) => e.key === 'Enter' && rollCustom()}
                  />
                  <button
                    onClick={rollCustom}
                    disabled={!customRoll.trim() || animating}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    Roll
                  </button>
                </div>
                <div className="text-sm text-slate-400">
                  Format: [number]d[sides][+/-modifier] (e.g., 3d6+2, 1d20, 2d8-1)
                </div>
              </div>
            </div>
          </div>

          {/* Roll History */}
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Roll History
              </h2>
              {rollHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rollHistory.length === 0 ? (
                <div className="text-slate-400 text-center py-8">
                  No rolls yet. Start rolling some dice!
                </div>
              ) : (
                rollHistory.map(roll => (
                  <div key={roll.id} className="bg-slate-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white">
                        {roll.description}
                      </span>
                      <span className="text-xs text-slate-400">
                        {roll.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-slate-300">{roll.dice}</span>
                      <span className="text-slate-500">→</span>
                      <span className="font-mono text-sm text-slate-300">
                        [{roll.result.join(', ')}]
                      </span>
                      {roll.modifier && roll.modifier !== 0 && (
                        <span className="text-sm text-slate-300">
                          {roll.modifier > 0 ? '+' : ''}{roll.modifier}
                        </span>
                      )}
                      <span className="text-slate-500">=</span>
                      <span className="font-bold text-white">{roll.total}</span>
                    </div>
                    
                    {roll.target !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          Target: {roll.target}%
                        </span>
                        <div className="flex items-center gap-1">
                          {roll.success ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-400" />
                          )}
                          <span className={`text-xs font-semibold ${
                            roll.success ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {roll.success ? 'Success' : 'Failure'}
                          </span>
                          {roll.critical && (
                            <>
                              <AlertTriangle className="w-3 h-3 text-yellow-400 ml-1" />
                              <span className="text-xs font-semibold text-yellow-400">
                                Critical {roll.critical === 'success' ? 'Success' : 'Failure'}!
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}