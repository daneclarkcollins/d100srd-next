"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, RotateCcw, Printer, ChevronLeft, Dice6, Upload, Download, Users, Check, X, Edit, Plus, ArrowLeft, TrendingUp } from 'lucide-react';
import { Character, SpeciesChoice, createNewCharacter } from '@/lib/character-data';
import SpeciesSelection from '@/components/CharacterBuilder/SpeciesSelection';
import SkillSelection from '@/components/CharacterBuilder/SkillSelection';
import CharacterList from '@/components/CharacterList';
import CharacterSheet from '@/components/CharacterSheet';
import Modal from '@/components/Modal/Modal';
import { useSupabase } from '@/components/SupabaseProvider';
import { useCharacters } from '@/hooks/useCharacters';

// Equipment step component that auto-rolls on mount
function EquipmentStepNormal({ character, setCharacter, isEditing }: { 
  character: Character; 
  setCharacter: (char: Character) => void;
  isEditing?: boolean;
}) {
  const [fundsInput, setFundsInput] = useState(character.startingFundsAmount || 0);

  // Auto-roll on mount if no funds set yet and not editing
  useEffect(() => {
    if (!isEditing && character.startingFundsAmount === 0) {
      const roll = Math.floor(Math.random() * 4) + 1; // 1d4
      const amount = roll * 10 + 10;
      setCharacter({
        ...character,
        startingFundsAmount: amount,
        startingFunds: `${amount} gp (rolled ${roll} × 10 + 10)`
      });
      setFundsInput(amount);
    } else if (isEditing) {
      setFundsInput(character.startingFundsAmount || 0);
    }
  }, []); // Only run once on mount

  const handleReroll = () => {
    const roll = Math.floor(Math.random() * 4) + 1; // 1d4
    const amount = roll * 10 + 10;
    setCharacter({
      ...character,
      startingFundsAmount: amount,
      startingFunds: `${amount} gp (rolled ${roll} × 10 + 10)`
    });
    setFundsInput(amount);
  };

  const handleFundsChange = (value: string) => {
    const amount = parseInt(value) || 0;
    setFundsInput(amount);
    setCharacter({
      ...character,
      startingFundsAmount: amount,
      startingFunds: `${amount} gp`
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        {isEditing ? 'Current Funds' : 'Starting Funds'}
      </h3>
      <p className="text-slate-400 mb-6">
        {isEditing 
          ? 'Adjust your character\'s current funds as needed.'
          : 'Your starting funds have been rolled (1d4 × 10 + 10 gold pieces).'}
      </p>
      
      <div className="space-y-6">
        {isEditing ? (
          <div>
            <label htmlFor="funds-edit" className="block text-sm font-medium text-slate-300 mb-2">
              Funds (gold pieces):
            </label>
            <input
              id="funds-edit"
              type="number"
              value={fundsInput}
              onChange={(e) => handleFundsChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount..."
              min="0"
            />
          </div>
        ) : (
          <div className="text-center p-6 bg-slate-800 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-2">Starting Funds</h4>
            <p className="text-3xl font-bold text-green-400">{character.startingFunds}</p>
          </div>
        )}
        
        <div className="flex gap-4">
          {!isEditing && (
            <button
              onClick={handleReroll}
              className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Dice6 className="w-4 h-4" />
              Re-roll
            </button>
          )}
          <button
            onClick={() => setCharacter({ ...character, currentStep: 'complete' })}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Complete Character'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CharacterBuilderInner() {
  const searchParams = useSearchParams();
  const { user } = useSupabase();
  const { saveCharacter, loading: charactersLoading, fetchCharacters, characters } = useCharacters();
  const [character, setCharacter] = useState<Character>(createNewCharacter());
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(null);
  const [characteristicMethod, setCharacteristicMethod] = useState<'roll' | 'pointbuy' | null>(null);
  const [pointBuyStats, setPointBuyStats] = useState({
    STR: 10, CON: 10, SIZ: 10, INT: 10, ACU: 10, DEX: 10, SOC: 10
  });
  const [availablePoints, setAvailablePoints] = useState(24);
  const [characterMode, setCharacterMode] = useState<'normal' | 'advanced' | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  const isAdvancedMode = characterMode === 'advanced';
  const isEditing = !!searchParams.get('edit');

  // Handle URL parameters for edit mode
  useEffect(() => {
    const editId = searchParams.get('edit');
    const step = searchParams.get('step');
    
    if (editId && !charactersLoading) {
      const charToEdit = characters.find(c => c.id === editId);
      if (charToEdit) {
        // Ensure all required properties exist with defaults
        const loadedChar: Character = {
          ...createNewCharacter(), // Start with default values
          ...charToEdit, // Override with loaded data
          specialAbilities: (charToEdit as any).specialAbilities || (charToEdit as any).special_abilities || [],
          startingEquipment: (charToEdit as any).startingEquipment || (charToEdit as any).starting_equipment || [],
          derivedStats: (charToEdit as any).derivedStats || (charToEdit as any).derived_stats || {},
          characteristics: (charToEdit as any).characteristics || {},
          skills: (charToEdit as any).skills || {}
        } as Character;
        
        setCharacter(loadedChar);
        setCurrentCharacterId(editId);
        setCharacterMode('advanced');
        
        // Set the step if specified, default to characteristics for edit
        if (step === 'characteristics' || !step) {
          setCharacter(prev => ({ ...prev, currentStep: 'characteristics' }));
        }
        
        // Set up point buy stats if they exist
        if (loadedChar.characteristics?.STR && loadedChar.characteristics.STR > 0) {
          setPointBuyStats({
            STR: loadedChar.characteristics.STR,
            CON: loadedChar.characteristics.CON,
            SIZ: loadedChar.characteristics.SIZ,
            INT: loadedChar.characteristics.INT,
            ACU: loadedChar.characteristics.ACU,
            DEX: loadedChar.characteristics.DEX,
            SOC: loadedChar.characteristics.SOC
          });
          setCharacteristicMethod('pointbuy');
        }
      }
    }
  }, [searchParams, characters, charactersLoading]);

  useEffect(() => {
    const saved = localStorage.getItem('sagaborn-character');
    if (saved) {
      try {
        const loadedCharacter = JSON.parse(saved);
        setCharacter(loadedCharacter);
        if (loadedCharacter.characteristics.STR > 0) {
          setPointBuyStats({
            STR: loadedCharacter.characteristics.STR,
            CON: loadedCharacter.characteristics.CON,
            SIZ: loadedCharacter.characteristics.SIZ,
            INT: loadedCharacter.characteristics.INT,
            ACU: loadedCharacter.characteristics.ACU,
            DEX: loadedCharacter.characteristics.DEX,
            SOC: loadedCharacter.characteristics.SOC
          });
        }
      } catch (e) {
        console.error('Failed to load saved character:', e);
      }
    }
  }, []);

  // Auto-save to localStorage whenever character changes
  useEffect(() => {
    if (character.name || character.currentStep !== 'species') {
      saveToLocalStorage();
    }
  }, [character]);


  const saveToLocalStorage = () => {
    localStorage.setItem('sagaborn-character', JSON.stringify(character));
  };

  const saveCharacterToDatabase = async (showModal = true) => {
    if (!user) {
      if (showModal) {
        setShowLoginModal(true);
      }
      return false;
    }

    try {
      const savedChar = await saveCharacter(character, currentCharacterId || undefined);
      if (!currentCharacterId) {
        setCurrentCharacterId(savedChar.id);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Trigger refresh of the character list in the sidebar
      setRefreshTrigger(prev => prev + 1);
      
      return true;
    } catch (err) {
      console.error('Failed to save character:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to save character: ${errorMessage}`);
      return false;
    }
  };

  const handleSaveClick = () => {
    saveToLocalStorage();
    if (user) {
      saveCharacterToDatabase();
    } else {
      setShowLoginModal(true);
    }
  };

  const printCharacter = () => {
    window.print();
  };

  const handleNameChange = (name: string) => {
    setCharacter({ ...character, name });
  };

  const handleCharacteristicRoll = () => {
    const rollCharacteristic = () => {
      const rolls = [];
      for (let i = 0; i < 4; i++) {
        rolls.push(Math.floor(Math.random() * 6) + 1);
      }
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    const newCharacteristics = {
      STR: rollCharacteristic(),
      CON: rollCharacteristic(),
      SIZ: rollCharacteristic(),
      INT: rollCharacteristic(),
      ACU: rollCharacteristic(),
      DEX: rollCharacteristic(),
      SOC: rollCharacteristic()
    };

    // Calculate derived stats
    const effort = Math.floor((newCharacteristics.STR + newCharacteristics.CON) / 2);
    const stamina = Math.floor((newCharacteristics.CON + newCharacteristics.SIZ) / 2);
    const intellect = Math.floor((newCharacteristics.INT + newCharacteristics.ACU) / 2);
    const spirit = Math.floor((newCharacteristics.INT + newCharacteristics.SOC) / 2);
    const agility = Math.floor((newCharacteristics.DEX + newCharacteristics.ACU) / 2);
    const charm = Math.floor((newCharacteristics.SOC + newCharacteristics.INT) / 2);
    const hitPoints = Math.floor((newCharacteristics.CON + newCharacteristics.SIZ) / 2);
    const spiritPoints = newCharacteristics.INT;
    
    const updatedCharacter = {
      ...character,
      characteristics: newCharacteristics,
      derivedStats: {
        ...character.derivedStats,
        effort,
        stamina,
        intellect,
        spirit,
        agility,
        charm,
        hitPoints,
        spiritPoints
      },
      currentStep: 'characteristics'
    };
    
    setCharacter(updatedCharacter);
  };

  const completeCharacter = () => {
    setCharacter({ ...character, currentStep: 'skills' });
  };

  const getPointCost = (stat: string, currentValue: number, newValue: number): number => {
    const expensiveStats = ['DEX', 'INT', 'ACU'];
    const isExpensive = expensiveStats.includes(stat);
    const costPerPoint = isExpensive ? 2 : 1;
    return Math.abs(newValue - currentValue) * costPerPoint;
  };

  const canAffordStatChange = (stat: string, currentValue: number, newValue: number): boolean => {
    if (newValue < 8 || newValue > 19) return false;
    const cost = getPointCost(stat, currentValue, newValue);
    
    // Calculate current points spent to get accurate available points
    let totalSpent = 0;
    Object.entries(pointBuyStats).forEach(([statName, statValue]) => {
      if (statName === stat) {
        // Use the new value for the stat we're changing
        totalSpent += getPointCost(statName, 10, newValue);
      } else {
        // Use current value for other stats
        totalSpent += getPointCost(statName, 10, statValue);
      }
    });
    
    const actualAvailablePoints = 24 - totalSpent;
    return actualAvailablePoints >= 0;
  };

  const handlePointBuyChange = (stat: string, newValue: number) => {
    if (isAdvancedMode) {
      // In advanced mode, no restrictions - just prevent negative values
      setPointBuyStats(prev => ({ ...prev, [stat]: Math.max(0, newValue) }));
      return;
    }
    
    // In normal mode, cap characteristics at 19
    if (newValue > 19) return;
    
    if (!canAffordStatChange(stat, pointBuyStats[stat as keyof typeof pointBuyStats], newValue)) return;
    
    const currentValue = pointBuyStats[stat as keyof typeof pointBuyStats];
    const cost = getPointCost(stat, currentValue, newValue);
    
    setPointBuyStats(prev => ({ ...prev, [stat]: newValue }));
    setAvailablePoints(prev => newValue > currentValue ? prev - cost : prev + cost);
  };

  const confirmPointBuy = () => {
    // Calculate derived stats
    const effort = Math.floor((pointBuyStats.STR + pointBuyStats.CON) / 2);
    const stamina = Math.floor((pointBuyStats.CON + pointBuyStats.SIZ) / 2);
    const intellect = Math.floor((pointBuyStats.INT + pointBuyStats.ACU) / 2);
    const spirit = Math.floor((pointBuyStats.INT + pointBuyStats.SOC) / 2);
    const agility = Math.floor((pointBuyStats.DEX + pointBuyStats.ACU) / 2);
    const charm = Math.floor((pointBuyStats.SOC + pointBuyStats.INT) / 2);
    const hitPoints = Math.floor((pointBuyStats.CON + pointBuyStats.SIZ) / 2);
    const spiritPoints = pointBuyStats.INT;
    
    const updatedCharacter = {
      ...character,
      characteristics: pointBuyStats,
      derivedStats: {
        ...character.derivedStats,
        effort,
        stamina,
        intellect,
        spirit,
        agility,
        charm,
        hitPoints,
        spiritPoints
      },
      currentStep: 'skills'
    };
    
    setCharacter(updatedCharacter);
    setCharacteristicMethod('pointbuy');
  };

  const goToPreviousStep = () => {
    const updatedCharacter = { ...character };
    
    switch (character.currentStep) {
      case 'terian':
      case 'fey':
      case 'elven':
        updatedCharacter.currentStep = 'species';
        updatedCharacter.species = null;
        updatedCharacter.biology = null;
        updatedCharacter.culture = null;
        updatedCharacter.specialAbilities = [];
        break;
      case 'teranCulture':
      case 'dworvenCulture':
      case 'dweranCulture':
      case 'elflingCulture':
      case 'feralElflingCulture':
      case 'faunCulture':
      case 'orogCulture':
        updatedCharacter.currentStep = character.species === 'Terian' ? 'terian' : 'fey';
        updatedCharacter.biology = null;
        updatedCharacter.culture = null;
        break;
      case 'profession':
        if (character.species === 'Elven') {
          updatedCharacter.currentStep = 'elven';
          updatedCharacter.culture = null;
        } else if (character.culture) {
          // Go back to culture selection
          if (character.biology === 'Teran') updatedCharacter.currentStep = 'teranCulture';
          else if (character.biology === 'Dworven') updatedCharacter.currentStep = 'dworvenCulture';
          else if (character.biology === 'Dweran') updatedCharacter.currentStep = 'dweranCulture';
          else if (character.biology === 'Elfling') updatedCharacter.currentStep = 'elflingCulture';
          else if (character.biology === 'Feral Elfling') updatedCharacter.currentStep = 'feralElflingCulture';
          else if (character.biology === 'Faun') updatedCharacter.currentStep = 'faunCulture';
          else if (character.biology === 'Orog') updatedCharacter.currentStep = 'orogCulture';
          updatedCharacter.culture = null;
        }
        updatedCharacter.profession = null;
        updatedCharacter.startingEquipment = [];
        updatedCharacter.startingFunds = '';
        break;
      case 'archetype':
        updatedCharacter.currentStep = 'profession';
        updatedCharacter.archetype = null;
        break;
      case 'name':
        updatedCharacter.currentStep = 'archetype';
        updatedCharacter.name = '';
        break;
      case 'characteristics':
        updatedCharacter.currentStep = 'name';
        updatedCharacter.characteristics = {
          STR: 0, CON: 0, SIZ: 0, INT: 0, ACU: 0, DEX: 0, SOC: 0
        };
        // Reset characteristic method when going back
        setCharacteristicMethod(null);
        setPointBuyStats({ STR: 10, CON: 10, SIZ: 10, INT: 10, ACU: 10, DEX: 10, SOC: 10 });
        setAvailablePoints(24);
        break;
      case 'skills':
        updatedCharacter.currentStep = 'characteristics';
        // Clear skills when going back
        updatedCharacter.skills = {};
        break;
      case 'equipment':
        updatedCharacter.currentStep = 'skills';
        // Clear equipment when going back
        updatedCharacter.startingFunds = '';
        updatedCharacter.startingFundsAmount = 0;
        break;
      case 'complete':
        updatedCharacter.currentStep = 'equipment';
        // Allow re-selection of equipment
        break;
    }
    
    setCharacter(updatedCharacter);
  };

  const resetCharacter = () => {
    if (confirm('Are you sure you want to reset your character? This cannot be undone.')) {
      setCharacter(createNewCharacter());
      setCurrentCharacterId(null);
      setCharacteristicMethod(null);
      setPointBuyStats({ STR: 10, CON: 10, SIZ: 10, INT: 10, ACU: 10, DEX: 10, SOC: 10 });
      setAvailablePoints(24);
      localStorage.removeItem('sagaborn-character');
    }
  };

  const handleLoadCharacter = (loadedCharacter: Character, characterId: string) => {
    setCharacter(loadedCharacter);
    setCurrentCharacterId(characterId);
    // Update local states based on loaded character
    if (loadedCharacter.characteristics.STR > 0) {
      setPointBuyStats({
        STR: loadedCharacter.characteristics.STR,
        CON: loadedCharacter.characteristics.CON,
        SIZ: loadedCharacter.characteristics.SIZ,
        INT: loadedCharacter.characteristics.INT,
        ACU: loadedCharacter.characteristics.ACU,
        DEX: loadedCharacter.characteristics.DEX,
        SOC: loadedCharacter.characteristics.SOC
      });
    }
  };

  const handleCreateNew = () => {
    if (character.name || character.currentStep !== 'species') {
      if (confirm('Are you sure you want to start a new character? Current progress will be lost.')) {
        setCharacter(createNewCharacter());
        setCurrentCharacterId(null);
        setCharacteristicMethod(null);
        setPointBuyStats({ STR: 10, CON: 10, SIZ: 10, INT: 10, ACU: 10, DEX: 10, SOC: 10 });
        setAvailablePoints(24);
        setCharacterMode(null);
      }
    } else {
      setCharacter(createNewCharacter());
      setCurrentCharacterId(null);
      setCharacterMode(null);
    }
  };

  const handleImportCharacter = () => {
    try {
      const importedChar = JSON.parse(importData) as Character;
      setCharacter(importedChar);
      setCurrentCharacterId(null); // Mark as new character until saved
      if (importedChar.characteristics.STR > 0) {
        setPointBuyStats({
          STR: importedChar.characteristics.STR,
          CON: importedChar.characteristics.CON,
          SIZ: importedChar.characteristics.SIZ,
          INT: importedChar.characteristics.INT,
          ACU: importedChar.characteristics.ACU,
          DEX: importedChar.characteristics.DEX,
          SOC: importedChar.characteristics.SOC
        });
      }
      setImportModalOpen(false);
      setImportData('');
    } catch (err) {
      alert('Invalid character data. Please check the JSON format.');
    }
  };

  const handleExportCharacter = () => {
    const dataStr = JSON.stringify(character, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${character.name || 'character'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleSpeciesSelection = (choice: SpeciesChoice, wasRolled?: boolean) => {
    const updatedCharacter = { ...character };
    
    if (character.currentStep === 'species') {
      updatedCharacter.species = choice.result;
      
      if (choice.stats) {
        if (choice.stats.lifespan) updatedCharacter.lifespan = choice.stats.lifespan;
        if (choice.stats.height) updatedCharacter.height = choice.stats.height;
        if (choice.stats.weight) updatedCharacter.weight = choice.stats.weight;
        if (choice.stats.speed) updatedCharacter.speed = choice.stats.speed;
      }
      
      if (choice.abilities) {
        updatedCharacter.specialAbilities = [...choice.abilities];
      }
      
      if (choice.nextTable) {
        updatedCharacter.currentStep = choice.nextTable;
      } else {
        updatedCharacter.currentStep = 'name';
      }
    } else if (character.currentStep === 'terian' || character.currentStep === 'fey') {
      updatedCharacter.biology = choice.result;
      
      if (choice.stats) {
        if (choice.stats.lifespan) updatedCharacter.lifespan = choice.stats.lifespan;
        if (choice.stats.height) updatedCharacter.height = choice.stats.height;
        if (choice.stats.weight) updatedCharacter.weight = choice.stats.weight;
        if (choice.stats.speed) updatedCharacter.speed = choice.stats.speed;
      }
      
      if (choice.abilities) {
        updatedCharacter.specialAbilities = [...updatedCharacter.specialAbilities, ...choice.abilities];
      }
      
      if (choice.nextTable) {
        updatedCharacter.currentStep = choice.nextTable;
      } else {
        updatedCharacter.currentStep = 'name';
      }
    } else if (character.currentStep === 'elven') {
      updatedCharacter.culture = choice.result;
      
      if (choice.stats) {
        if (choice.stats.lifespan) updatedCharacter.lifespan = choice.stats.lifespan;
        if (choice.stats.height) updatedCharacter.height = choice.stats.height;
        if (choice.stats.weight) updatedCharacter.weight = choice.stats.weight;
        if (choice.stats.speed) updatedCharacter.speed = choice.stats.speed;
      }
      
      if (choice.abilities) {
        updatedCharacter.specialAbilities = [...updatedCharacter.specialAbilities, ...choice.abilities];
      }
      
      updatedCharacter.currentStep = 'name';
    } else if (character.currentStep.includes('Culture')) {
      updatedCharacter.culture = choice.result;
      updatedCharacter.currentStep = 'profession';
    } else if (character.currentStep === 'profession') {
      updatedCharacter.profession = choice.result;
      if (choice.stats) {
        updatedCharacter.startingEquipment = choice.stats.equipment ? [choice.stats.equipment] : [];
        updatedCharacter.startingFunds = choice.stats.funds || '';
      }
      if (choice.abilities) {
        // Store profession skills for later use
        updatedCharacter.specialAbilities = [...updatedCharacter.specialAbilities, ...choice.abilities];
      }
      updatedCharacter.currentStep = 'archetype';
    } else if (character.currentStep === 'archetype') {
      updatedCharacter.archetype = choice.result;
      updatedCharacter.currentStep = 'name';
    }
    
    setCharacter(updatedCharacter);
  };

  const getProgressInfo = () => {
    // Always show consistent 10-step process (includes skills and equipment)
    const totalSteps = 10;
    let currentStepNumber = 1;
    let stepName = 'Species';
    let isStepComplete = false;

    switch (character.currentStep) {
      case 'species':
        currentStepNumber = 1;
        stepName = 'Species';
        isStepComplete = false;
        break;
      case 'terian':
      case 'fey':
        currentStepNumber = 2;
        stepName = 'Biology';
        isStepComplete = false;
        break;
      case 'teranCulture':
      case 'dworvenCulture':
      case 'dweranCulture':
      case 'elflingCulture':
      case 'feralElflingCulture':
      case 'faunCulture':
      case 'orogCulture':
        currentStepNumber = 3;
        stepName = 'Culture';
        isStepComplete = false;
        break;
      case 'elven':
        // Elven goes directly to culture selection (step 2 of 8, but we label it as culture)
        currentStepNumber = 2;
        stepName = 'Culture';
        isStepComplete = false;
        break;
      case 'profession':
        currentStepNumber = character.species === 'Elven' ? 3 : 4;
        stepName = 'Profession';
        isStepComplete = false;
        break;
      case 'archetype':
        currentStepNumber = character.species === 'Elven' ? 4 : 5;
        stepName = 'Archetype';
        isStepComplete = false;
        break;
      case 'name':
        currentStepNumber = character.species === 'Elven' ? 5 : 6;
        stepName = 'Name';
        isStepComplete = false;
        break;
      case 'characteristics':
        currentStepNumber = character.species === 'Elven' ? 6 : 7;
        stepName = 'Characteristics';
        isStepComplete = false;
        break;
      case 'skills':
        currentStepNumber = character.species === 'Elven' ? 7 : 8;
        stepName = 'Skills';
        isStepComplete = false;
        break;
      case 'equipment':
        currentStepNumber = character.species === 'Elven' ? 8 : 9;
        stepName = 'Equipment';
        isStepComplete = false;
        break;
      case 'complete':
        currentStepNumber = totalSteps;
        stepName = 'Complete';
        isStepComplete = true;
        break;
      default:
        currentStepNumber = 1;
        stepName = 'Species';
        isStepComplete = false;
    }

    return {
      currentStepNumber,
      totalSteps,
      stepName,
      isStepComplete,
      progressPercentage: isStepComplete ? 100 : ((currentStepNumber - 1) / totalSteps) * 100
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 print:hidden">
          <h1 className="text-4xl font-bold text-white mb-4">SagaBorn Character Builder</h1>
          <p className="text-xl text-slate-400">
            Create your hero step by step through the world of SagaBorn
          </p>
        </header>


        {characterMode === null ? (
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-800 text-center print:hidden">
            <h2 className="text-3xl font-bold text-white mb-6">Choose Character Creation Mode</h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div
                onClick={() => setCharacterMode('normal')}
                className="border border-slate-600 rounded-lg p-6 hover:bg-slate-700 cursor-pointer transition-colors bg-slate-800 hover:border-blue-500"
              >
                <h3 className="text-2xl font-bold text-blue-300 mb-4">Normal Mode</h3>
                <div className="text-slate-300 space-y-2 text-left">
                  <p>• Roll dice or use point-buy for characteristics</p>
                  <p>• Choose from profession and species tables</p>
                  <p>• Skills capped at 75% during creation</p>
                  <p>• Characteristics capped at 19</p>
                  <p>• Balanced point-based allocation</p>
                </div>
                <p className="text-green-300 text-sm mt-4 font-medium">Perfect for new characters and standard gameplay</p>
              </div>
              
              <div
                onClick={() => setCharacterMode('advanced')}
                className="border border-slate-600 rounded-lg p-6 hover:bg-slate-700 cursor-pointer transition-colors bg-slate-800 hover:border-purple-500"
              >
                <h3 className="text-2xl font-bold text-purple-300 mb-4">Advanced Mode</h3>
                <div className="text-slate-300 space-y-2 text-left">
                  <p>• Set characteristics to any value (no caps)</p>
                  <p>• Choose any options without rolling</p>
                  <p>• Skills can reach 90% (one skill to 95%)</p>
                  <p>• No point restrictions or limits</p>
                  <p>• Complete creative freedom</p>
                </div>
                <p className="text-purple-300 text-sm mt-4 font-medium">Ideal for importing existing high-level characters</p>
              </div>
            </div>
          </div>
        ) : (
          <>

        <div className="flex gap-4 justify-center mb-8 print:hidden">
          {character.currentStep !== 'species' && (
            <button
              onClick={goToPreviousStep}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={resetCharacter}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={() => {
              setCharacterMode(null);
              setCharacter(createNewCharacter());
              setCharacteristicMethod(null);
              setPointBuyStats({
                STR: 10, CON: 10, SIZ: 10, INT: 10, ACU: 10, DEX: 10, SOC: 10
              });
              setAvailablePoints(24);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Start Over
          </button>
        </div>

        <div className="mb-8 print:hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-400">Progress: {getProgressInfo().stepName}</span>
            <span className="text-sm text-slate-400">
              Step {getProgressInfo().currentStepNumber} of {getProgressInfo().totalSteps}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressInfo().progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 print:hidden">
          <div className="lg:col-span-3">
            {(character.currentStep === 'species' || 
              character.currentStep === 'terian' || 
              character.currentStep === 'fey' || 
              character.currentStep === 'elven' ||
              character.currentStep.includes('Culture') ||
              character.currentStep === 'profession' ||
              character.currentStep === 'archetype') && (
              <SpeciesSelection
                currentStep={character.currentStep}
                onSelectionMade={handleSpeciesSelection}
                onStatsUpdated={(stats) => {
                  setCharacter(prev => ({
                    ...prev,
                    ...stats
                  }));
                }}
                isAdvancedMode={isAdvancedMode}
              />
            )}
            
            {character.currentStep === 'name' && (
              <div className="bg-slate-900 p-8 rounded-lg border border-slate-800">
                <h2 className="text-2xl font-semibold text-white mb-6">Character Name</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="character-name" className="block text-sm font-medium text-slate-300 mb-2">
                      Enter your character's name:
                    </label>
                    <input
                      id="character-name"
                      type="text"
                      value={character.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter character name..."
                    />
                  </div>
                  <button
                    onClick={() => setCharacter({ ...character, currentStep: 'characteristics' })}
                    disabled={!character.name.trim()}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
                  >
                    Continue to Characteristics
                  </button>
                </div>
              </div>
            )}
            
            {character.currentStep === 'characteristics' && (
              <div className="bg-slate-900 p-8 rounded-lg border border-slate-800">
                {isAdvancedMode ? (
                  // Skip method selection in advanced mode, go straight to point-buy interface
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-6">
                      Set Characteristics (Advanced Mode)
                    </h2>
                    <div className="mb-4">
                      <p className="text-slate-400 mb-2">
                        Set each characteristic to any value. No limits or costs apply.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {Object.entries(pointBuyStats).map(([stat, value]) => (
                        <div key={stat} className="flex items-center justify-between bg-slate-800 p-4 rounded">
                          <div className="flex items-center gap-4">
                            <span className="text-white font-semibold w-8">{stat}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePointBuyChange(stat, value - 1)}
                              className="w-8 h-8 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              -
                            </button>
                            <span className="text-2xl font-bold text-white w-8 text-center">{value}</span>
                            <button
                              onClick={() => handlePointBuyChange(stat, value + 1)}
                              className="w-8 h-8 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <button
                        onClick={() => {
                          // Save characteristics and calculate derived stats for advanced mode
                          const effort = Math.floor((pointBuyStats.STR + pointBuyStats.CON) / 2);
                          const stamina = Math.floor((pointBuyStats.CON + pointBuyStats.SIZ) / 2);
                          const intellect = Math.floor((pointBuyStats.INT + pointBuyStats.ACU) / 2);
                          const spirit = Math.floor((pointBuyStats.INT + pointBuyStats.SOC) / 2);
                          const agility = Math.floor((pointBuyStats.DEX + pointBuyStats.ACU) / 2);
                          const charm = Math.floor((pointBuyStats.SOC + pointBuyStats.INT) / 2);
                          const hitPoints = Math.floor((pointBuyStats.CON + pointBuyStats.SIZ) / 2);
                          const spiritPoints = pointBuyStats.INT;
                          
                          setCharacter({ 
                            ...character, 
                            characteristics: pointBuyStats,
                            derivedStats: {
                              ...character.derivedStats,
                              effort,
                              stamina,
                              intellect,
                              spirit,
                              agility,
                              charm,
                              hitPoints,
                              spiritPoints
                            },
                            currentStep: 'skills' 
                          });
                        }}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        Next: Skills
                      </button>
                    </div>
                  </div>
                ) : !characteristicMethod ? (
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-6">
                      Choose Characteristic Method{isAdvancedMode ? ' (Advanced Mode)' : ''}
                    </h2>
                    <p className="text-slate-400 mb-6">
                      {isAdvancedMode
                        ? 'How would you like to set your characteristics? No limits or restrictions apply.'
                        : 'How would you like to determine your character\'s core attributes?'
                      }
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div
                        onClick={() => {
                          setCharacteristicMethod('roll');
                          // Auto-roll immediately when method is selected
                          handleCharacteristicRoll();
                        }}
                        className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700 cursor-pointer transition-colors bg-slate-800"
                      >
                        <h3 className="font-bold text-blue-300 mb-2">Roll Method</h3>
                        <p className="text-slate-300 text-sm mb-2">Roll 4d6, drop the lowest, for each characteristic.</p>
                        <p className="text-green-300 text-sm">Traditional and exciting!</p>
                      </div>
                      
                      <div
                        onClick={() => setCharacteristicMethod('pointbuy')}
                        className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700 cursor-pointer transition-colors bg-slate-800"
                      >
                        <h3 className="font-bold text-blue-300 mb-2">Point-Buy Method</h3>
                        <p className="text-slate-300 text-sm mb-2">
                          {isAdvancedMode
                            ? 'Manually set each characteristic to any value. No point limits.'
                            : 'Start with all stats at 10. Spend 24 points to raise characteristics. DEX, INT, and ACU cost more.'
                          }
                        </p>
                        <p className="text-green-300 text-sm">
                          {isAdvancedMode ? 'Complete freedom!' : 'More control and customization!'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : characteristicMethod === 'roll' ? (
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-6">Rolled Characteristics</h2>
                    <p className="text-slate-400 mb-6">
                      Your characteristics have been rolled using 4d6, drop the lowest. You can re-roll if desired.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-sm text-slate-400">STR</div>
                          <div className="text-2xl font-bold text-white">{character.characteristics.STR}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400">CON</div>
                          <div className="text-2xl font-bold text-white">{character.characteristics.CON}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400">SIZ</div>
                          <div className="text-2xl font-bold text-white">{character.characteristics.SIZ}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400">INT</div>
                          <div className="text-2xl font-bold text-white">{character.characteristics.INT}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400">ACU</div>
                          <div className="text-2xl font-bold text-white">{character.characteristics.ACU}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400">DEX</div>
                          <div className="text-2xl font-bold text-white">{character.characteristics.DEX}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400">SOC</div>
                          <div className="text-2xl font-bold text-white">{character.characteristics.SOC}</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setCharacteristicMethod(null);
                            setCharacter({...character, characteristics: {
                              STR: 0, CON: 0, SIZ: 0, INT: 0, ACU: 0, DEX: 0, SOC: 0
                            }});
                          }}
                          className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          Back to Method Selection
                        </button>
                        <button
                          onClick={handleCharacteristicRoll}
                          className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          Re-roll All
                        </button>
                        <button
                          onClick={completeCharacter}
                          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Next: Skills
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-6">
                      {isAdvancedMode ? 'Set Characteristics (Advanced Mode)' : 'Point-Buy Characteristics'}
                    </h2>
                    <div className="mb-4">
                      <p className="text-slate-400 mb-2">
                        {isAdvancedMode 
                          ? 'Set each characteristic to any value. No limits or costs apply.'
                          : 'Customize your characteristics by spending points. All stats start at 10.'
                        }
                      </p>
                      {!isAdvancedMode && (
                        <p className="text-blue-300 text-sm mb-4">
                          Points Remaining: <span className="font-bold text-xl">{availablePoints}</span> 
                          <span className="text-slate-400 ml-2">(STR, CON, SIZ, SOC cost 1 point each. DEX, INT, ACU cost 2 points each)</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {Object.entries(pointBuyStats).map(([stat, value]) => (
                        <div key={stat} className="flex items-center justify-between bg-slate-800 p-4 rounded">
                          <div className="flex items-center gap-4">
                            <span className="text-white font-semibold w-8">{stat}</span>
                            {!isAdvancedMode && (
                              <span className="text-slate-400 text-sm">
                                {['DEX', 'INT', 'ACU'].includes(stat) ? '(2 pts)' : '(1 pt)'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isAdvancedMode ? (
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => {
                                  const newValue = parseInt(e.target.value) || 0;
                                  handlePointBuyChange(stat, newValue);
                                }}
                                className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-center"
                              />
                            ) : (
                              <>
                                <button
                                  onClick={() => handlePointBuyChange(stat, value - 1)}
                                  disabled={!canAffordStatChange(stat, value, value - 1)}
                                  className="w-8 h-8 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500"
                                >
                                  -
                                </button>
                                <span className="text-2xl font-bold text-white w-8 text-center">{value}</span>
                                <button
                                  onClick={() => handlePointBuyChange(stat, value + 1)}
                                  disabled={!canAffordStatChange(stat, value, value + 1)}
                                  className="w-8 h-8 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500"
                                >
                                  +
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setCharacteristicMethod(null);
                          setPointBuyStats({ STR: 10, CON: 10, SIZ: 10, INT: 10, ACU: 10, DEX: 10, SOC: 10 });
                          setAvailablePoints(24);
                        }}
                        className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        Back to Method Selection
                      </button>
                      <button
                        onClick={confirmPointBuy}
                        disabled={!isAdvancedMode && availablePoints > 0}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
                      >
                        {isAdvancedMode ? 'Next: Skills' : 'Confirm Point-Buy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {character.currentStep === 'skills' && (
              <SkillSelection
                character={character}
                isAdvancedMode={isAdvancedMode}
                onComplete={(skills) => {
                  setCharacter({
                    ...character,
                    skills,
                    currentStep: 'equipment'
                  });
                }}
                onBack={() => setCharacter({ ...character, currentStep: 'characteristics' })}
              />
            )}
            
            {character.currentStep === 'equipment' && (
              <div className="bg-slate-900 p-8 rounded-lg border border-slate-800">
                <h2 className="text-2xl font-semibold text-white mb-6">Starting Equipment</h2>
                
                {isAdvancedMode ? (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {isEditing ? 'Edit Current Funds (Advanced Mode)' : 'Set Starting Funds (Advanced Mode)'}
                    </h3>
                    <p className="text-slate-400 mb-6">
                      {isEditing ? 'Update your current funds amount.' : 'Enter any amount for your starting funds. No restrictions apply.'}
                    </p>
                    
                    <div className="mb-6">
                      <label htmlFor="funds-amount" className="block text-sm font-medium text-slate-300 mb-2">
                        {isEditing ? 'Current Funds' : 'Starting Funds'} (gold pieces):
                      </label>
                      <input
                        id="funds-amount"
                        type="number"
                        value={character.startingFundsAmount || ''}
                        onChange={(e) => {
                          const amount = parseInt(e.target.value) || 0;
                          setCharacter({
                            ...character,
                            startingFundsAmount: amount,
                            startingFunds: `${amount} gp`
                          });
                        }}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter amount..."
                        min="0"
                      />
                    </div>
                    
                    <button
                      onClick={() => setCharacter({ ...character, currentStep: 'complete' })}
                      disabled={character.startingFundsAmount === 0}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
                    >
                      {isEditing ? 'Save Changes' : 'Complete Character'}
                    </button>
                  </div>
                ) : (
                  <EquipmentStepNormal character={character} setCharacter={setCharacter} isEditing={isEditing} />
                )}
              </div>
            )}
            
            {character.currentStep === 'complete' && (
              <div className="character-complete">
                <CharacterSheet
                  character={character}
                  onEdit={() => {
                    setCharacter({ ...character, currentStep: 'characteristics' });
                    setCharacteristicMethod(null);
                  }}
                  onSave={() => saveCharacterToDatabase()}
                  onPrint={printCharacter}
                  onCreateNew={handleCreateNew}
                  onLevelUp={() => setShowLevelUpModal(true)}
                  isSaving={charactersLoading}
                  saveSuccess={saveSuccess}
                />
                
              </div>
            )}
          </div>

          <div className="lg:col-span-1 print:hidden">
            <CharacterList 
              onLoadCharacter={handleLoadCharacter}
              onCreateNew={handleCreateNew}
              refreshTrigger={refreshTrigger}
            />
            
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 h-fit mt-6">
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
              
              {character.profession && (
                <div>
                  <span className="text-slate-400">Profession:</span>
                  <span className="ml-2 text-white">{character.profession}</span>
                </div>
              )}
              
              {character.archetype && (
                <div>
                  <span className="text-slate-400">Archetype:</span>
                  <span className="ml-2 text-white">{character.archetype}</span>
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
              
              {character.lifespan > 0 && (
                <div>
                  <span className="text-slate-400">Avg. Lifespan:</span>
                  <span className="ml-2 text-white">{character.lifespan} years</span>
                </div>
              )}
              
              {character.specialAbilities && character.specialAbilities.length > 0 && (
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
          </>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Save Character</h3>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-300 mb-4">
                Please log in to save your character to the cloud and access it from any device.
              </p>
              <div className="flex gap-2">
                <a href="/login" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
                  Log In
                </a>
                <a href="/signup" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center">
                  Sign Up
                </a>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Your character is saved locally and will be saved to the cloud after you log in.
              </p>
            </div>
          </div>
        )}

        {/* Level Up Modal */}
        <Modal
          isOpen={showLevelUpModal}
          onClose={() => setShowLevelUpModal(false)}
          title="Level Up - Coming Soon!"
          size="sm"
        >
          <div className="text-center py-4">
            <div className="text-6xl mb-4">🎲</div>
            <p className="text-white text-lg mb-2">
              The Level Up feature is coming soon!
            </p>
            <p className="text-slate-400">
              You'll be able to advance your character, gain new skills, and increase your abilities.
            </p>
            <button
              onClick={() => setShowLevelUpModal(false)}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </Modal>

        {/* Import Modal */}
        {importModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Import Character</h3>
                <button
                  onClick={() => {
                    setImportModalOpen(false);
                    setImportData('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-300 mb-4">
                Paste your character JSON data below:
              </p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full h-40 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 resize-none"
                placeholder="Paste character JSON here..."
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setImportModalOpen(false);
                    setImportData('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportCharacter}
                  disabled={!importData.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default function CharacterBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <CharacterBuilderInner />
    </Suspense>
  );
}
