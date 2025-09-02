"use client";

import { Character } from '@/lib/character-data';
import { Printer, Save, Edit, Plus, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface CharacterSheetProps {
  character: Character;
  onEdit?: () => void;
  onSave?: () => void;
  onPrint?: () => void;
  onCreateNew?: () => void;
  onLevelUp?: () => void;
  isSaving?: boolean;
  saveSuccess?: boolean;
  showActions?: boolean;
}

export default function CharacterSheet({ 
  character, 
  onEdit,
  onSave,
  onPrint,
  onCreateNew,
  onLevelUp,
  isSaving = false,
  saveSuccess = false,
  showActions = true
}: CharacterSheetProps) {
  const damageModifier = calculateDamageModifier(character.characteristics.STR + character.characteristics.SIZ);

  function calculateDamageModifier(total: number): string {
    if (total <= 12) return '-2';
    if (total <= 16) return '-1';
    if (total <= 24) return 'None';
    if (total <= 32) return '+1d4';
    if (total <= 40) return '+1d6';
    if (total <= 56) return '+2d6';
    if (total <= 72) return '+3d6';
    if (total <= 88) return '+4d6';
    if (total <= 104) return '+5d6';
    return '+6d6';
  }

  return (
    <div className="character-sheet bg-slate-900 p-8 rounded-lg border border-slate-800 print:bg-white print:text-black print:border-black">
      {/* Header */}
      <div className="mb-8 print:border-b-2 print:border-black print:pb-4">
        <h1 className="text-3xl font-bold text-white mb-2 print:text-black print:text-center">
          {character.name || 'Unnamed Character'}
        </h1>
        <div className="flex flex-wrap gap-4 text-slate-400 print:text-black print:justify-center">
          <span>{character.species}</span>
          {character.biology && <span>• {character.biology}</span>}
          {character.culture && <span>• {character.culture}</span>}
          {character.profession && <span>• {character.profession}</span>}
          {character.archetype && <span>• {character.archetype}</span>}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Characteristics */}
        <div className="bg-slate-800 p-4 rounded-lg print:border print:border-black print:bg-white">
          <h3 className="text-lg font-semibold text-white mb-3 print:text-black">Characteristics</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(character.characteristics).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-slate-400 print:text-black">{key}:</span>
                <span className="text-white font-semibold print:text-black">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Derived Stats */}
        <div className="bg-slate-800 p-4 rounded-lg print:border print:border-black print:bg-white">
          <h3 className="text-lg font-semibold text-white mb-3 print:text-black">Derived Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-black">Hit Points:</span>
              <span className="text-white font-semibold print:text-black">{character.derivedStats.hitPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-black">Spirit Points:</span>
              <span className="text-white font-semibold print:text-black">{character.derivedStats.spiritPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-black">Damage Modifier:</span>
              <span className="text-white font-semibold print:text-black">{damageModifier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-black">Experience Bonus:</span>
              <span className="text-white font-semibold print:text-black">+{character.derivedStats.experienceBonus}%</span>
            </div>
          </div>
        </div>

        {/* Resource Pools */}
        <div className="bg-slate-800 p-4 rounded-lg print:border print:border-black print:bg-white">
          <h3 className="text-lg font-semibold text-white mb-3 print:text-black">Resource Pools</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 text-sm print:text-black">Effort</span>
              <div className="text-white font-semibold print:text-black">{character.derivedStats.effort}</div>
            </div>
            <div>
              <span className="text-slate-400 text-sm print:text-black">Stamina</span>
              <div className="text-white font-semibold print:text-black">{character.derivedStats.stamina}</div>
            </div>
            <div>
              <span className="text-slate-400 text-sm print:text-black">Intellect</span>
              <div className="text-white font-semibold print:text-black">{character.derivedStats.intellect}</div>
            </div>
            <div>
              <span className="text-slate-400 text-sm print:text-black">Spirit</span>
              <div className="text-white font-semibold print:text-black">{character.derivedStats.spirit}</div>
            </div>
            <div>
              <span className="text-slate-400 text-sm print:text-black">Agility</span>
              <div className="text-white font-semibold print:text-black">{character.derivedStats.agility}</div>
            </div>
            <div>
              <span className="text-slate-400 text-sm print:text-black">Charm</span>
              <div className="text-white font-semibold print:text-black">{character.derivedStats.charm}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {Object.keys(character.skills).length > 0 && (
        <div className="bg-slate-800 p-4 rounded-lg mb-8 print:border print:border-black print:bg-white">
          <h3 className="text-lg font-semibold text-white mb-3 print:text-black">Skills</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(character.skills)
              .filter(([_, value]) => value > 0)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([skill, value]) => (
                <div key={skill} className="flex justify-between">
                  <span className="text-slate-400 text-sm print:text-black">{skill}:</span>
                  <span className="text-green-400 font-semibold print:text-black">{value}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Special Abilities & Equipment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {character.specialAbilities.length > 0 && (
          <div className="bg-slate-800 p-4 rounded-lg print:border print:border-black print:bg-white">
            <h3 className="text-lg font-semibold text-white mb-3 print:text-black">Special Abilities</h3>
            <ul className="space-y-1">
              {character.specialAbilities.map((ability, index) => (
                <li key={index} className="text-blue-400 print:text-black">• {ability}</li>
              ))}
            </ul>
          </div>
        )}

        {character.startingEquipment.length > 0 && (
          <div className="bg-slate-800 p-4 rounded-lg print:border print:border-black print:bg-white">
            <h3 className="text-lg font-semibold text-white mb-3 print:text-black">Starting Equipment</h3>
            <ul className="space-y-1">
              {character.startingEquipment.map((item, index) => (
                <li key={index} className="text-green-400 print:text-black">• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Character Details */}
      {(character.height || character.weight || character.lifespan > 0 || character.startingFunds) && (
        <div className="bg-slate-800 p-4 rounded-lg mb-8 print:border print:border-black print:bg-white">
          <h3 className="text-lg font-semibold text-white mb-3 print:text-black">Character Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {character.height && (
              <div>
                <span className="text-slate-400 text-sm print:text-black">Height:</span>
                <div className="text-white print:text-black">{character.height}</div>
              </div>
            )}
            {character.weight && (
              <div>
                <span className="text-slate-400 text-sm print:text-black">Weight:</span>
                <div className="text-white print:text-black">{character.weight}</div>
              </div>
            )}
            {character.lifespan > 0 && (
              <div>
                <span className="text-slate-400 text-sm print:text-black">Avg. Lifespan:</span>
                <div className="text-white print:text-black">{character.lifespan} years</div>
              </div>
            )}
            {character.startingFunds && (
              <div>
                <span className="text-slate-400 text-sm print:text-black">Starting Funds:</span>
                <div className="text-white print:text-black">{character.startingFunds}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap gap-4 justify-center print:hidden">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit Character
            </button>
          )}
          
          {onLevelUp && (
            <button
              onClick={onLevelUp}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              Level Up
            </button>
          )}
          
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print Sheet
            </button>
          )}
          
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                saveSuccess
                  ? 'bg-green-700 text-white'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50`}
            >
              <Save className="w-5 h-5" />
              {saveSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Character'}
            </button>
          )}
          
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New
            </button>
          )}
        </div>
      )}
    </div>
  );
}