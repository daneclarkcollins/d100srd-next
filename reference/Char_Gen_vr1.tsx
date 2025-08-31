import React, { useState, useEffect } from 'react';
import { Dice6, RotateCcw, ChevronRight, ChevronLeft, Printer } from 'lucide-react';

const SagaBornCharacterCreator = () => {
  const [character, setCharacter] = useState({
    name: '',
    species: null,
    biology: null,
    culture: null,
    heritage: null,
    profession: null,
    archetype: null,
    age: null,
    characteristics: {
      STR: 0, CON: 0, SIZ: 0, INT: 0, ACU: 0, DEX: 0, SOC: 0
    },
    derivedStats: {
      effort: 0, stamina: 0, intellect: 0, spirit: 0, agility: 0, charm: 0,
      hitPoints: 0, spiritPoints: 0, damageModifier: 'None', experienceBonus: 0,
      movementSpeed: 25, horrorResistance: 0
    },
    lifespan: 65,
    height: "5' 8\"",
    weight: "180 lb",
    speed: 30,
    specialAbilities: [],
    startingEquipment: [],
    startingFunds: '',
    currentStep: 'species'
  });

  const [rollHistory, setRollHistory] = useState([]);
  const [showPrintView, setShowPrintView] = useState(false);
  const [characteristicMethod, setCharacteristicMethod] = useState('');
  const [pointBuyPoints, setPointBuyPoints] = useState(24);
  const [tempCharacteristics, setTempCharacteristics] = useState({
    STR: 10, CON: 10, INT: 10, ACU: 10, DEX: 10, SOC: 10
  });

  const rollDice = (sides, count = 1) => {
    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    return rolls;
  };

  const rollSIZ = () => {
    if (!character.species) return 0;
    
    if (character.biology === 'Elfling' || character.biology === 'Feral Elfling') {
      return rollDice(3)[0] + 3; // 1d3+3
    } else if (character.biology === 'Dworven') {
      return rollDice(6, 2).reduce((a, b) => a + b, 4); // 2d6+4
    } else if (character.species === 'Elven' || character.biology === 'Teran' || character.biology === 'Faun' || character.biology === 'Dweran') {
      return rollDice(6, 2).reduce((a, b) => a + b, 6); // 2d6+6
    } else if (character.biology === 'Orog') {
      return rollDice(3)[0] + 19; // 1d3+19
    }
    return rollDice(6, 2).reduce((a, b) => a + b, 6); // default 2d6+6
  };

  const calculatePointCost = (stat, currentValue, targetValue) => {
    if (targetValue < 3 || targetValue > 19) return Infinity;
    
    let cost = 0;
    const expensive = ['DEX', 'INT', 'ACU'].includes(stat);
    
    for (let i = Math.min(currentValue, targetValue); i < Math.max(currentValue, targetValue); i++) {
      if (targetValue > currentValue) {
        // Buying up
        if (expensive) {
          if (i < 13) cost += 1;
          else if (i < 16) cost += 3;
          else cost += 4;
        } else {
          if (i < 15) cost += 1;
          else cost += 2;
        }
      } else {
        // Buying down (refund)
        if (expensive) {
          if (i >= 17) cost -= 4;
          else if (i >= 14) cost -= 3;
          else cost -= 1;
        } else {
          if (i >= 16) cost -= 2;
          else cost -= 1;
        }
      }
    }
    
    return cost;
  };

  const updateDerivedStats = (characteristics) => {
    const dmgMod = getDamageModifier(characteristics.STR + characteristics.SIZ);
    
    return {
      effort: characteristics.STR * 5,
      stamina: characteristics.CON * 5,
      intellect: characteristics.INT * 5,
      spirit: characteristics.ACU * 5,
      agility: characteristics.DEX * 5,
      charm: characteristics.SOC * 5,
      hitPoints: characteristics.CON + characteristics.SIZ,
      spiritPoints: characteristics.ACU,
      damageModifier: dmgMod,
      experienceBonus: Math.ceil(characteristics.INT / 2),
      movementSpeed: character.speed || 25,
      horrorResistance: characteristics.ACU * 5
    };
  };

  const getDamageModifier = (strPlusSiz) => {
    if (strPlusSiz <= 12) return '-2';
    if (strPlusSiz <= 16) return '-1';
    if (strPlusSiz <= 24) return 'None';
    if (strPlusSiz <= 32) return '+1d4';
    if (strPlusSiz <= 40) return '+1d6';
    if (strPlusSiz <= 56) return '+2d6';
    if (strPlusSiz <= 72) return '+3d6';
    if (strPlusSiz <= 88) return '+4d6';
    if (strPlusSiz <= 104) return '+5d6';
    return '+6d6+';
  };

  const speciesTable = [
    { range: [1, 6], result: 'Terian', description: 'Species born and evolved in Atheles', nextTable: 'terian' },
    { range: [7, 9], result: 'Fey', description: 'Species originating from other worlds', nextTable: 'fey' },
    { range: [10, 10], result: 'Elven', description: 'A specific species originating from another place', nextTable: 'elven' }
  ];

  const terianBiologyTable = [
    { range: [1, 7], result: 'Teran', description: 'The most common biology in Atheles', nextTable: 'teranCulture', 
      stats: { lifespan: 65, height: "5' 8\"", weight: "180 lb", speed: 30 } },
    { range: [8, 9], result: 'Dworven', description: 'The oldest people of Atheles', nextTable: 'dworvenCulture',
      stats: { lifespan: 150, height: "4' 5\"", weight: "195 lb", speed: 20 }, abilities: ['Dark Vision 60\''] },
    { range: [10, 10], result: 'Dweran', description: 'A person of both Teran and Dworven descent', nextTable: 'dweranCulture',
      stats: { lifespan: 85, height: "5' 3\"", weight: "225 lb", speed: 25 }, abilities: ['Dark Vision 30\''] }
  ];

  const teranCultureTable = [
    { range: [1, 1], result: 'Tiren', description: 'The Kingdom of the Rising Sun. Tirians are an open-minded but militaristic culture.' },
    { range: [2, 2], result: 'Uthgard', description: 'The Dragon Kingdom. Center of learning and engineering.' },
    { range: [3, 3], result: 'Free Lands', description: 'Independent city-states or nomad tribes.' },
    { range: [4, 4], result: 'Wastelands', description: 'Magic blasted lands of the old Aradan Kingdom.' },
    { range: [5, 5], result: 'Endamas', description: 'Kingdom of the Westlands with elected democracy.' },
    { range: [6, 6], result: 'Ish', description: 'Great Empire with renaissance culture but strict magic control.' },
    { range: [7, 7], result: 'Mideon', description: 'Grasslands home to many smaller kingdoms.' },
    { range: [8, 8], result: 'Norhan', description: 'Kingdom ruled by Council in grand city of Seahaven.' },
    { range: [9, 9], result: 'Vanad', description: 'Island kingdom known for fierce seafaring people.' },
    { range: [10, 10], result: 'Nomad', description: 'Traveling tribes seeking resources.' },
    { range: [11, 11], result: 'Zhou', description: 'Eastern continent traders and migrants.' },
    { range: [12, 12], result: 'Non-teran culture', description: 'Raised among another species.' }
  ];

  const dworvenCultureTable = [
    { range: [1, 6], result: 'Free dworv', description: 'Reject religious structure, live among terans or as nomads.' },
    { range: [7, 9], result: 'Greyhelm dworv', description: 'Religious dworves of the mountain kingdom.' },
    { range: [10, 10], result: 'Dragon dworv', description: 'Hairless dworves from the far South.' }
  ];

  const dweranCultureTable = [
    { range: [1, 8], result: 'Teran Culture', description: 'Grew up in a teran community.' },
    { range: [9, 10], result: 'Dworven Culture', description: 'Grew up in dworven communities.' }
  ];

  const terianHeritageTable = [
    { range: [1, 3], result: 'Craftsman', description: 'Gain +3% knowledge on stonework, woodwork, or metalwork.' },
    { range: [4, 7], result: 'Skilled', description: 'Gain 5 personal points to spend on skills.' },
    { range: [8, 10], result: 'Wanderer', description: 'Gain +3% to Survival. Once per day reroll failed Knowledge check.' }
  ];

  const feyBiologyTable = [
    { range: [1, 6], result: 'Elfling', description: 'Small fey folk on their Calling', nextTable: 'elflingCulture',
      stats: { lifespan: 130, height: "3'", weight: "65 lb", speed: 20 }, abilities: ['Dark Vision 60\'', 'Iron Discomfort'] },
    { range: [7, 8], result: 'Feral Elfling', description: 'Caught between worlds during Disappearance', nextTable: 'feralElflingCulture',
      stats: { lifespan: 90, height: "3'", weight: "65 lb", speed: 20 }, abilities: ['Dark Vision 60\'', 'Iron Harm (1d4/hour)'] },
    { range: [9, 9], result: 'Faun', description: 'Reclusive forest dwellers', nextTable: 'faunCulture',
      stats: { lifespan: 100, height: "5' 6\"", weight: "155 lb", speed: 30 }, abilities: ['Dark Vision 60\'', 'Iron Discomfort'] },
    { range: [10, 10], result: 'Orog', description: 'Large turtle-like people', nextTable: 'orogCulture',
      stats: { lifespan: 150, height: "7' 6\"", weight: "400 lb", speed: 30 }, abilities: ['Cold Sensitivity', '+1 AV Shell', 'Large Size'] }
  ];

  const elflingCultureTable = [
    { range: [1, 4], result: 'Tallgarden', description: 'Strong, peaceful community with close ties to terans in Kowal.' },
    { range: [5, 8], result: 'The Vale', description: 'Rolling hills and mound homes in idyllic Western lands.' },
    { range: [9, 10], result: 'Nomad', description: 'Wandering tribe across all the lands.' }
  ];

  const feralElflingCultureTable = [
    { range: [1, 5], result: 'Northern Returnees', description: 'Returned from In-Between two decades ago, mostly reacclimated.' },
    { range: [6, 7], result: 'Wasteland Returnees', description: 'Returned to dangerous Wastelands of the South.' },
    { range: [8, 9], result: 'Recent Returnees', description: 'Recently returned, unfamiliar with this strange land.' },
    { range: [10, 10], result: 'Lone Returnee', description: 'Returned alone, hungry and afraid.' }
  ];

  const faunCultureTable = [
    { range: [1, 5], result: 'Sylvan', description: 'Isolated deep in mountain forests during Disappearance.' },
    { range: [6, 8], result: 'Warband', description: 'Fought in Great War, fierce survivors of In-Between.' },
    { range: [9, 10], result: 'Nomad', description: 'Continued nomadic lifestyle after returning from In-Between.' }
  ];

  const orogCultureTable = [
    { range: [1, 4], result: 'Ten Towns', description: 'From Ten Towns settlement in Ish, high Orog population.' },
    { range: [5, 8], result: 'Wastelands', description: 'From tribe in the Wastes, seeking better life.' },
    { range: [9, 10], result: 'Outcast', description: 'Outcast from homeland.' }
  ];

  const feyHeritageTable = [
    { range: [1, 3], result: 'Ancient fey', description: 'Mind spells difficult against you. Animal Friend spell.' },
    { range: [4, 7], result: 'Chaos fey', description: 'Fearless. Fear spells difficult against you.' },
    { range: [8, 10], result: 'Wasteland fey', description: 'Gain +3% to Survival.' }
  ];

  const elvenCultureTable = [
    { range: [1, 1], result: 'Losvari', description: 'The lost elves who fought in the Great War.' },
    { range: [2, 2], result: 'Anavari', description: 'The wilde elves of the bushlands.' },
    { range: [3, 3], result: 'Kaelvari', description: 'The western wood elves.' },
    { range: [4, 4], result: 'Alostrovari', description: 'The sea elves.' },
    { range: [5, 5], result: 'Evantari', description: 'The high elves who believe themselves superior.' },
    { range: [6, 6], result: 'Orovari', description: 'The dark elves from the cold North.' }
  ];

  const elvenHeritageTable = [
    { range: [1, 1], result: 'Alostrovari', description: 'Seafaring (reroll boat checks once/day).' },
    { range: [2, 2], result: 'Anarvari', description: 'Forager (reroll wilderness checks once/day).' },
    { range: [3, 3], result: 'Evantari', description: 'Dazeless, mind control spells difficult.' },
    { range: [4, 4], result: 'Kaelvari', description: 'Fleet of Foot (normal forest movement).' },
    { range: [5, 5], result: 'Losvari', description: 'Demon Sense (+10% knowledge about Navirim).' },
    { range: [6, 6], result: 'Orovari', description: '+3% Survival and +3% nature knowledge.' }
  ];

  const professionTable = [
    { range: [1, 2], result: 'Crafter', rarity: 'Very Common', archetype: 'Expert', 
      equipment: 'Basic clothing, tools of the trade', funds: '1d4 x 10 + 20 gp',
      skills: ['Appraise', 'Art', 'Bargain', 'Craft (2 skills)', 'Spot', 'Research', 'Fine Manipulation', 'Repair'] },
    { range: [3, 4], result: 'Farmer', rarity: 'Very Common', archetype: 'Expert',
      equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 5 gp',
      skills: ['Bargain', 'Craft', 'Knowledge (Natural History)', 'Listen', 'Spot', 'Brawl', 'Drive', 'First Aid'] },
    { range: [5, 6], result: 'Herder', rarity: 'Very Common', archetype: 'Expert/Warrior',
      equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 5 gp',
      skills: ['Craft', 'Knowledge (Natural History)', 'Knowledge (Region)', 'Listen', 'Navigate', 'Ride', 'Spot', 'Survival', 'Throw', 'Track'] },
    { range: [7, 11], result: 'Hunter', rarity: 'Very Common', archetype: 'Expert',
      equipment: 'Basic clothing, short bow, small weapon', funds: '1d4 x 5 + 5 gp',
      skills: ['Climb', 'Hide', 'Listen', 'Navigate', 'Spot', 'Stealth', 'Track', 'Melee Weapon', 'Ranged Weapons', 'Ride'] },
    { range: [12, 17], result: 'Laborer', rarity: 'Very Common', archetype: 'Expert/Warrior',
      equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 5 gp',
      skills: ['Climb', 'Craft', 'Drive', 'Brawl', 'Grapple', 'Sense', 'Appraise', 'Fine Manipulation', 'Listen', 'Repair'] },
    { range: [18, 20], result: 'Servant', rarity: 'Very Common', archetype: 'Expert',
      equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 10 gp',
      skills: ['Craft', 'Etiquette', 'Hide', 'Listen', 'Stealth', 'Bargain', 'Drive', 'First Aid', 'Insight', 'Persuade'] },
    { range: [21, 23], result: 'Soldier', rarity: 'Very Common', archetype: 'Warrior',
      equipment: 'Basic clothing, leather armor, medium weapon', funds: '1d4 x 10 + 10 gp',
      skills: ['Brawl', 'Climb', 'Dodge', 'First Aid', 'Command', 'Grapple', 'Hide', 'Listen', 'Melee Weapon', 'Ranged Weapons'] },
    { range: [24, 26], result: 'Warrior', rarity: 'Very Common', archetype: 'Warrior',
      equipment: 'Basic clothing, leather armor, medium weapon', funds: '1d4 x 10 + 10 gp',
      skills: ['Brawl', 'Dodge', 'Grapple', 'Melee Weapon', 'Ranged Weapons', 'Athletics', 'Climb', 'Hide', 'Listen', 'Ride'] },
    { range: [27, 29], result: 'Beggar', rarity: 'Common', archetype: 'Expert',
      equipment: 'Basic clothing (rough), small weapon, 3 contacts', funds: '1d3 x 10 gp',
      skills: ['Bargain', 'Fast Talk', 'Hide', 'Insight', 'Knowledge (Region)', 'Listen', 'Persuade', 'Sleight of Hand', 'Spot', 'Stealth'] },
    { range: [30, 37], result: 'Criminal', rarity: 'Common', archetype: 'Expert',
      equipment: 'Basic clothing, small weapon, 1 contact', funds: '1d4 x 10 + 10 gp',
      skills: ['Bargain', 'Hide', 'Stealth', 'Drive/Ride', 'Appraise', 'Brawl', 'Climb', 'Fast Talk', 'Fine Manipulation', 'Gaming'] },
    { range: [38, 40], result: 'Detective', rarity: 'Common', archetype: 'Expert',
      equipment: 'Basic clothing, small weapon, 2 contacts', funds: '1d4 x 10 + 10 gp',
      skills: ['Knowledge (Law)', 'Listen', 'Persuade', 'Spot', 'Research', 'Art', 'Brawl', 'Disguise', 'Dodge', 'Fast Talk'] },
    { range: [41, 46], result: 'Entertainer', rarity: 'Common', archetype: 'Expert',
      equipment: 'Basic clothing, instrument, 1 contact', funds: '1d4 x 10 + 5 gp',
      skills: ['Acrobatics', 'Art', 'Disguise', 'Fast Talk', 'Fine Manipulation', 'Insight', 'Listen', 'Perform', 'Persuade'] },
    { range: [47, 54], result: 'Explorer', rarity: 'Common', archetype: 'Expert/Warrior',
      equipment: 'Basic clothing, medium weapon, backpack', funds: '1d4 x 10 + 10 gp',
      skills: ['Climb', 'Navigate', 'Persuade', 'Research', 'Spot', 'Knowledge', 'Fast Talk', 'Melee Weapon', 'Pilot', 'Ride'] },
    { range: [55, 60], result: 'Gambler', rarity: 'Common', archetype: 'Expert',
      equipment: 'Basic clothing, small weapon, 1 contact', funds: '12d4 gp',
      skills: ['Bargain', 'Brawl', 'Dodge', 'Fast Talk', 'Gaming', 'Insight', 'Knowledge (Accounting)', 'Persuade', 'Sleight of Hand', 'Spot'] },
    { range: [61, 64], result: 'Lawkeeper', rarity: 'Common', archetype: 'Warrior',
      equipment: 'Basic clothing, medium weapon, 1 contact', funds: '1d4 x 10 + 5 gp',
      skills: ['Brawl', 'Dodge', 'Fast Talk', 'Knowledge (Law)', 'Listen', 'Spot', 'Drive', 'First Aid', 'Grapple', 'Insight'] },
    { range: [65, 65], result: 'Merchant', rarity: 'Common', archetype: 'Expert',
      equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 20 gp',
      skills: ['Appraise', 'Bargain', 'Fast Talk', 'Knowledge (Accounting)', 'Knowledge (Business)', 'Persuade', 'Research', 'Command', 'Listen', 'Sense'] },
    { range: [66, 67], result: 'Politician', rarity: 'Common', archetype: 'Expert',
      equipment: 'Fine clothing, small weapon, 4 contacts', funds: '1d4 x 10 + 10 gp',
      skills: ['Bargain', 'Etiquette', 'Fast Talk', 'Insight', 'Knowledge (Law)', 'Persuade', 'Command', 'Knowledge', 'Listen', 'Perform'] },
    { range: [68, 68], result: 'Priest', rarity: 'Common', archetype: 'Expert/Mage',
      equipment: 'Basic/fine clothing, 2 contacts', funds: '1d4 x 10 + 10 gp',
      skills: ['Fast Talk', 'Insight', 'Knowledge (History)', 'Knowledge (Philosophy)', 'Knowledge (Religion)', 'Perform', 'Persuade', 'Knowledge (Occult)', 'Listen', 'Research'] },
    { range: [69, 69], result: 'Sailor', rarity: 'Common', archetype: 'Expert',
      equipment: 'Basic clothing, light weapon', funds: '1d4 x 10 + 10 gp',
      skills: ['Climb', 'Dodge', 'Grapple', 'Navigate', 'Pilot (Boat)', 'Swim', 'Athletics', 'Acrobatics', 'Command', 'Language'] },
    { range: [70, 70], result: 'Scholar', rarity: 'Common', archetype: 'Expert/Mage',
      equipment: 'Basic clothing, journal, ink and quill, 1 contact', funds: '1d4 x 5 + 10 gp',
      skills: ['Persuade', 'Research', 'Teach', 'Knowledge (5 skills)', 'Craft'] },
    { range: [71, 72], result: 'Thief', rarity: 'Common', archetype: 'Expert',
      equipment: 'Basic clothing, small weapon, 1 contact', funds: '1d4 x 10 + 20 gp',
      skills: ['Appraise', 'Dodge', 'Fast Talk', 'Hide', 'Stealth', 'Bargain', 'Brawl', 'Climb', 'Disguise', 'Fine Manipulation'] },
    { range: [73, 74], result: 'Artist', rarity: 'Rare', archetype: 'Expert',
      equipment: 'Basic clothing, artistic tools, 2 contacts', funds: '1d4 x 10 + 5 gp',
      skills: ['Art (2 skills)', 'Craft', 'Etiquette', 'Insight', 'Knowledge', 'Listen', 'Persuade', 'Research', 'Spot'] },
    { range: [75, 77], result: 'Athlete', rarity: 'Rare', archetype: 'Warrior',
      equipment: 'Basic and fine clothes, 1 contact', funds: '1d4 x 10 + 10 gp',
      skills: ['Climb', 'Dodge', 'Jump', 'Stealth', 'Throw', 'Brawl', 'First Aid', 'Grapple', 'Insight', 'Listen'] },
    { range: [78, 80], result: 'Spy', rarity: 'Rare', archetype: 'Expert/Warrior',
      equipment: 'Basic clothing, small weapon, 1 contact', funds: '1d4 x 10 + 20 gp',
      skills: ['Dodge', 'Fast Talk', 'Hide', 'Listen', 'Research', 'Spot', 'Stealth', 'Brawl', 'Disguise', 'Etiquette'] },
    { range: [81, 84], result: 'Assassin', rarity: 'Very Rare', archetype: 'Expert/Warrior',
      equipment: 'Dark clothing, small weapon, medium weapon', funds: '1d4 x 10 + 10 gp',
      skills: ['Dodge', 'Hide', 'Listen', 'Spot', 'Stealth', 'Brawl', 'Disguise', 'Grapple', 'Fine Manipulation', 'Martial Arts'] },
    { range: [85, 89], result: 'Mage', rarity: 'Very Rare', archetype: 'Mage',
      equipment: 'Basic clothing, journal, ink and quill, small weapon', funds: '1d4 x 10 + 10 gp',
      skills: ['Fine Manipulation', 'Insight', 'Knowledge (Arcane)', 'Persuade', 'Research', 'Sense', 'Spellcraft', 'Appraise', 'Etiquette', 'Listen'] },
    { range: [90, 91], result: 'Monster Hunter', rarity: 'Very Rare', archetype: 'Expert',
      equipment: 'Basic clothing, leather armor, iron manacles, medium weapon', funds: '1d4 x 10 + 10 gp',
      skills: ['Brawl', 'Dodge', 'Grapple', 'Knowledge (Monster Lore)', 'Melee Weapon', 'Ranged Weapons', 'Survival', 'Climb', 'Hide', 'Listen'] },
    { range: [92, 95], result: 'Noble', rarity: 'Very Rare', archetype: 'Expert/Warrior',
      equipment: 'Fancy/fine clothing, small weapon, 2 contacts', funds: '1d4 x 10 + 40 gp',
      skills: ['Bargain', 'Command', 'Drive', 'Etiquette', 'Literacy', 'Strategy', 'Knowledge', 'Art', 'Craft'] },
    { range: [96, 99], result: 'Occultist', rarity: 'Very Rare', archetype: 'Mage',
      equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 20 gp',
      skills: ['Fast Talk', 'Insight', 'Knowledge (Arcane)', 'Knowledge (History)', 'Knowledge (Occult)', 'Research', 'Art', 'Craft', 'Knowledge (Archaeology)', 'Medicine'] },
    { range: [100, 100], result: 'Witch Hunter', rarity: 'Very Rare', archetype: 'Mage/Warrior',
      equipment: 'Basic clothing, leather armor, iron manacles, medium weapon', funds: '1d4 x 10 + 10 gp',
      skills: ['Brawl', 'Dodge', 'Grapple', 'Melee Weapon', 'Ranged Weapons', 'Spellcraft', 'Survival', 'Climb', 'Hide', 'Listen'] }
  ];

  const archetypeTable = [
    { range: [1, 5], result: 'Warrior', rarity: 'Common', 
      description: 'You may not be trained, but you have a strong arm and know how to defend yourself.' },
    { range: [6, 9], result: 'Expert', rarity: 'Common',
      description: 'You may be a craftsperson or a farmer; your abilities lie in skill.' },
    { range: [10, 10], result: 'Mage', rarity: 'Rare',
      description: 'A user of magic, rare and often mistrusted.' }
  ];

  const getTableResult = (table, roll) => {
    return table.find(entry => roll >= entry.range[0] && roll <= entry.range[1]);
  };

  const updateCharacterFromChoice = (choice, step) => {
    setCharacter(prev => {
      const updated = { ...prev };
      
      switch (step) {
        case 'species':
          updated.species = choice.result;
          if (choice.stats) {
            updated.lifespan = choice.stats.lifespan;
            updated.height = choice.stats.height;
            updated.weight = choice.stats.weight;
            updated.speed = choice.stats.speed;
          }
          if (choice.abilities) {
            updated.specialAbilities = [...choice.abilities];
          }
          if (choice.result === 'Elven') {
            updated.specialAbilities = ['Dark Vision 60\'', 'Iron Harm (1d4/hour)', 'Little Food/Water', '4 Hours Sleep'];
            updated.lifespan = 250;
            updated.height = "6' 6\"";
            updated.weight = "195 lb";
            updated.speed = 30;
          }
          break;
        case 'terian':
        case 'fey':
          updated.biology = choice.result;
          if (choice.stats) {
            updated.lifespan = choice.stats.lifespan;
            updated.height = choice.stats.height;
            updated.weight = choice.stats.weight;
            updated.speed = choice.stats.speed;
          }
          if (choice.abilities) {
            updated.specialAbilities = [...choice.abilities];
          }
          break;
        case 'teranCulture':
        case 'dworvenCulture':
        case 'dweranCulture':
        case 'elflingCulture':
        case 'feralElflingCulture':
        case 'faunCulture':
        case 'orogCulture':
        case 'elven':
          updated.culture = choice.result;
          break;
        case 'heritage':
          updated.heritage = choice.result;
          break;
        case 'profession':
          updated.profession = choice.result;
          if (choice.equipment) updated.startingEquipment = choice.equipment.split(', ');
          if (choice.funds) updated.startingFunds = choice.funds;
          break;
        case 'archetype':
          updated.archetype = choice.result;
          break;
      }
      
      return updated;
    });
  };

  const handleChoice = (choice, step, isRoll = false) => {
    updateCharacterFromChoice(choice, step);
    
    let nextStep = '';
    if (choice.nextTable) {
      nextStep = choice.nextTable;
    } else {
      switch (step) {
        case 'species':
          if (choice.result === 'Terian') nextStep = 'terian';
          else if (choice.result === 'Fey') nextStep = 'fey';
          else if (choice.result === 'Elven') nextStep = 'elven';
          break;
        case 'terian':
        case 'fey':
          nextStep = choice.nextTable || 'culture';
          break;
        case 'teranCulture':
        case 'dworvenCulture':
        case 'dweranCulture':
        case 'elflingCulture':
        case 'feralElflingCulture':
        case 'faunCulture':
        case 'orogCulture':
        case 'elven':
          nextStep = 'heritage';
          break;
        case 'heritage':
          nextStep = 'profession';
          break;
        case 'profession':
          nextStep = 'archetype';
          break;
        case 'archetype':
          nextStep = 'characteristics';
          break;
        case 'characteristics':
          nextStep = 'complete';
          break;
      }
    }
    
    setCharacter(prev => ({ ...prev, currentStep: nextStep }));
  };

  const rollForStep = (table, step) => {
    let roll;
    if (step === 'profession') {
      roll = rollDice(100)[0];
    } else if (step === 'teranCulture') {
      roll = rollDice(12)[0];
    } else {
      roll = rollDice(10)[0];
    }
    
    setRollHistory(prev => [...prev, { table: step, roll, timestamp: Date.now() }]);
    const result = getTableResult(table, roll);
    if (result) {
      handleChoice(result, step, true);
    }
  };

  const getCurrentTable = () => {
    switch (character.currentStep) {
      case 'species': return speciesTable;
      case 'terian': return terianBiologyTable;
      case 'fey': return feyBiologyTable;
      case 'teranCulture': return teranCultureTable;
      case 'dworvenCulture': return dworvenCultureTable;
      case 'dweranCulture': return dweranCultureTable;
      case 'elflingCulture': return elflingCultureTable;
      case 'feralElflingCulture': return feralElflingCultureTable;
      case 'faunCulture': return faunCultureTable;
      case 'orogCulture': return orogCultureTable;
      case 'elven': return elvenCultureTable;
      case 'profession': return professionTable;
      case 'archetype': return archetypeTable;
      case 'heritage':
        if (character.species === 'Terian') return terianHeritageTable;
        if (character.species === 'Fey') return feyHeritageTable;
        if (character.species === 'Elven') return elvenHeritageTable;
        break;
      default: return [];
    }
  };

  const getStepTitle = () => {
    switch (character.currentStep) {
      case 'species': return 'Choose Your Species';
      case 'terian': return 'Choose Your Terian Biology';
      case 'fey': return 'Choose Your Fey Biology';
      case 'teranCulture': return 'Choose Your Teran Culture';
      case 'dworvenCulture': return 'Choose Your Dworven Culture';
      case 'dweranCulture': return 'Choose Your Dweran Culture';
      case 'elflingCulture': return 'Choose Your Elfling Culture';
      case 'feralElflingCulture': return 'Choose Your Feral Elfling Culture';
      case 'faunCulture': return 'Choose Your Faun Culture';
      case 'orogCulture': return 'Choose Your Orog Culture';
      case 'elven': return 'Choose Your Elven Culture';
      case 'heritage': return `Choose Your ${character.species} Heritage`;
      case 'profession': return 'Choose Your Profession';
      case 'archetype': return 'Choose Your Archetype';
      case 'characteristics': return 'Generate Characteristics';
      case 'complete': return 'Character Creation Complete';
      default: return 'Character Creation';
    }
  };

  const resetCharacter = () => {
    setCharacter({
      name: '',
      species: null,
      biology: null,
      culture: null,
      heritage: null,
      profession: null,
      archetype: null,
      age: null,
      characteristics: {
        STR: 0, CON: 0, SIZ: 0, INT: 0, ACU: 0, DEX: 0, SOC: 0
      },
      derivedStats: {
        effort: 0, stamina: 0, intellect: 0, spirit: 0, agility: 0, charm: 0,
        hitPoints: 0, spiritPoints: 0, damageModifier: 'None', experienceBonus: 0,
        movementSpeed: 25, horrorResistance: 0
      },
      lifespan: 65,
      height: "5' 8\"",
      weight: "180 lb",
      speed: 30,
      specialAbilities: [],
      startingEquipment: [],
      startingFunds: '',
      currentStep: 'species'
    });
    setRollHistory([]);
  };

  const currentTable = getCurrentTable();

  const PrintableCharacterSheet = () => (
    <div className="fixed inset-0 bg-white z-50 overflow-auto print:relative print:inset-auto print:bg-white">
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { margin: 0; }
          * { -webkit-print-color-adjust: exact; color-adjust: exact; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>

      {/* Header with close button - hidden in print */}
      <div className="no-print bg-gray-100 p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Printable Character Sheet</h2>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => setShowPrintView(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Character Sheet Layout - styled for printing */}
      <div className="p-6 max-w-4xl mx-auto bg-white text-black" style={{fontFamily: 'Arial, sans-serif'}}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">SAGABORN D100 CHARACTER SHEET</h1>
          <div className="border-2 border-black p-2 inline-block">
            <input 
              type="text" 
              value={character.name || ''} 
              onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
              className="text-xl font-bold text-center bg-transparent border-none outline-none"
              style={{minWidth: '300px'}}
              placeholder="CHARACTER NAME"
            />
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Characteristics */}
          <div className="space-y-4">
            <div className="border-2 border-black p-3">
              <h3 className="text-lg font-bold text-center mb-3 bg-gray-200 py-1">CHARACTERISTICS</h3>
              {[
                ['STR', 'EFFORT'],
                ['CON', 'STAMINA'], 
                ['SIZ', 'DMG MOD'],
                ['INT', 'INTELLECT'],
                ['ACU', 'SPIRIT'],
                ['DEX', 'AGILITY'],
                ['SOC', 'CHARM']
              ].map(([stat, roll]) => (
                <div key={stat} className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-bold">{stat}</span>
                  <div className="flex items-center gap-2">
                    <div className="border border-black w-12 h-6 text-center text-xs leading-6">
                      {character.characteristics[stat] || '___'}
                    </div>
                    <span className="text-xs">x5 =</span>
                    <span className="text-xs font-bold">{roll}</span>
                    <div className="border border-black w-12 h-6 text-center text-xs leading-6">
                      {character.characteristics[stat] ? character.characteristics[stat] * 5 : '___'}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Physical Stats */}
            <div className="border-2 border-black p-3">
              <h3 className="text-lg font-bold text-center mb-3 bg-gray-200 py-1">PHYSICAL</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Lifespan:</span>
                  <span>{character.lifespan} years</span>
                </div>
                <div className="flex justify-between">
                  <span>Height:</span>
                  <span>{character.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span>{character.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span>{character.speed}'</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Combat & Health */}
          <div className="space-y-4">
            {/* Hit Points */}
            <div className="border-2 border-black p-3 text-center">
              <h3 className="text-lg font-bold mb-2 bg-gray-200 py-1">HIT POINTS</h3>
              <div className="border border-black w-16 h-16 mx-auto flex items-center justify-center text-xl font-bold">
                {character.derivedStats.hitPoints || '___'}
              </div>
            </div>

            {/* Armor & Damage */}
            <div className="border-2 border-black p-3">
              <h3 className="text-lg font-bold text-center mb-3 bg-gray-200 py-1">ARMOR</h3>
              <div className="text-center">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">SPEED</span>
                  <div className="border border-black w-12 h-6"></div>
                </div>
                <div className="border border-black w-20 h-20 mx-auto flex items-center justify-center text-lg font-bold mb-2">
                  FULL<br/>AV
                </div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="text-xs">ARMOR<br/>VALUE</div>
                    <div className="border border-black w-12 h-8"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs">ARMOR<br/>DAMAGE</div>
                    <div className="border border-black w-12 h-8"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spirit Points */}
            <div className="border-2 border-black p-3">
              <h3 className="text-lg font-bold text-center mb-2 bg-gray-200 py-1">SPIRIT POINTS</h3>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-xs">MAX</div>
                  <div className="border border-black w-12 h-8 text-center leading-8">
                    {character.characteristics.ACU || '___'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs">CURRENT</div>
                  <div className="border border-black w-12 h-8"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Background */}
          <div className="space-y-4">
            <div className="border-2 border-black p-3">
              <h3 className="text-lg font-bold text-center mb-3 bg-gray-200 py-1">BACKGROUND</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Species:</strong> {character.species || '________________'}</div>
                {character.biology && <div><strong>Biology:</strong> {character.biology}</div>}
                <div><strong>Culture:</strong> {character.culture || '________________'}</div>
                <div><strong>Heritage:</strong> {character.heritage || '________________'}</div>
                <div><strong>Profession:</strong> {character.profession || '________________'}</div>
                <div><strong>Archetype:</strong> {character.archetype || '________________'}</div>
              </div>
            </div>

            {/* Special Abilities */}
            {character.specialAbilities.length > 0 && (
              <div className="border-2 border-black p-3">
                <h3 className="text-lg font-bold text-center mb-3 bg-gray-200 py-1">SPECIAL ABILITIES</h3>
                <div className="space-y-1 text-sm">
                  {character.specialAbilities.map((ability, index) => (
                    <div key={index}>• {ability}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {character.startingEquipment.length > 0 && (
              <div className="border-2 border-black p-3">
                <h3 className="text-lg font-bold text-center mb-3 bg-gray-200 py-1">EQUIPMENT</h3>
                <div className="space-y-1 text-sm">
                  {character.startingEquipment.map((item, index) => (
                    <div key={index}>• {item}</div>
                  ))}
                  {character.startingFunds && (
                    <div className="mt-2 pt-2 border-t border-gray-400">
                      <strong>Funds:</strong> {character.startingFunds}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mt-6 border-2 border-black p-3">
          <h3 className="text-lg font-bold text-center mb-3 bg-gray-200 py-1">SKILLS</h3>
          <div className="grid grid-cols-4 gap-4 text-xs">
            {/* Communication Skills */}
            <div>
              <h4 className="font-bold mb-2 underline">COMMUNICATION</h4>
              {['Bargain', 'Command', 'Disguise', 'Etiquette', 'Fast Talk', 'Perform', 'Persuade', 'Teach'].map(skill => (
                <div key={skill} className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>_____%</span>
                </div>
              ))}
            </div>

            {/* Perception Skills */}
            <div>
              <h4 className="font-bold mb-2 underline">PERCEPTION</h4>
              {['Insight', 'Listen', 'Navigate', 'Research', 'Sense', 'Spot', 'Track'].map(skill => (
                <div key={skill} className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>_____%</span>
                </div>
              ))}
            </div>

            {/* Dexterous Skills */}
            <div>
              <h4 className="font-bold mb-2 underline">DEXTEROUS</h4>
              {['Acrobatics', 'Art', 'Craft', 'Fine Manip.', 'Hide', 'Repair', 'Sleight of Hand', 'Stealth'].map(skill => (
                <div key={skill} className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>_____%</span>
                </div>
              ))}
            </div>

            {/* Mental Skills */}
            <div>
              <h4 className="font-bold mb-2 underline">MENTAL</h4>
              {['Appraise', 'First Aid', 'Gaming', 'Knowledge', 'Medicine', 'Strategy', 'Spellcraft', 'Survival'].map(skill => (
                <div key={skill} className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>_____%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Combat Skills */}
        <div className="mt-4 border-2 border-black p-3">
          <h3 className="text-lg font-bold text-center mb-3 bg-gray-200 py-1">COMBAT</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              {['Brawl', 'Bludgeon Wpns', 'Dodge', 'Grapple'].map(skill => (
                <div key={skill} className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>_____%</span>
                </div>
              ))}
            </div>
            <div>
              {['Martial Arts', 'Piercing Wpns', 'Ranged Wpns', 'Shield'].map(skill => (
                <div key={skill} className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>_____%</span>
                </div>
              ))}
            </div>
            <div>
              {['Siege Wpns', 'Slashing Wpns'].map(skill => (
                <div key={skill} className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>_____%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Physical Skills */}
        <div className="mt-4 border-2 border-black p-3">
          <h3 className="text-lg font-bold text-center mb-3 bg-gray-200 py-1">PHYSICAL</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              {['Athletics', 'Climb', 'Jump'].map(skill => (
                <div key={skill} className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>_____%</span>
                </div>
              ))}
            </div>
            <div>
              {['Pilot (Land)', 'Pilot (Sea)', 'Pilot (Air)'].map(skill => (
                <div key={skill} className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>_____%</span>
                </div>
              ))}
            </div>
            <div>
              {['Ride', 'Swim', 'Throw'].map(skill => (
                <div key={skill} className="flex justify-between mb-1">
                  <span>{skill}</span>
                  <span>_____%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs">
          <p>SAGABORN.COM</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {showPrintView && <PrintableCharacterSheet />}
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800 border-2 border-blue-600 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-blue-400">SagaBorn D100 Character Creator</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowPrintView(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Sheet
              </button>
              <button 
                onClick={resetCharacter}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
          
          <div className="text-lg text-blue-300">
            <strong>Step {
              character.currentStep === 'profession' || character.currentStep === 'archetype' ? '2' : 
              character.currentStep === 'characteristics' ? '3' : '1'
            }: {
              character.currentStep === 'profession' || character.currentStep === 'archetype' ? 'Profession & Archetype' : 
              character.currentStep === 'characteristics' ? 'Characteristics' : 'Lifepath'
            }</strong> - {getStepTitle()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lifepath Selection */}
          <div className="lg:col-span-2 bg-slate-800 border-2 border-gray-600 rounded-lg p-6">
            {character.currentStep === 'complete' ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-400 mb-4">Character Creation Complete!</h2>
                <div className="bg-green-900 border border-green-600 rounded-lg p-4 mb-4">
                  <div className="text-left space-y-2 text-green-100">
                    <p><strong>Species:</strong> {character.species}</p>
                    {character.biology && <p><strong>Biology:</strong> {character.biology}</p>}
                    <p><strong>Culture:</strong> {character.culture}</p>
                    <p><strong>Heritage:</strong> {character.heritage}</p>
                    <p><strong>Profession:</strong> {character.profession}</p>
                    <p><strong>Archetype:</strong> {character.archetype}</p>
                  </div>
                </div>
                <p className="text-gray-300">Ready for skills, equipment, and play!</p>
              </div>
            ) : character.currentStep === 'characteristics' ? (
              <div>
                <h2 className="text-xl font-bold text-blue-300 mb-6">Choose Characteristic Generation Method</h2>
                
                {!characteristicMethod ? (
                  <div className="space-y-4">
                    <div
                      onClick={() => setCharacteristicMethod('random')}
                      className="border border-gray-600 rounded-lg p-4 hover:bg-slate-700 cursor-pointer transition-colors bg-gray-800"
                    >
                      <h3 className="font-bold text-blue-300 mb-2">Random Roll Method</h3>
                      <p className="text-gray-300 text-sm mb-2">Roll 3d6 five times and assign results to characteristics. Roll 2d6+6 for INT. Roll species-specific dice for SIZ.</p>
                      <p className="text-yellow-300 text-sm">More unpredictable but exciting!</p>
                    </div>
                    
                    <div
                      onClick={() => setCharacteristicMethod('pointbuy')}
                      className="border border-gray-600 rounded-lg p-4 hover:bg-slate-700 cursor-pointer transition-colors bg-gray-800"
                    >
                      <h3 className="font-bold text-blue-300 mb-2">Point-Buy Method</h3>
                      <p className="text-gray-300 text-sm mb-2">Start with all stats at 10. Spend 24 points to raise characteristics. DEX, INT, and ACU cost more.</p>
                      <p className="text-green-300 text-sm">More control and customization!</p>
                    </div>
                  </div>
                ) : characteristicMethod === 'random' ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-blue-300">Random Roll Results</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Roll all characteristics
                            const newStats = {};
                            const statNames = ['STR', 'CON', 'INT', 'ACU', 'DEX', 'SOC'];
                            
                            statNames.forEach(stat => {
                              if (stat === 'INT') {
                                const rolls = rollDice(6, 2);
                                newStats[stat] = rolls.reduce((a, b) => a + b, 6);
                              } else {
                                const rolls = rollDice(6, 3);
                                newStats[stat] = rolls.reduce((a, b) => a + b, 0);
                              }
                            });
                            
                            newStats.SIZ = rollSIZ();
                            
                            setCharacter(prev => ({
                              ...prev,
                              characteristics: newStats,
                              derivedStats: updateDerivedStats(newStats)
                            }));
                            
                            setRollHistory(prev => [...prev, { table: 'characteristics', roll: 'All stats rolled', timestamp: Date.now() }]);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Dice6 className="w-4 h-4" />
                          Roll All Stats
                        </button>
                        <button
                          onClick={() => setCharacteristicMethod('')}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {['STR', 'CON', 'INT', 'ACU', 'DEX', 'SOC'].map(stat => (
                        <div key={stat} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-blue-300">{stat}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-white">
                                {character.characteristics[stat] || '—'}
                              </span>
                              <button
                                onClick={() => {
                                  let roll;
                                  if (stat === 'INT') {
                                    const rolls = rollDice(6, 2);
                                    roll = rolls.reduce((a, b) => a + b, 6);
                                  } else {
                                    const rolls = rollDice(6, 3);
                                    roll = rolls.reduce((a, b) => a + b, 0);
                                  }
                                  
                                  const newStats = { ...character.characteristics, [stat]: roll };
                                  setCharacter(prev => ({
                                    ...prev,
                                    characteristics: newStats,
                                    derivedStats: updateDerivedStats(newStats)
                                  }));
                                  
                                  setRollHistory(prev => [...prev, { table: stat, roll: roll, timestamp: Date.now() }]);
                                }}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                              >
                                Roll
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {stat === 'INT' ? '2d6+6' : '3d6'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-300">SIZ</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {character.characteristics.SIZ || '—'}
                          </span>
                          <button
                            onClick={() => {
                              const roll = rollSIZ();
                              const newStats = { ...character.characteristics, SIZ: roll };
                              setCharacter(prev => ({
                                ...prev,
                                characteristics: newStats,
                                derivedStats: updateDerivedStats(newStats)
                              }));
                              
                              setRollHistory(prev => [...prev, { table: 'SIZ', roll: roll, timestamp: Date.now() }]);
                            }}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            Roll
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Species-specific dice
                      </div>
                    </div>

                    {character.characteristics.STR > 0 && (
                      <div className="text-center">
                        <button
                          onClick={() => setCharacter(prev => ({ ...prev, currentStep: 'complete' }))}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
                        >
                          Finalize Character
                        </button>
                      </div>
                    )}
                  </div>
                ) : character.currentStep === 'characteristics' ? (
              <div>
                <h2 className="text-xl font-bold text-blue-300 mb-6">Choose Characteristic Generation Method</h2>
                
                {!characteristicMethod ? (
                  <div className="space-y-4">
                    <div
                      onClick={() => setCharacteristicMethod('random')}
                      className="border border-gray-600 rounded-lg p-4 hover:bg-slate-700 cursor-pointer transition-colors bg-gray-800"
                    >
                      <h3 className="font-bold text-blue-300 mb-2">Random Roll Method</h3>
                      <p className="text-gray-300 text-sm mb-2">Roll 3d6 five times and assign results to characteristics. Roll 2d6+6 for INT. Roll species-specific dice for SIZ.</p>
                      <p className="text-yellow-300 text-sm">More unpredictable but exciting!</p>
                    </div>
                    
                    <div
                      onClick={() => setCharacteristicMethod('pointbuy')}
                      className="border border-gray-600 rounded-lg p-4 hover:bg-slate-700 cursor-pointer transition-colors bg-gray-800"
                    >
                      <h3 className="font-bold text-blue-300 mb-2">Point-Buy Method</h3>
                      <p className="text-gray-300 text-sm mb-2">Start with all stats at 10. Spend 24 points to raise characteristics. DEX, INT, and ACU cost more.</p>
                      <p className="text-green-300 text-sm">More control and customization!</p>
                    </div>
                  </div>
                ) : characteristicMethod === 'random' ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-blue-300">Random Roll Results</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Roll all characteristics
                            const newStats = {};
                            const statNames = ['STR', 'CON', 'INT', 'ACU', 'DEX', 'SOC'];
                            
                            statNames.forEach(stat => {
                              if (stat === 'INT') {
                                const rolls = rollDice(6, 2);
                                newStats[stat] = rolls.reduce((a, b) => a + b, 6);
                              } else {
                                const rolls = rollDice(6, 3);
                                newStats[stat] = rolls.reduce((a, b) => a + b, 0);
                              }
                            });
                            
                            newStats.SIZ = rollSIZ();
                            
                            setCharacter(prev => ({
                              ...prev,
                              characteristics: newStats,
                              derivedStats: updateDerivedStats(newStats)
                            }));
                            
                            setRollHistory(prev => [...prev, { table: 'characteristics', roll: 'All stats rolled', timestamp: Date.now() }]);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Dice6 className="w-4 h-4" />
                          Roll All Stats
                        </button>
                        <button
                          onClick={() => setCharacteristicMethod('')}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {['STR', 'CON', 'INT', 'ACU', 'DEX', 'SOC'].map(stat => (
                        <div key={stat} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-blue-300">{stat}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-white">
                                {character.characteristics[stat] || '—'}
                              </span>
                              <button
                                onClick={() => {
                                  let roll;
                                  if (stat === 'INT') {
                                    const rolls = rollDice(6, 2);
                                    roll = rolls.reduce((a, b) => a + b, 6);
                                  } else {
                                    const rolls = rollDice(6, 3);
                                    roll = rolls.reduce((a, b) => a + b, 0);
                                  }
                                  
                                  const newStats = { ...character.characteristics, [stat]: roll };
                                  setCharacter(prev => ({
                                    ...prev,
                                    characteristics: newStats,
                                    derivedStats: updateDerivedStats(newStats)
                                  }));
                                  
                                  setRollHistory(prev => [...prev, { table: stat, roll: roll, timestamp: Date.now() }]);
                                }}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                              >
                                Roll
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {stat === 'INT' ? '2d6+6' : '3d6'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-300">SIZ</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {character.characteristics.SIZ || '—'}
                          </span>
                          <button
                            onClick={() => {
                              const roll = rollSIZ();
                              const newStats = { ...character.characteristics, SIZ: roll };
                              setCharacter(prev => ({
                                ...prev,
                                characteristics: newStats,
                                derivedStats: updateDerivedStats(newStats)
                              }));
                              
                              setRollHistory(prev => [...prev, { table: 'SIZ', roll: roll, timestamp: Date.now() }]);
                            }}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            Roll
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Species-specific dice
                      </div>
                    </div>

                    {character.characteristics.STR > 0 && (
                      <div className="text-center">
                        <button
                          onClick={() => setCharacter(prev => ({ ...prev, currentStep: 'complete' }))}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
                        >
                          Finalize Character
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-blue-300">Point-Buy System</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-white">
                          Points Remaining: <span className={`font-bold ${pointBuyPoints < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {pointBuyPoints}
                          </span>
                        </span>
                        <button
                          onClick={() => setCharacteristicMethod('')}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {['STR', 'CON', 'INT', 'ACU', 'DEX', 'SOC'].map(stat => {
                        const expensive = ['DEX', 'INT', 'ACU'].includes(stat);
                        const nextCost = tempCharacteristics[stat] < 19 ? 
                          Math.abs(calculatePointCost(stat, tempCharacteristics[stat], tempCharacteristics[stat] + 1)) : 
                          0;
                        return (
                          <div key={stat} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-blue-300">{stat}</span>
                              <span className="text-lg font-bold text-white">
                                {tempCharacteristics[stat]}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => {
                                  const newValue = Math.max(3, tempCharacteristics[stat] - 1);
                                  const cost = calculatePointCost(stat, tempCharacteristics[stat], newValue);
                                  const newPoints = pointBuyPoints - cost;
                                  
                                  setTempCharacteristics(prev => ({ ...prev, [stat]: newValue }));
                                  setPointBuyPoints(newPoints);
                                }}
                                disabled={tempCharacteristics[stat] <= 3}
                                className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                −
                              </button>
                              
                              <div className="text-center">
                                <div className="text-xs text-gray-400">
                                  {expensive ? 'Expensive' : 'Standard'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Next: {nextCost}pt
                                </div>
                              </div>
                              
                              <button
                                onClick={() => {
                                  const newValue = Math.min(19, tempCharacteristics[stat] + 1);
                                  const cost = calculatePointCost(stat, tempCharacteristics[stat], newValue);
                                  const newPoints = pointBuyPoints - cost;
                                  
                                  if (newPoints >= 0) {
                                    setTempCharacteristics(prev => ({ ...prev, [stat]: newValue }));
                                    setPointBuyPoints(newPoints);
                                  }
                                }}
                                disabled={tempCharacteristics[stat] >= 19 || 
                                  pointBuyPoints - calculatePointCost(stat, tempCharacteristics[stat], tempCharacteristics[stat] + 1) < 0}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-300">SIZ</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {character.characteristics.SIZ || '—'}
                          </span>
                          <button
                            onClick={() => {
                              const roll = rollSIZ();
                              setCharacter(prev => ({
                                ...prev,
                                characteristics: { ...prev.characteristics, SIZ: roll }
                              }));
                            }}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            Roll
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        SIZ is always rolled, not bought
                      </div>
                    </div>

                    {pointBuyPoints === 0 && character.characteristics.SIZ > 0 && (
                      <div className="text-center">
                        <button
                          onClick={() => {
                            const finalStats = { ...tempCharacteristics, SIZ: character.characteristics.SIZ };
                            setCharacter(prev => ({
                              ...prev,
                              characteristics: finalStats,
                              derivedStats: updateDerivedStats(finalStats),
                              currentStep: 'complete'
                            }));
                          }}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
                        >
                          Finalize Character
                        </button>
                      </div>
                    )}

                    {pointBuyPoints !== 0 && (
                      <div className="text-center text-gray-400 text-sm">
                        {pointBuyPoints > 0 ? 'Spend all points to continue' : 'You have overspent! Reduce some characteristics.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-blue-300">{getStepTitle()}</h2>
                  <button
                    onClick={() => rollForStep(currentTable, character.currentStep)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Dice6 className="w-4 h-4" />
                    Roll 1d{character.currentStep === 'teranCulture' ? '12' : character.currentStep === 'profession' ? '100' : '10'}
                  </button>
                </div>

                <div className="space-y-3">
                  {currentTable.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleChoice(option, character.currentStep)}
                      className="border border-gray-600 rounded-lg p-4 hover:bg-slate-700 cursor-pointer transition-colors bg-gray-800"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-sm font-mono bg-gray-700 text-gray-200 px-2 py-1 rounded">
                              {option.range[0] === option.range[1] ? option.range[0] : `${option.range[0]}-${option.range[1]}`}
                            </span>
                            <h3 className="font-bold text-blue-300">{option.result}</h3>
                            {option.rarity && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                option.rarity === 'Very Common' ? 'bg-green-800 text-green-200' :
                                option.rarity === 'Common' ? 'bg-blue-800 text-blue-200' :
                                option.rarity === 'Rare' ? 'bg-yellow-800 text-yellow-200' :
                                'bg-red-800 text-red-200'
                              }`}>
                                {option.rarity}
                              </span>
                            )}
                            {option.archetype && (
                              <span className="text-xs bg-purple-800 text-purple-200 px-2 py-1 rounded">
                                {option.archetype}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{option.description}</p>
                          {option.equipment && (
                            <div className="text-xs text-gray-400 mb-1">
                              <strong>Equipment:</strong> {option.equipment}
                            </div>
                          )}
                          {option.funds && (
                            <div className="text-xs text-gray-400 mb-1">
                              <strong>Starting Funds:</strong> {option.funds}
                            </div>
                          )}
                          {option.skills && (
                            <div className="text-xs text-gray-400">
                              <strong>Skills:</strong> {option.skills.join(', ')}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-blue-300">Point-Buy System</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-white">
                          Points Remaining: <span className={`font-bold ${pointBuyPoints < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {pointBuyPoints}
                          </span>
                        </span>
                        <button
                          onClick={() => setCharacteristicMethod('')}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {['STR', 'CON', 'INT', 'ACU', 'DEX', 'SOC'].map(stat => {
                        const expensive = ['DEX', 'INT', 'ACU'].includes(stat);
                        return (
                          <div key={stat} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-blue-300">{stat}</span>
                              <span className="text-lg font-bold text-white">
                                {tempCharacteristics[stat]}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => {
                                  const newValue = Math.max(3, tempCharacteristics[stat] - 1);
                                  const cost = calculatePointCost(stat, tempCharacteristics[stat], newValue);
                                  const newPoints = pointBuyPoints - cost;
                                  
                                  setTempCharacteristics(prev => ({ ...prev, [stat]: newValue }));
                                  setPointBuyPoints(newPoints);
                                }}
                                disabled={tempCharacteristics[stat] <= 3}
                                className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                −
                              </button>
                              
                              <div className="text-center">
                                <div className="text-xs text-gray-400">
                                  {expensive ? 'Expensive' : 'Standard'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Cost: {tempCharacteristics[stat] < 19 ? 
                                    Math.abs(calculatePointCost(stat, tempCharacteristics[stat], tempCharacteristics[stat] + 1)) : 
                                    '—'
                                  }
                                </div>
                              </div>
                              
                              <button
                                onClick={() => {
                                  const newValue = Math.min(19, tempCharacteristics[stat] + 1);
                                  const cost = calculatePointCost(stat, tempCharacteristics[stat], newValue);
                                  const newPoints = pointBuyPoints - cost;
                                  
                                  if (newPoints >= 0) {
                                    setTempCharacteristics(prev => ({ ...prev, [stat]: newValue }));
                                    setPointBuyPoints(newPoints);
                                  }
                                }}
                                disabled={tempCharacteristics[stat] >= 19 || 
                                  pointBuyPoints - calculatePointCost(stat, tempCharacteristics[stat], tempCharacteristics[stat] + 1) < 0}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-300">SIZ</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {character.characteristics.SIZ || '—'}
                          </span>
                          <button
                            onClick={() => {
                              const roll = rollSIZ();
                              const newStats = { ...tempCharacteristics, SIZ: roll };
                              setCharacter(prev => ({
                                ...prev,
                                characteristics: newStats,
                                derivedStats: updateDerivedStats(newStats)
                              }));
                            }}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            Roll
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        SIZ is always rolled, not bought
                      </div>
                    </div>

                    {pointBuyPoints === 0 && character.characteristics.SIZ > 0 && (
                      <div className="text-center">
                        <button
                          onClick={() => {
                            setCharacter(prev => ({
                              ...prev,
                              characteristics: { ...tempCharacteristics, SIZ: character.characteristics.SIZ },
                              derivedStats: updateDerivedStats({ ...tempCharacteristics, SIZ: character.characteristics.SIZ }),
                              currentStep: 'complete'
                            }));
                          }}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
                        >
                          Finalize Character
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-blue-300">{getStepTitle()}</h2>
                  <button
                    onClick={() => rollForStep(currentTable, character.currentStep)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Dice6 className="w-4 h-4" />
                    Roll 1d{character.currentStep === 'teranCulture' ? '12' : character.currentStep === 'profession' ? '100' : '10'}
                  </button>
                </div>

                <div className="space-y-3">
                  {currentTable.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleChoice(option, character.currentStep)}
                      className="border border-gray-600 rounded-lg p-4 hover:bg-slate-700 cursor-pointer transition-colors bg-gray-800"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-sm font-mono bg-gray-700 text-gray-200 px-2 py-1 rounded">
                              {option.range[0] === option.range[1] ? option.range[0] : `${option.range[0]}-${option.range[1]}`}
                            </span>
                            <h3 className="font-bold text-blue-300">{option.result}</h3>
                            {option.rarity && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                option.rarity === 'Very Common' ? 'bg-green-800 text-green-200' :
                                option.rarity === 'Common' ? 'bg-blue-800 text-blue-200' :
                                option.rarity === 'Rare' ? 'bg-yellow-800 text-yellow-200' :
                                'bg-red-800 text-red-200'
                              }`}>
                                {option.rarity}
                              </span>
                            )}
                            {option.archetype && (
                              <span className="text-xs bg-purple-800 text-purple-200 px-2 py-1 rounded">
                                {option.archetype}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{option.description}</p>
                          {option.equipment && (
                            <div className="text-xs text-gray-400 mb-1">
                              <strong>Equipment:</strong> {option.equipment}
                            </div>
                          )}
                          {option.funds && (
                            <div className="text-xs text-gray-400 mb-1">
                              <strong>Starting Funds:</strong> {option.funds}
                            </div>
                          )}
                          {option.skills && (
                            <div className="text-xs text-gray-400">
                              <strong>Skills:</strong> {option.skills.join(', ')}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rollHistory.length > 0 && (
              <div className="mt-6 p-4 bg-blue-900 border border-blue-600 rounded-lg">
                <h3 className="font-bold text-blue-300 mb-2">Roll History</h3>
                <div className="text-sm text-blue-200">
                  {rollHistory.slice(-3).map((roll, index) => (
                    <div key={roll.timestamp}>
                      {roll.table}: Rolled {roll.roll}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Character Sheet Preview */}
          <div className="bg-slate-800 border-2 border-gray-600 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-300 mb-4">Character Sheet</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-600 rounded px-3 py-2 text-sm bg-gray-700 text-gray-100"
                  placeholder="Enter character name"
                />
              </div>

              <div className="border-t border-gray-600 pt-4">
                <h3 className="font-bold text-gray-100 mb-2">Background</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <div><strong>Species:</strong> {character.species || '—'}</div>
                  {character.biology && <div><strong>Biology:</strong> {character.biology}</div>}
                  <div><strong>Culture:</strong> {character.culture || '—'}</div>
                  <div><strong>Heritage:</strong> {character.heritage || '—'}</div>
                  <div><strong>Profession:</strong> {character.profession || '—'}</div>
                  <div><strong>Archetype:</strong> {character.archetype || '—'}</div>
                </div>
              </div>

              {character.startingEquipment.length > 0 && (
                <div className="border-t border-gray-600 pt-4">
                  <h3 className="font-bold text-gray-100 mb-2">Starting Equipment</h3>
                  <div className="space-y-1">
                    {character.startingEquipment.map((item, index) => (
                      <div key={index} className="text-sm text-gray-300">• {item}</div>
                    ))}
                  </div>
                  {character.startingFunds && (
                    <div className="text-sm text-gray-300 mt-2">
                      <strong>Starting Funds:</strong> {character.startingFunds}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-gray-600 pt-4">
                <h3 className="font-bold text-gray-100 mb-2">Physical Stats</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <div><strong>Lifespan:</strong> {character.lifespan} years</div>
                  <div><strong>Height:</strong> {character.height}</div>
                  <div><strong>Weight:</strong> {character.weight}</div>
                  <div><strong>Speed:</strong> {character.speed}'</div>
                </div>
              </div>

              {character.specialAbilities.length > 0 && (
                <div className="border-t border-gray-600 pt-4">
                  <h3 className="font-bold text-gray-100 mb-2">Special Abilities</h3>
                  <div className="space-y-1">
                    {character.specialAbilities.map((ability, index) => (
                      <div key={index} className="text-sm bg-blue-900 border border-blue-600 px-2 py-1 rounded text-blue-200">
                        {ability}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-600 pt-4">
                <h3 className="font-bold text-gray-100 mb-2">Characteristics</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  <div><strong>STR:</strong> {character.characteristics.STR || '—'} ({character.derivedStats.effort}%)</div>
                  <div><strong>CON:</strong> {character.characteristics.CON || '—'} ({character.derivedStats.stamina}%)</div>
                  <div><strong>SIZ:</strong> {character.characteristics.SIZ || '—'}</div>
                  <div><strong>INT:</strong> {character.characteristics.INT || '—'} ({character.derivedStats.intellect}%)</div>
                  <div><strong>ACU:</strong> {character.characteristics.ACU || '—'} ({character.derivedStats.spirit}%)</div>
                  <div><strong>DEX:</strong> {character.characteristics.DEX || '—'} ({character.derivedStats.agility}%)</div>
                  <div><strong>SOC:</strong> {character.characteristics.SOC || '—'} ({character.derivedStats.charm}%)</div>
                </div>
              </div>

              {(character.characteristics.STR > 0) && (
                <div className="border-t border-gray-600 pt-4">
                  <h3 className="font-bold text-gray-100 mb-2">Derived Stats</h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div><strong>Hit Points:</strong> {character.derivedStats.hitPoints}</div>
                    <div><strong>Spirit Points:</strong> {character.derivedStats.spiritPoints}</div>
                    <div><strong>Damage Modifier:</strong> {character.derivedStats.damageModifier}</div>
                    <div><strong>Experience Bonus:</strong> {character.derivedStats.experienceBonus}</div>
                    <div><strong>Horror Resistance:</strong> {character.derivedStats.horrorResistance}</div>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4">
                {character.currentStep === 'complete' ? 
                  'Ready for final character creation steps...' : 
                  'Complete the lifepath and profession to continue...'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SagaBornCharacterCreator;