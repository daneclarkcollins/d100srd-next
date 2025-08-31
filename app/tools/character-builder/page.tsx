"use client";

import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Character, SpeciesChoice, createNewCharacter } from '@/lib/character-data';
import SpeciesSelection from '@/components/CharacterBuilder/SpeciesSelection';

export default function CharacterBuilderPage() {
  const [character, setCharacter] = useState<Character>(createNewCharacter());

  useEffect(() => {
    const saved = localStorage.getItem('sagaborn-character');
    if (saved) {
      try {
        setCharacter(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved character:', e);
      }
    }
  }, []);

  const saveCharacter = () => {
    localStorage.setItem('sagaborn-character', JSON.stringify(character));
    alert('Character saved!');
  };

  const resetCharacter = () => {
    if (confirm('Are you sure you want to reset your character? This cannot be undone.')) {
      setCharacter(createNewCharacter());
      localStorage.removeItem('sagaborn-character');
    }
  };

  const handleSpeciesSelection = (choice: SpeciesChoice, wasRolled?: boolean) => {
    const updatedCharacter = { ...character };
    
    if (character.currentStep === 'species') {
      updatedCharacter.species = choice.result;
      
      if (choice.stats) {
        updatedCharacter.lifespan = choice.stats.lifespan;
        updatedCharacter.height = choice.stats.height;
        updatedCharacter.weight = choice.stats.weight;
        updatedCharacter.speed = choice.stats.speed;
      }
      
      if (choice.abilities) {
        updatedCharacter.specialAbilities = [...choice.abilities];
      }
      
      if (choice.nextTable) {
        updatedCharacter.currentStep = choice.nextTable;
      } else {
        updatedCharacter.currentStep = 'characteristics';
      }
    } else if (character.currentStep === 'terian' || character.currentStep === 'fey') {
      updatedCharacter.biology = choice.result;
      
      if (choice.stats) {
        updatedCharacter.lifespan = choice.stats.lifespan;
        updatedCharacter.height = choice.stats.height;
        updatedCharacter.weight = choice.stats.weight;
        updatedCharacter.speed = choice.stats.speed;
      }
      
      if (choice.abilities) {
        updatedCharacter.specialAbilities = [...updatedCharacter.specialAbilities, ...choice.abilities];
      }
      
      if (choice.nextTable) {
        updatedCharacter.currentStep = choice.nextTable;
      } else {
        updatedCharacter.currentStep = 'characteristics';
      }
    } else if (character.currentStep === 'elven') {
      updatedCharacter.culture = choice.result;
      updatedCharacter.currentStep = 'heritage';
    }
    
    setCharacter(updatedCharacter);
  };

  const getProgressSteps = () => {
    const steps = ['Species'];
    
    if (character.species === 'Terian') {
      steps.push('Biology', 'Culture');
    } else if (character.species === 'Fey') {
      steps.push('Biology', 'Culture');
    } else if (character.species === 'Elven') {
      steps.push('Culture');
    }
    
    steps.push('Heritage', 'Characteristics', 'Final');
    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getProgressSteps();
    switch (character.currentStep) {
      case 'species': return 0;
      case 'terian':
      case 'fey': return 1;
      case 'teranCulture':
      case 'dworvenCulture':
      case 'dweranCulture':
      case 'elflingCulture':
      case 'feralElflingCulture':
      case 'faunCulture':
      case 'orogCulture':
      case 'elven': return character.species === 'Elven' ? 1 : 2;
      case 'heritage': return steps.indexOf('Heritage');
      case 'characteristics': return steps.indexOf('Characteristics');
      default: return steps.length - 1;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">SagaBorn Character Builder</h1>
          <p className="text-xl text-slate-400">
            Create your hero step by step through the world of SagaBorn
          </p>
        </header>

        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={saveCharacter}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Character
          </button>
          <button
            onClick={resetCharacter}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm text-slate-400">
              Step {getCurrentStepIndex() + 1} of {getProgressSteps().length}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((getCurrentStepIndex() + 1) / getProgressSteps().length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {(character.currentStep === 'species' || 
              character.currentStep === 'terian' || 
              character.currentStep === 'fey' || 
              character.currentStep === 'elven') && (
              <SpeciesSelection
                currentStep={character.currentStep}
                onSelectionMade={handleSpeciesSelection}
              />
            )}
            
            {character.currentStep === 'characteristics' && (
              <div className="bg-slate-900 p-8 rounded-lg border border-slate-800 text-center">
                <h2 className="text-2xl font-semibold text-white mb-4">Characteristics</h2>
                <p className="text-slate-400">
                  Characteristic allocation system coming soon. You'll be able to roll or 
                  use point-buy system to set your character's core attributes.
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 h-fit">
            <h3 className="text-xl font-semibold text-white mb-4">Character Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400">Name:</span>
                <span className="ml-2 text-white">{character.name || 'Unnamed'}</span>
              </div>
              
              {character.species && (
                <div>
                  <span className="text-slate-400">Species:</span>
                  <span className="ml-2 text-white">{character.species}</span>
                </div>
              )}
              
              {character.biology && (
                <div>
                  <span className="text-slate-400">Biology:</span>
                  <span className="ml-2 text-white">{character.biology}</span>
                </div>
              )}
              
              {character.culture && (
                <div>
                  <span className="text-slate-400">Culture:</span>
                  <span className="ml-2 text-white">{character.culture}</span>
                </div>
              )}
              
              {character.height && character.weight && (
                <>
                  <div>
                    <span className="text-slate-400">Height:</span>
                    <span className="ml-2 text-white">{character.height}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Weight:</span>
                    <span className="ml-2 text-white">{character.weight}</span>
                  </div>
                </>
              )}
              
              {character.specialAbilities.length > 0 && (
                <div>
                  <span className="text-slate-400">Special Abilities:</span>
                  <div className="ml-2 text-white">
                    {character.specialAbilities.map((ability, index) => (
                      <div key={index} className="text-xs text-blue-300">• {ability}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}