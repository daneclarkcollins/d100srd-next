"use client";

import { useState, useEffect } from 'react';
import { Dice6, Plus, Minus } from 'lucide-react';
import { SpeciesChoice, rollDice, getTableForStep } from '@/lib/character-data';

interface SpeciesSelectionProps {
  currentStep: string;
  onSelectionMade: (choice: SpeciesChoice, rolled?: boolean) => void;
  onStatsUpdated?: (stats: { height?: string; weight?: string; lifespan?: number }) => void;
  isAdvancedMode?: boolean;
}

export default function SpeciesSelection({ currentStep, onSelectionMade, onStatsUpdated, isAdvancedMode = false }: SpeciesSelectionProps) {
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<SpeciesChoice | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [adjustedHeight, setAdjustedHeight] = useState<string>('');
  const [adjustedWeight, setAdjustedWeight] = useState<string>('');

  const table = getTableForStep(currentStep);

  // Reset state when step changes
  useEffect(() => {
    setRollResult(null);
    setSelectedChoice(null);
    setCustomInput('');
    setAdjustedHeight('');
    setAdjustedWeight('');
  }, [currentStep]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 'species': return 'Choose Your Species';
      case 'terian': return 'Choose Your Terian Biology';
      case 'fey': return 'Choose Your Fey Biology';
      case 'elven': return 'Choose Your Elven Culture';
      case 'teranCulture': return 'Choose Your Teran Culture';
      case 'dworvenCulture': return 'Choose Your Dworven Culture';
      case 'dweranCulture': return 'Choose Your Dweran Culture';
      case 'elflingCulture': return 'Choose Your Elfling Culture';
      case 'feralElflingCulture': return 'Choose Your Feral Elfling Culture';
      case 'faunCulture': return 'Choose Your Faun Culture';
      case 'orogCulture': return 'Choose Your Orog Culture';
      case 'profession': return 'Choose Your Profession';
      case 'archetype': return 'Choose Your Archetype';
      default: return 'Make Your Selection';
    }
  };

  const handleRoll = () => {
    const diceSize = currentStep === 'profession' ? 100 : 10;
    const result = rollDice(diceSize)[0];
    setRollResult(result);
    
    const choice = table.find(option => 
      result >= option.range[0] && result <= option.range[1]
    );
    
    if (choice) {
      setSelectedChoice(choice);
      // Initialize adjusted values with the choice's base stats
      if (choice.stats) {
        setAdjustedHeight(choice.stats.height || '');
        setAdjustedWeight(choice.stats.weight || '');
        
        // Update character summary immediately for biology steps
        if (['terian', 'fey'].includes(currentStep) && onStatsUpdated) {
          onStatsUpdated({
            height: choice.stats.height,
            weight: choice.stats.weight,
            lifespan: choice.stats.lifespan
          });
        }
      }
    }
  };

  const handleManualSelection = (choice: SpeciesChoice) => {
    setSelectedChoice(choice);
    setRollResult(null);
    // Initialize adjusted values with the choice's base stats
    if (choice.stats) {
      setAdjustedHeight(choice.stats.height || '');
      setAdjustedWeight(choice.stats.weight || '');
      
      // Update character summary immediately for biology steps
      if (['terian', 'fey'].includes(currentStep) && onStatsUpdated) {
        onStatsUpdated({
          height: choice.stats.height,
          weight: choice.stats.weight,
          lifespan: choice.stats.lifespan
        });
      }
    }
  };

  const handleConfirmSelection = () => {
    if (selectedChoice) {
      // Create a modified choice with adjusted stats if we're on a biology step
      const isBiologyStep = ['terian', 'fey'].includes(currentStep);
      const modifiedChoice = isBiologyStep && (adjustedHeight !== selectedChoice.stats?.height || adjustedWeight !== selectedChoice.stats?.weight)
        ? {
            ...selectedChoice,
            stats: {
              ...selectedChoice.stats,
              height: adjustedHeight,
              weight: adjustedWeight
            }
          }
        : selectedChoice;
      
      onSelectionMade(modifiedChoice, rollResult !== null);
    }
  };

  // Helper functions for height/weight adjustments
  const parseHeight = (heightStr: string): { feet: number; inches: number } => {
    const match = heightStr.match(/(\d+)'\s*(\d+)"/);
    if (match) {
      return { feet: parseInt(match[1]), inches: parseInt(match[2]) };
    }
    const feetMatch = heightStr.match(/(\d+)'/);
    if (feetMatch) {
      return { feet: parseInt(feetMatch[1]), inches: 0 };
    }
    return { feet: 0, inches: 0 };
  };

  const formatHeight = (feet: number, inches: number): string => {
    return `${feet}' ${inches}"`;
  };

  const adjustHeight = (heightStr: string, change: number): string => {
    const { feet, inches } = parseHeight(heightStr);
    let totalInches = feet * 12 + inches + change;
    if (totalInches < 12) totalInches = 12; // Minimum 1 foot
    const newFeet = Math.floor(totalInches / 12);
    const newInches = totalInches % 12;
    return formatHeight(newFeet, newInches);
  };

  const parseWeight = (weightStr: string): number => {
    const match = weightStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const adjustWeight = (weightStr: string, change: number): string => {
    const currentWeight = parseWeight(weightStr);
    const newWeight = Math.max(1, currentWeight + change); // Minimum 1 lb
    return `${newWeight} lb`;
  };

  const handleCustomConfirm = () => {
    if (customInput.trim()) {
      const customChoice: SpeciesChoice = {
        range: [1, 1],
        result: customInput.trim(),
        description: `Custom ${getStepTitle().toLowerCase().replace('choose your ', '')}`,
        stats: {}
      };
      onSelectionMade(customChoice, false);
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
        <h2 className="text-3xl font-bold text-white mb-4">
          {getStepTitle()}{isAdvancedMode ? ' (Advanced Mode)' : ''}
        </h2>
        {!isAdvancedMode && table.length > 1 && (
          <>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRoll}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Dice6 className="w-5 h-5" />
                Roll 1d{currentStep === 'profession' ? '100' : '10'}
              </button>
            </div>
            
            {rollResult && (
              <div className="mt-4 text-center">
                <span className="text-2xl font-bold text-blue-400">Rolled: {rollResult}</span>
              </div>
            )}
          </>
        )}
        {isAdvancedMode && (
          <p className="text-slate-400 mb-4">Select any option - no rolling required</p>
        )}
        {!isAdvancedMode && table.length === 1 && (
          <p className="text-slate-400 mb-4">Only one option available - select to continue</p>
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
                  <div>Avg. Lifespan: {option.stats.lifespan} years</div>
                  <div>Avg. Height: {option.stats.height}, Avg. Weight: {option.stats.weight}</div>
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
        <div className="space-y-4">
          {/* Height/Weight adjustment controls - only for biology steps */}
          {['terian', 'fey'].includes(currentStep) && selectedChoice.stats && selectedChoice.stats.height && selectedChoice.stats.weight && (
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h4 className="text-white font-semibold mb-3">Customize Physical Stats</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Height adjustment */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Height</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newHeight = adjustHeight(adjustedHeight, -1);
                        setAdjustedHeight(newHeight);
                        if (onStatsUpdated) {
                          onStatsUpdated({ height: newHeight, weight: adjustedWeight });
                        }
                      }}
                      className="w-8 h-8 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={adjustedHeight}
                      onChange={(e) => {
                        setAdjustedHeight(e.target.value);
                        if (onStatsUpdated) {
                          onStatsUpdated({ height: e.target.value, weight: adjustedWeight });
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
                      placeholder="5' 8&quot;"
                    />
                    <button
                      onClick={() => {
                        const newHeight = adjustHeight(adjustedHeight, 1);
                        setAdjustedHeight(newHeight);
                        if (onStatsUpdated) {
                          onStatsUpdated({ height: newHeight, weight: adjustedWeight });
                        }
                      }}
                      className="w-8 h-8 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weight adjustment */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Weight</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newWeight = adjustWeight(adjustedWeight, -1);
                        setAdjustedWeight(newWeight);
                        if (onStatsUpdated) {
                          onStatsUpdated({ height: adjustedHeight, weight: newWeight });
                        }
                      }}
                      className="w-8 h-8 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={adjustedWeight}
                      onChange={(e) => {
                        setAdjustedWeight(e.target.value);
                        if (onStatsUpdated) {
                          onStatsUpdated({ height: adjustedHeight, weight: e.target.value });
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
                      placeholder="180 lb"
                    />
                    <button
                      onClick={() => {
                        const newWeight = adjustWeight(adjustedWeight, 1);
                        setAdjustedWeight(newWeight);
                        if (onStatsUpdated) {
                          onStatsUpdated({ height: adjustedHeight, weight: newWeight });
                        }
                      }}
                      className="w-8 h-8 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleConfirmSelection}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Confirm Selection: {selectedChoice.result}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}