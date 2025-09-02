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
  // Handle case where character data might be from database with different property names
  const characterData = character as any;
  const derivedStats = characterData.derivedStats || characterData.derived_stats || {};
  const characteristics = characterData.characteristics || {};
  const skills = characterData.skills || {};
  const specialAbilities = characterData.specialAbilities || characterData.special_abilities || [];
  const startingEquipment = characterData.startingEquipment || characterData.starting_equipment || [];
  
  const damageModifier = calculateDamageModifier((characteristics.STR || 0) + (characteristics.SIZ || 0));

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
    <div className="character-sheet bg-slate-900 p-8 rounded-lg border border-slate-800 print:bg-white print:text-black print:p-0 print:border-none print:rounded-none">

      {/* Character Sheet Header */}
      <div className="text-center mb-8 print:mb-4">
        <h1 className="text-4xl font-bold text-white print:text-black print:text-2xl print:mb-2">
          SagaBorn D100 Character Sheet
        </h1>
      </div>

      {/* Basic Information */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 mb-6 print:bg-white print:border-2 print:border-black print:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-300 print:text-black mb-1">Character Name:</label>
              <div className="text-xl font-bold text-white print:text-black print-field border-b border-slate-600 pb-1">
                {characterData.name || 'Unnamed Character'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 print:text-black mb-1">Species:</label>
                <div className="text-white print:text-black print-field border-b border-slate-600 pb-1">
                  {characterData.species || '—'}
                </div>
              </div>
              {characterData.biology && (
                <div>
                  <label className="block text-sm font-bold text-slate-300 print:text-black mb-1">Biology:</label>
                  <div className="text-white print:text-black print-field border-b border-slate-600 pb-1">
                    {characterData.biology}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              {characterData.culture && (
                <div>
                  <label className="block text-sm font-bold text-slate-300 print:text-black mb-1">Culture:</label>
                  <div className="text-white print:text-black print-field border-b border-slate-600 pb-1">
                    {characterData.culture}
                  </div>
                </div>
              )}
              {characterData.profession && (
                <div>
                  <label className="block text-sm font-bold text-slate-300 print:text-black mb-1">Profession:</label>
                  <div className="text-white print:text-black print-field border-b border-slate-600 pb-1">
                    {characterData.profession}
                  </div>
                </div>
              )}
            </div>
            
            {characterData.archetype && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-300 print:text-black mb-1">Archetype:</label>
                <div className="text-white print:text-black print-field border-b border-slate-600 pb-1">
                  {characterData.archetype}
                </div>
              </div>
            )}
          </div>
          
          <div>
            {(characterData.height || characterData.weight || characterData.lifespan) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {characterData.height && (
                    <div>
                      <label className="block text-sm font-bold text-slate-300 print:text-black mb-1">Height:</label>
                      <div className="text-white print:text-black print-field border-b border-slate-600 pb-1">
                        {characterData.height}
                      </div>
                    </div>
                  )}
                  {characterData.weight && (
                    <div>
                      <label className="block text-sm font-bold text-slate-300 print:text-black mb-1">Weight:</label>
                      <div className="text-white print:text-black print-field border-b border-slate-600 pb-1">
                        {characterData.weight}
                      </div>
                    </div>
                  )}
                </div>
                {characterData.lifespan && (
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-slate-300 print:text-black mb-1">Avg. Lifespan:</label>
                    <div className="text-white print:text-black print-field border-b border-slate-600 pb-1">
                      {characterData.lifespan} years
                    </div>
                  </div>
                )}
              </>
            )}
            
            {(characterData.startingFunds || characterData.starting_funds) && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-300 print:text-black mb-1">Starting Funds:</label>
                <div className="text-white print:text-black print-field border-b border-slate-600 pb-1">
                  {characterData.startingFunds || characterData.starting_funds}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Characteristics and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Characteristics */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 print:bg-white print:border-2 print:border-black print:p-4">
          <h3 className="text-xl font-bold text-white mb-4 print:text-black print:border-b print:border-black print:pb-2">Characteristics</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(characteristics).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-slate-300 print:text-black font-medium">{key}:</label>
                <div className="w-12 h-8 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center">
                  <span className="text-white print:text-black font-bold">{(value as number) || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Combat Stats */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 print:bg-white print:border-2 print:border-black print:p-4">
          <h3 className="text-xl font-bold text-white mb-4 print:text-black print:border-b print:border-black print:pb-2">Combat & Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 print:text-black font-medium">Hit Points:</label>
              <div className="w-16 h-8 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center">
                <span className="text-white print:text-black font-bold">{derivedStats.hitPoints || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-slate-300 print:text-black font-medium">Spirit Points:</label>
              <div className="w-16 h-8 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center">
                <span className="text-white print:text-black font-bold">{derivedStats.spiritPoints || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-slate-300 print:text-black font-medium">Damage Modifier:</label>
              <div className="w-16 h-8 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center">
                <span className="text-white print:text-black font-bold text-sm">{damageModifier}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-slate-300 print:text-black font-medium">Experience Bonus:</label>
              <div className="w-16 h-8 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center">
                <span className="text-white print:text-black font-bold text-sm">+{derivedStats.experienceBonus || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Pools */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 mb-6 print:bg-white print:border-2 print:border-black print:p-4">
        <h3 className="text-xl font-bold text-white mb-4 print:text-black print:border-b print:border-black print:pb-2">Resource Pools</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <label className="block text-slate-300 print:text-black font-medium mb-2">Effort</label>
            <div className="w-16 h-10 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center mx-auto">
              <span className="text-white print:text-black font-bold">{derivedStats.effort || 0}</span>
            </div>
          </div>
          <div className="text-center">
            <label className="block text-slate-300 print:text-black font-medium mb-2">Stamina</label>
            <div className="w-16 h-10 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center mx-auto">
              <span className="text-white print:text-black font-bold">{derivedStats.stamina || 0}</span>
            </div>
          </div>
          <div className="text-center">
            <label className="block text-slate-300 print:text-black font-medium mb-2">Intellect</label>
            <div className="w-16 h-10 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center mx-auto">
              <span className="text-white print:text-black font-bold">{derivedStats.intellect || 0}</span>
            </div>
          </div>
          <div className="text-center">
            <label className="block text-slate-300 print:text-black font-medium mb-2">Spirit</label>
            <div className="w-16 h-10 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center mx-auto">
              <span className="text-white print:text-black font-bold">{derivedStats.spirit || 0}</span>
            </div>
          </div>
          <div className="text-center">
            <label className="block text-slate-300 print:text-black font-medium mb-2">Agility</label>
            <div className="w-16 h-10 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center mx-auto">
              <span className="text-white print:text-black font-bold">{derivedStats.agility || 0}</span>
            </div>
          </div>
          <div className="text-center">
            <label className="block text-slate-300 print:text-black font-medium mb-2">Charm</label>
            <div className="w-16 h-10 bg-slate-700 print:bg-white print:border print:border-black rounded flex items-center justify-center mx-auto">
              <span className="text-white print:text-black font-bold">{derivedStats.charm || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {Object.keys(skills).length > 0 && (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 mb-6 print:bg-white print:border-2 print:border-black print:p-4">
          <h3 className="text-xl font-bold text-white mb-4 print:text-black print:border-b print:border-black print:pb-2">Skills</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(skills)
              .filter(([_, value]) => (value as number) > 0)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([skill, value]) => (
                <div key={skill} className="flex items-center justify-between bg-slate-700 print:bg-white print:border print:border-gray-400 rounded p-2">
                  <span className="text-slate-200 print:text-black text-sm font-medium">{skill}:</span>
                  <span className="text-green-400 print:text-black font-bold">{value as number}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Special Abilities & Equipment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {specialAbilities.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 print:bg-white print:border-2 print:border-black print:p-4">
            <h3 className="text-xl font-bold text-white mb-4 print:text-black print:border-b print:border-black print:pb-2">Special Abilities</h3>
            <div className="space-y-2">
              {specialAbilities.map((ability: string, index: number) => (
                <div key={index} className="bg-slate-700 print:bg-white print:border print:border-gray-400 rounded p-3">
                  <span className="text-blue-300 print:text-black font-medium">{ability}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {startingEquipment.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 print:bg-white print:border-2 print:border-black print:p-4">
            <h3 className="text-xl font-bold text-white mb-4 print:text-black print:border-b print:border-black print:pb-2">Starting Equipment</h3>
            <div className="space-y-2">
              {startingEquipment.map((item: string, index: number) => (
                <div key={index} className="bg-slate-700 print:bg-white print:border print:border-gray-400 rounded p-3">
                  <span className="text-green-300 print:text-black font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 print:hidden">
          <div className="flex flex-wrap gap-4 justify-center">
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
        </div>
      )}
    </div>
  );
}