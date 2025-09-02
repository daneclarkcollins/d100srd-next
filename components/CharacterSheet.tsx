"use client";

import { Character } from '@/lib/character-data';
import { Printer, Save, Edit, Plus, TrendingUp } from 'lucide-react';

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

  // Skill categories as shown in the traditional sheet
  const skillCategories = {
    Communication: ['Bargain', 'Command', 'Disguise', 'Etiquette', 'Fast Talk', 'Perform', 'Persuade', 'Teach'],
    Dexterous: ['Acrobatics', 'Art', 'Craft', 'Fine Manipulation', 'Hide', 'Repair', 'Sleight of Hand', 'Stealth'],
    Mental: ['Appraise', 'First Aid', 'Gaming', 'Knowledge', 'Medicine', 'Strategy', 'Spellcraft', 'Survival'],
    Perception: ['Insight', 'Listen', 'Navigate', 'Research', 'Sense', 'Spot', 'Track'],
    Physical: ['Athletics', 'Climb', 'Jump', 'Pilot (Land)', 'Pilot (Sea)', 'Pilot (Air)', 'Ride', 'Swim', 'Throw'],
    Combat: ['Brawl', 'Bludgeon Weapons', 'Dodge', 'Grapple', 'Martial Arts', 'Piercing Weapons', 'Ranged Weapons', 'Shield', 'Siege Weapons', 'Slashing Weapons']
  };

  return (
    <div className="character-sheet bg-white print:bg-white text-black print:text-black p-8 print:p-4 max-w-none print:max-w-none">
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; }
          .character-sheet { 
            font-size: 10px !important;
            line-height: 1.2 !important;
            max-width: none !important;
            width: 100% !important;
          }
          .field-box {
            border: 1px solid black !important;
            min-height: 18px !important;
            padding: 2px 4px !important;
          }
          .section-header {
            border: 2px solid black !important;
            background: #f0f0f0 !important;
            font-weight: bold !important;
            text-align: center !important;
            padding: 2px !important;
          }
          .no-print { display: none !important; }
        }
        .field-box {
          border: 1px solid #374151;
          min-height: 24px;
          padding: 4px 8px;
          background: #f9fafb;
          display: flex;
          align-items: center;
        }
        .section-header {
          border: 2px solid #374151;
          background: #e5e7eb;
          font-weight: bold;
          text-align: center;
          padding: 4px;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 print:mb-3">
        <div className="flex-1">
          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">NAME</label>
            <div className="field-box text-lg font-semibold">
              {characterData.name || ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 print:hidden">
          <img src="/sagaborn-logo.png" alt="SagaBorn" className="h-12" onError={(e) => e.target.style.display = 'none'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-3">
        {/* Left Column - Characteristics */}
        <div className="space-y-4">
          <div className="section-header">CHARACTERISTICS</div>
          
          {Object.entries({
            'STR': 'EFFORT',
            'CON': 'STAMINA', 
            'SIZ': '',
            'INT': 'INTELLECT',
            'ACU': 'SPIRIT',
            'DEX': 'AGILITY',
            'SOC': 'CHARM'
          }).map(([stat, pool]) => (
            <div key={stat} className="grid grid-cols-5 gap-2 items-center text-sm">
              <div className="font-bold">{stat}</div>
              <div className="field-box text-center">{characteristics[stat] || ''}</div>
              <div className="text-center">×5 =</div>
              <div className="text-right font-bold">{pool}</div>
              <div className="field-box text-center">
                {pool && derivedStats[pool.toLowerCase()] ? `${derivedStats[pool.toLowerCase()]}%` : ''}
              </div>
            </div>
          ))}

          {/* Additional Stats */}
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="border border-gray-400 p-2 bg-gray-100">
                  <div className="text-xs">SPIRIT POINTS</div>
                  <div className="text-xs">MAX</div>
                </div>
                <div className="field-box mt-1">{derivedStats.spiritPoints || ''}</div>
              </div>
              <div>
                <div className="border border-gray-400 p-2 bg-gray-100">
                  <div className="text-xs">MAX HIT POINTS</div>
                </div>
                <div className="field-box mt-1">{derivedStats.hitPoints || ''}</div>
              </div>
              <div>
                <div className="border border-gray-400 p-2 bg-gray-100">
                  <div className="text-xs">SPEED</div>
                </div>
                <div className="field-box mt-1">{derivedStats.speed || ''}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="border border-gray-400 p-2 bg-gray-100">
                  <div className="text-xs">SPIRIT POINTS</div>
                  <div className="text-xs">SPENT</div>
                </div>
                <div className="field-box mt-1"></div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <div className="border border-gray-400 p-1 bg-gray-100">
                    <div className="text-xs">LETHAL</div>
                  </div>
                  <div className="field-box mt-1 text-center">+</div>
                </div>
                <div>
                  <div className="border border-gray-400 p-1 bg-gray-100">
                    <div className="text-xs">SUBDUAL</div>
                  </div>
                  <div className="field-box mt-1"></div>
                </div>
              </div>
              <div>
                <div className="border border-gray-400 p-2 bg-gray-100">
                  <div className="text-xs">SAGA</div>
                  <div className="text-xs">POINTS</div>
                </div>
                <div className="field-box mt-1"></div>
              </div>
            </div>
          </div>

          {/* Weapons Section */}
          <div className="mt-6">
            <div className="section-header">WEAPONS</div>
            <div className="text-xs grid grid-cols-7 gap-1 mt-2 mb-1 font-bold">
              <div>WEAPON</div>
              <div>TYPE</div>
              <div>DAMAGE</div>
              <div>CRIT/SPCL</div>
              <div>ATTACK</div>
              <div>RANGE</div>
              <div>WPN HP</div>
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-1 mb-1">
                <div className="field-box text-xs"></div>
                <div className="field-box text-xs text-center">%</div>
                <div className="field-box text-xs"></div>
                <div className="field-box text-xs"></div>
                <div className="field-box text-xs"></div>
                <div className="field-box text-xs"></div>
                <div className="field-box text-xs"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Armor and Other Stats */}
        <div className="space-y-4">
          {/* Armor Section */}
          <div className="border-2 border-gray-400 p-3">
            <div className="section-header mb-3">ARMOR</div>
            <div className="field-box mb-3"></div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <div className="field-box h-12"></div>
                <div className="text-xs mt-1">ARMOR VALUE</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">FULL</div>
                <div className="font-bold text-lg">AV</div>
                <div className="border-4 border-gray-400 h-16 flex items-center justify-center">
                  {/* Shield shape */}
                  <div className="w-8 h-10 border border-gray-400"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="field-box h-12"></div>
                <div className="text-xs mt-1">ARMOR DAMAGE</div>
              </div>
            </div>

            <div className="section-header mb-2">SHIELD</div>
            <div className="field-box mb-3"></div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="field-box h-8"></div>
                <div className="text-xs mt-1">ARMOR VALUE</div>
              </div>
              <div className="text-center">
                <div className="text-xs">HIT POINTS</div>
                <div className="border border-gray-400 h-8 flex items-center justify-center">
                  {/* Shield shape */}
                </div>
              </div>
              <div className="text-center">
                <div className="field-box h-8"></div>
                <div className="text-xs mt-1">SHIELD DAMAGE</div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="border border-gray-400 p-2 bg-gray-100 text-xs">
                CURRENT HORROR RESISTANCE
              </div>
              <div className="field-box mt-1"></div>
            </div>
            <div className="text-center">
              <div className="border border-gray-400 p-2 bg-gray-100 text-xs">MANA MAX</div>
              <div className="field-box mt-1"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="field-box">HR MAX</div>
              <div className="text-center mt-1">-</div>
            </div>
            <div className="text-center">
              <div className="field-box">HORROR</div>
            </div>
          </div>

          <div className="text-center">
            <div className="field-box">MANA SPENT</div>
          </div>

          {/* Talents Section */}
          <div className="border-2 border-gray-400 p-3">
            <div className="section-header mb-3">TALENTS:</div>
            {[...Array(15)].map((_, i) => (
              <div key={i} className="border-b border-gray-300 h-4 mb-1"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Section - 2 Column Layout */}
      <div className="mt-8 print:mt-4">
        <div className="section-header mb-4">SKILLS</div>
        <div className="text-right text-xs font-bold mb-4">
          Experience Bonus _____%
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-3">
          {/* Left Skills Column */}
          <div className="space-y-4">
            {Object.entries(skillCategories).slice(0, 3).map(([category, skillList]) => (
              <div key={category} className="mb-4">
                <div className="bg-gray-200 font-bold text-xs p-1 border border-gray-400 text-center">
                  {category.toUpperCase()} _____%
                </div>
                {skillList.map((skill) => (
                  <div key={skill} className="grid grid-cols-4 gap-1 items-center text-xs mt-1">
                    <div className="col-span-2">{skill}</div>
                    <div className="field-box text-center">
                      {skills[skill] ? `${skills[skill]}%` : '____%'}
                    </div>
                    <div className="w-4 h-4 border border-gray-400"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Right Skills Column */}
          <div className="space-y-4">
            {Object.entries(skillCategories).slice(3).map(([category, skillList]) => (
              <div key={category} className="mb-4">
                <div className="bg-gray-200 font-bold text-xs p-1 border border-gray-400 text-center">
                  {category.toUpperCase()} _____%
                </div>
                {skillList.map((skill) => (
                  <div key={skill} className="grid grid-cols-4 gap-1 items-center text-xs mt-1">
                    <div className="col-span-2">{skill}</div>
                    <div className="field-box text-center">
                      {skills[skill] ? `${skills[skill]}%` : '____%'}
                    </div>
                    <div className="w-4 h-4 border border-gray-400"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-8 bg-slate-800 p-6 rounded-lg border border-slate-600 no-print">
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