"use client";

import { useState } from 'react';
import { Dice6 } from 'lucide-react';
import { SpeciesChoice, rollDice, getTableForStep } from '@/lib/character-data';

interface SpeciesSelectionProps {
  currentStep: string;
  onSelectionMade: (choice: SpeciesChoice, rolled?: boolean) => void;
}

export default function SpeciesSelection({ currentStep, onSelectionMade }: SpeciesSelectionProps) {
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<SpeciesChoice | null>(null);

  const table = getTableForStep(currentStep);

  const getStepTitle = () => {
    switch (currentStep) {
      case 'species': return 'Choose Your Species';
      case 'terian': return 'Choose Your Terian Biology';
      case 'fey': return 'Choose Your Fey Biology';
      case 'elven': return 'Choose Your Elven Culture';
      default: return 'Make Your Selection';
    }
  };

  const handleRoll = () => {
    const result = rollDice(10)[0];
    setRollResult(result);
    
    const choice = table.find(option => 
      result >= option.range[0] && result <= option.range[1]
    );
    
    if (choice) {
      setSelectedChoice(choice);
    }
  };

  const handleManualSelection = (choice: SpeciesChoice) => {
    setSelectedChoice(choice);
    setRollResult(null);
  };

  const handleConfirmSelection = () => {
    if (selectedChoice) {
      onSelectionMade(selectedChoice, rollResult !== null);
    }
  };

  if (table.length === 0) {
    return (
      <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
        <p className="text-slate-400">No options available for this step.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{getStepTitle()}</h2>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleRoll}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Dice6 className="w-5 h-5" />
            Roll 1d10
          </button>
        </div>
        
        {rollResult && (
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold text-blue-400">Rolled: {rollResult}</span>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {table.map((option, index) => {
          const isRolled = rollResult !== null && rollResult >= option.range[0] && rollResult <= option.range[1];
          const isSelected = selectedChoice === option;
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-950' 
                  : isRolled 
                  ? 'border-yellow-500 bg-yellow-950'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
              onClick={() => handleManualSelection(option)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-white">{option.result}</h3>
                <span className="text-sm text-slate-400 bg-slate-800 px-2 py-1 rounded">
                  {option.range[0] === option.range[1] ? option.range[0] : `${option.range[0]}-${option.range[1]}`}
                </span>
              </div>
              
              <p className="text-slate-300 mb-3">{option.description}</p>
              
              {option.stats && (
                <div className="text-sm text-slate-400 space-y-1">
                  <div>Lifespan: {option.stats.lifespan} years</div>
                  <div>Height: {option.stats.height}, Weight: {option.stats.weight}</div>
                  <div>Speed: {option.stats.speed} ft</div>
                </div>
              )}
              
              {option.abilities && option.abilities.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-blue-300 mb-1">Special Abilities:</div>
                  <div className="text-sm text-slate-400">
                    {option.abilities.join(', ')}
                  </div>
                </div>
              )}
              
              {isRolled && (
                <div className="mt-2 text-yellow-400 font-medium">
                  ✨ Rolled Result
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedChoice && (
        <div className="text-center">
          <button
            onClick={handleConfirmSelection}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Confirm Selection: {selectedChoice.result}
          </button>
        </div>
      )}
    </div>
  );
}