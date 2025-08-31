'use client'

import { useState } from 'react'
import { Dice6 } from 'lucide-react'

interface DiceRollerProps {
  dice?: string
  label?: string
  modifier?: number
}

export default function DiceRoller({ dice = '1d20', label = 'Roll', modifier = 0 }: DiceRollerProps) {
  const [result, setResult] = useState<number | null>(null)
  const [rolls, setRolls] = useState<number[]>([])
  
  const rollDice = () => {
    const [count, sides] = dice.toLowerCase().split('d').map(Number)
    const newRolls = Array.from({ length: count }, () => 
      Math.floor(Math.random() * sides) + 1
    )
    const total = newRolls.reduce((sum, roll) => sum + roll, 0) + modifier
    setRolls(newRolls)
    setResult(total)
  }
  
  return (
    <div className="inline-flex items-center gap-4 p-4 bg-slate-800 rounded-lg border border-gray-600">
      <button
        onClick={rollDice}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        <Dice6 className="w-4 h-4" />
        {label} ({dice}{modifier !== 0 ? `${modifier > 0 ? '+' : ''}${modifier}` : ''})
      </button>
      {result !== null && (
        <div className="text-lg">
          <span className="text-gray-400">Rolls: {rolls.join(', ')}</span>
          {modifier !== 0 && <span className="text-gray-400"> + {modifier}</span>}
          <span className="ml-2 text-xl font-bold text-blue-400">= {result}</span>
        </div>
      )}
    </div>
  )
}
