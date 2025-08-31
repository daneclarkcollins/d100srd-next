"use client";

import { useState, useEffect } from 'react';
import { Character, skillCategories, skillBaseChances, professionSkills } from '@/lib/character-data';

interface SkillSelectionProps {
  character: Character;
  onComplete: (skills: Record<string, number>) => void;
  onBack: () => void;
  isAdvancedMode?: boolean;
}

interface SkillAllocation {
  professional: Record<string, number>;
  personal: Record<string, number>;
}

export default function SkillSelection({ character, onComplete, onBack, isAdvancedMode = false }: SkillSelectionProps) {
  const [mode, setMode] = useState<'professional' | 'personal'>('professional');
  const [allocation, setAllocation] = useState<SkillAllocation>({
    professional: {},
    personal: {}
  });

  // Calculate available points
  const professionalPoints = 250;
  const personalPoints = (character.characteristics?.INT || 10) * 10;

  // Calculate spent points
  const professionalSpent = Object.values(allocation.professional).reduce((sum, val) => sum + val, 0);
  const personalSpent = Object.values(allocation.personal).reduce((sum, val) => sum + val, 0);

  // Get profession skills
  const characterProfessionSkills = character.profession ? (professionSkills[character.profession] || []) : [];

  function getCategoryBonus(category: string): number {
    const categoryData = (skillCategories as any)[category];
    if (!categoryData) return 0;
    
    const char = character.characteristics?.[categoryData.characteristic as keyof typeof character.characteristics] || 10;
    
    if (char >= 16) return 10;
    if (char >= 13) return 5;
    return 0;
  }

  function getSkillCategory(skill: string): string {
    for (const [category, data] of Object.entries(skillCategories)) {
      if (data.skills.includes(skill)) return category;
    }
    return 'general';
  }

  function calculateTotal(skill: string): number {
    const base = skillBaseChances[skill] || 0;
    const categoryBonus = getCategoryBonus(getSkillCategory(skill));
    const professionalAlloc = allocation.professional[skill] || 0;
    const personalAlloc = allocation.personal[skill] || 0;
    
    if (isAdvancedMode) {
      // In advanced mode, check for 90%/95% caps
      const hasSkillAbove90 = Object.keys({ ...skillBaseChances }).some(otherSkill => {
        if (otherSkill === skill) return false;
        const otherBase = skillBaseChances[otherSkill] || 0;
        const otherCategoryBonus = getCategoryBonus(getSkillCategory(otherSkill));
        const otherProfessionalAlloc = allocation.professional[otherSkill] || 0;
        const otherPersonalAlloc = allocation.personal[otherSkill] || 0;
        const otherTotal = otherBase + otherCategoryBonus + otherProfessionalAlloc + otherPersonalAlloc;
        return otherTotal >= 91;
      });
      const cap = hasSkillAbove90 ? 90 : 95;
      return Math.min(cap, base + categoryBonus + professionalAlloc + personalAlloc);
    } else {
      return Math.min(75, base + categoryBonus + professionalAlloc + personalAlloc);
    }
  }

  function getEffectiveAllocation(skill: string, mode: 'professional' | 'personal'): number {
    const base = skillBaseChances[skill] || 0;
    const categoryBonus = getCategoryBonus(getSkillCategory(skill));
    const professionalAlloc = allocation.professional[skill] || 0;
    const personalAlloc = allocation.personal[skill] || 0;
    const currentTotal = base + categoryBonus + professionalAlloc + personalAlloc;
    
    // Determine the cap
    let cap = 75; // Default for normal mode
    if (isAdvancedMode) {
      const hasSkillAbove90 = Object.keys({ ...skillBaseChances }).some(otherSkill => {
        if (otherSkill === skill) return false;
        const otherTotal = calculateTotal(otherSkill);
        return otherTotal >= 91;
      });
      cap = hasSkillAbove90 ? 90 : 95;
    }
    
    const cappedTotal = Math.min(cap, currentTotal);
    const effectiveTotalAllocation = cappedTotal - base - categoryBonus;
    const totalRawAllocation = professionalAlloc + personalAlloc;
    
    if (totalRawAllocation === 0) return 0;
    
    // Proportionally reduce the allocation for this mode
    const modeAlloc = mode === 'professional' ? professionalAlloc : personalAlloc;
    return Math.floor((modeAlloc / totalRawAllocation) * Math.max(0, effectiveTotalAllocation));
  }

  function adjustSkillPoints(skill: string, delta: number) {
    const currentMode = mode;
    const currentAllocation = { ...allocation };
    const currentValue = currentAllocation[currentMode][skill] || 0;
    
    // Check if professional skill is allowed
    if (currentMode === 'professional' && !characterProfessionSkills.includes(skill)) return;
    
    // Calculate constraints
    const currentSpent = currentMode === 'professional' ? professionalSpent : personalSpent;
    const maxPoints = currentMode === 'professional' ? professionalPoints : personalPoints;
    const remainingPoints = maxPoints - currentSpent;
    
    // For negative deltas, use as much as possible (but not more than available)
    if (delta < 0) {
      const actualDelta = Math.max(delta, -currentValue); // Can't reduce below 0
      const newValue = currentValue + actualDelta;
      currentAllocation[currentMode][skill] = newValue;
      if (newValue === 0) delete currentAllocation[currentMode][skill];
      setAllocation(currentAllocation);
      return;
    }
    
    // For positive deltas, use the minimum of requested delta or remaining points
    const actualDelta = Math.min(delta, remainingPoints);
    if (actualDelta <= 0) return; // No points available to spend
    
    const newValue = currentValue + actualDelta;
    
    // Check 75% limit
    const otherModeAlloc = currentMode === 'professional' 
      ? (allocation.personal[skill] || 0)
      : (allocation.professional[skill] || 0);
    const base = skillBaseChances[skill] || 0;
    const categoryBonus = getCategoryBonus(getSkillCategory(skill));
    const newTotal = base + categoryBonus + newValue + otherModeAlloc;
    
    // Check if the new total would exceed 75% or wouldn't actually increase the skill
    const currentTotal = calculateTotal(skill);
    if (newTotal > 75) {
      const maxAllowedValue = 75 - base - categoryBonus - otherModeAlloc;
      const adjustedValue = Math.max(currentValue, Math.min(newValue, maxAllowedValue));
      if (adjustedValue <= currentValue) return; // Can't improve this skill further
      currentAllocation[currentMode][skill] = adjustedValue;
    } else {
      // Also check if the percentage would actually increase
      if (newTotal <= currentTotal) return; // Don't update allocation if percentage won't increase
      currentAllocation[currentMode][skill] = newValue;
    }
    
    setAllocation(currentAllocation);
  }

  function adjustAdvancedSkillPoints(skill: string, delta: number) {
    // In advanced mode, we track points with 90%/95% percentage caps (not allocation caps)
    const currentAllocation = { ...allocation };
    const currentValue = (currentAllocation.professional[skill] || 0) + (currentAllocation.personal[skill] || 0);
    const base = skillBaseChances[skill] || 0;
    const categoryBonus = getCategoryBonus(getSkillCategory(skill));
    const currentTotal = calculateTotal(skill);
    
    // For negative deltas, use as much as possible (but not more than available)
    let actualDelta = delta;
    if (delta < 0) {
      actualDelta = Math.max(delta, -currentValue); // Can't reduce below 0
    }
    
    // Calculate what the new total would be
    const newAllocationValue = Math.max(0, currentValue + actualDelta);
    const newTotal = base + categoryBonus + newAllocationValue;
    
    if (delta > 0) { // Only check caps when increasing
      // Check if any skill is already at 91% or higher
      const hasSkillAbove90 = Object.keys({ ...skillBaseChances }).some(otherSkill => {
        if (otherSkill === skill) return false; // Don't count the current skill
        const otherTotal = calculateTotal(otherSkill);
        return otherTotal >= 91;
      });
      
      // Determine the cap for this skill
      const skillCap = hasSkillAbove90 ? 90 : 95;
      
      // Don't allow the skill percentage to exceed the cap
      if (newTotal > skillCap) {
        return; // Don't update allocation if it would exceed the percentage cap
      }
      
      // Also don't update if the percentage wouldn't actually increase
      if (newTotal <= currentTotal) {
        return;
      }
    }
    
    // Store all points in professional for simplicity in advanced mode
    const updatedAllocation = { ...currentAllocation };
    updatedAllocation.professional[skill] = newAllocationValue;
    updatedAllocation.personal[skill] = 0; // Clear personal to avoid double counting
    
    if (newAllocationValue === 0) {
      delete updatedAllocation.professional[skill];
      delete updatedAllocation.personal[skill];
    }
    
    setAllocation(updatedAllocation);
  }

  function handleComplete() {
    const combinedSkills: Record<string, number> = {};
    
    // Combine all skill allocations
    Object.keys({ ...skillBaseChances }).forEach(skill => {
      const total = calculateTotal(skill);
      if (total > 0) {
        combinedSkills[skill] = total;
      }
    });
    
    onComplete(combinedSkills);
  }

  const allSkills = Object.keys(skillBaseChances).sort();
  const skillsByCategory = Object.entries(skillCategories).reduce((acc, [category, data]) => {
    acc[category] = data.skills.filter(skill => allSkills.includes(skill));
    return acc;
  }, {} as Record<string, string[]>);


  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-4">
          {isAdvancedMode ? 'Set Skills (Advanced Mode)' : 'Allocate Skill Points'}
        </h2>
        
        {isAdvancedMode && (
          <p className="text-slate-400 mb-6">Set any skill values - no point limits or profession restrictions</p>
        )}
        
        {!isAdvancedMode && (
          <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setMode('professional')}
            className={`p-4 rounded-lg border transition-colors ${
              mode === 'professional'
                ? 'bg-blue-900 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="font-semibold">Professional Skills</div>
            <div className="text-sm mt-1">
              {professionalSpent} / {professionalPoints} points
            </div>
            <div className="text-xs text-green-400">
              {professionalPoints - professionalSpent} remaining
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Limited to profession skills
            </div>
          </button>
          
          <button
            onClick={() => setMode('personal')}
            className={`p-4 rounded-lg border transition-colors ${
              mode === 'personal'
                ? 'bg-blue-900 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="font-semibold">Personal Skills</div>
            <div className="text-sm mt-1">
              {personalSpent} / {personalPoints} points
            </div>
            <div className="text-xs text-green-400">
              {personalPoints - personalSpent} remaining
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Can be any skill
            </div>
          </button>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, skills]) => {
            // In advanced mode, show all skills. Otherwise, follow normal professional/personal mode logic
            const adjustableSkills = isAdvancedMode 
              ? skills 
              : mode === 'professional' 
                ? skills.filter(skill => characterProfessionSkills.includes(skill))
                : skills;
            
            // Skip categories with no adjustable skills in professional mode (but not advanced mode)
            if (!isAdvancedMode && mode === 'professional' && adjustableSkills.length === 0) {
              return null;
            }
            
            return (
            <div key={category} className="border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-400 capitalize mb-3">
                {category} Skills
                <span className="text-sm text-slate-400 ml-2">
                  ({(skillCategories as any)[category].characteristic} based, 
                  +{getCategoryBonus(category)}% bonus)
                </span>
              </h3>
              
              <div className="grid gap-2">
                {adjustableSkills.map(skill => {
                  const isProfessionSkill = characterProfessionSkills.includes(skill);
                  const isDisabled = mode === 'professional' && !isProfessionSkill;
                  const base = skillBaseChances[skill] || 0;
                  const categoryBonus = getCategoryBonus(category);
                  const professionalAlloc = getEffectiveAllocation(skill, 'professional');
                  const personalAlloc = getEffectiveAllocation(skill, 'personal');
                  const total = calculateTotal(skill);
                  
                  return (
                    <div 
                      key={skill} 
                      className={`flex items-center justify-between p-2 rounded ${
                        isDisabled ? 'opacity-50' : ''
                      } ${
                        isProfessionSkill ? 'bg-slate-800' : 'bg-slate-900'
                      }`}
                    >
                      <div className="flex-1">
                        <span className="text-white font-medium">{skill}</span>
                        {isProfessionSkill && (
                          <span className="text-xs text-green-400 ml-2">(Prof)</span>
                        )}
                      </div>
                      
                      {isAdvancedMode ? (
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-slate-400">
                            {base}% + {categoryBonus}%
                          </span>
                          
                          {professionalAlloc + personalAlloc > 0 && (
                            <span className="text-green-400">+{professionalAlloc + personalAlloc}</span>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => adjustAdvancedSkillPoints(skill, -5)}
                              disabled={((allocation.professional[skill] || 0) + (allocation.personal[skill] || 0)) === 0}
                              className="w-8 h-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-xs"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => adjustAdvancedSkillPoints(skill, -1)}
                              disabled={((allocation.professional[skill] || 0) + (allocation.personal[skill] || 0)) === 0}
                              className="w-6 h-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-xs"
                            >
                              -1
                            </button>
                            
                            <span className="w-12 text-center font-bold text-white">
                              {total}%
                            </span>
                            
                            <button
                              onClick={() => adjustAdvancedSkillPoints(skill, 1)}
                              className="w-6 h-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-xs"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => adjustAdvancedSkillPoints(skill, 5)}
                              className="w-8 h-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-xs"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-slate-400">
                            {base}% + {categoryBonus}%
                          </span>
                          
                          {professionalAlloc > 0 && (
                            <span className="text-blue-400">+{professionalAlloc}P</span>
                          )}
                          
                          {personalAlloc > 0 && (
                            <span className="text-green-400">+{personalAlloc}p</span>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => adjustSkillPoints(skill, -5)}
                              disabled={isDisabled || (mode === 'professional' ? professionalAlloc : personalAlloc) === 0}
                              className="w-8 h-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-xs"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => adjustSkillPoints(skill, -1)}
                              disabled={isDisabled || (mode === 'professional' ? professionalAlloc : personalAlloc) === 0}
                              className="w-6 h-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-xs"
                            >
                              -1
                            </button>
                            
                            <span className="w-12 text-center font-bold text-white">
                              {total}%
                            </span>
                            
                            <button
                              onClick={() => adjustSkillPoints(skill, 1)}
                              disabled={isDisabled || total >= 75}
                              className="w-6 h-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-xs"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => adjustSkillPoints(skill, 5)}
                              disabled={isDisabled || total >= 75}
                              className="w-8 h-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-xs"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleComplete}
          disabled={!isAdvancedMode && (professionalSpent !== professionalPoints || personalSpent !== personalPoints)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAdvancedMode 
            ? 'Complete Character' 
            : `Complete Character (${professionalSpent}/${professionalPoints} Prof, ${personalSpent}/${personalPoints} Pers)`
          }
        </button>
      </div>
    </div>
  );
}