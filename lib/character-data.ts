export interface SpeciesChoice {
  range: [number, number];
  result: string;
  description: string;
  nextTable?: string;
  stats?: {
    lifespan?: number;
    height?: string;
    weight?: string;
    speed?: number;
    equipment?: string;
    funds?: string;
  };
  abilities?: string[];
}

export interface Character {
  name: string;
  species: string | null;
  biology: string | null;
  culture: string | null;
  heritage: string | null;
  profession: string | null;
  archetype: string | null;
  age: number | null;
  characteristics: {
    STR: number;
    CON: number;
    SIZ: number;
    INT: number;
    ACU: number;
    DEX: number;
    SOC: number;
  };
  derivedStats: {
    effort: number;
    stamina: number;
    intellect: number;
    spirit: number;
    agility: number;
    charm: number;
    hitPoints: number;
    spiritPoints: number;
    damageModifier: string;
    experienceBonus: number;
    movementSpeed: number;
    horrorResistance: number;
  };
  skills: Record<string, number>;
  lifespan: number;
  height: string;
  weight: string;
  speed: number;
  specialAbilities: string[];
  startingEquipment: string[];
  startingFunds: string;
  startingFundsAmount: number;
  currentStep: string;
}

export const speciesTable: SpeciesChoice[] = [
  { range: [1, 6], result: 'Terian', description: 'Species born and evolved in Atheles', nextTable: 'terian' },
  { range: [7, 9], result: 'Fey', description: 'Species originating from other worlds', nextTable: 'fey' },
  { range: [10, 10], result: 'Elven', description: 'A specific species originating from another place', nextTable: 'elven' }
];

export const terianBiologyTable: SpeciesChoice[] = [
  { 
    range: [1, 7], 
    result: 'Teran', 
    description: 'The most common biology in Atheles. Terans thrive in almost all environments, but have no special abilities or genetics beyond that.', 
    nextTable: 'teranCulture',
    stats: { lifespan: 65, height: "5' 8\"", weight: "180 lb", speed: 30 }
  },
  { 
    range: [8, 9], 
    result: 'Dworven', 
    description: 'The oldest people of Atheles, recently awakened from millennia of sleep.', 
    nextTable: 'dworvenCulture',
    stats: { lifespan: 150, height: "4' 5\"", weight: "195 lb", speed: 20 }, 
    abilities: ['Dark Vision 60\''] 
  },
  { 
    range: [10, 10], 
    result: 'Dweran', 
    description: 'A person of both Teran and Dworven descent.', 
    nextTable: 'dweranCulture',
    stats: { lifespan: 85, height: "5' 2\"", weight: "185 lb", speed: 25 },
    abilities: ['Dark Vision 30\'']
  }
];

export const feyBiologyTable: SpeciesChoice[] = [
  { 
    range: [1, 6], 
    result: 'Elfling', 
    description: 'Small fey folk on their Calling. Harmed by Cold Iron, while steel causes discomfort.', 
    nextTable: 'elflingCulture',
    stats: { lifespan: 130, height: "3'", weight: "65 lb", speed: 20 }, 
    abilities: ['Dark Vision 60\'', 'Iron Discomfort'] 
  },
  { 
    range: [7, 8], 
    result: 'Feral Elfling', 
    description: 'Caught between worlds during the Disappearance. Harmed by Cold Iron, while steel causes discomfort.', 
    nextTable: 'feralElflingCulture',
    stats: { lifespan: 90, height: "3'", weight: "65 lb", speed: 20 }, 
    abilities: ['Dark Vision 60\'', 'Iron Harm (1d4/hour)'] 
  },
  { 
    range: [9, 9], 
    result: 'Faun', 
    description: 'Reclusive forest dwellers. Harmed by Cold Iron, while steel causes discomfort.', 
    nextTable: 'faunCulture',
    stats: { lifespan: 100, height: "5' 5\"", weight: "160 lb", speed: 30 }, 
    abilities: ['Dark Vision 60\'', 'Animal Friend'] 
  },
  { 
    range: [10, 10], 
    result: 'Orog', 
    description: 'Slower in cold weather (below 40°F), halving movement. +1 AV due to shell and thick skin. Almost always Large size.', 
    nextTable: 'orogCulture',
    stats: { lifespan: 150, height: "7' 2\"", weight: "350 lb", speed: 30 }, 
    abilities: ['Dark Vision 60\'', '+1 Natural Armor', 'Cold Sensitivity'] 
  }
];

export const elvenCultureTable: SpeciesChoice[] = [
  { 
    range: [1, 2], 
    result: 'Losvari', 
    description: 'The lost elves who fought in the Great War.',
    stats: { lifespan: 250, height: "6'", weight: "150 lb", speed: 30 },
    abilities: ['Dark Vision 60\'', 'Iron Harm', 'Reduced Sleep (4 hours)']
  },
  { 
    range: [3, 4], 
    result: 'Anavari', 
    description: 'The wilde elves of the bushlands.',
    stats: { lifespan: 250, height: "6'", weight: "150 lb", speed: 30 },
    abilities: ['Dark Vision 60\'', 'Iron Harm', 'Reduced Sleep (4 hours)']
  },
  { 
    range: [5, 6], 
    result: 'Kaelvari', 
    description: 'The western wood elves.',
    stats: { lifespan: 250, height: "6'", weight: "150 lb", speed: 30 },
    abilities: ['Dark Vision 60\'', 'Iron Harm', 'Reduced Sleep (4 hours)']
  },
  { 
    range: [7, 8], 
    result: 'Alostrovari', 
    description: 'The sea elves.',
    stats: { lifespan: 250, height: "6'", weight: "150 lb", speed: 30 },
    abilities: ['Dark Vision 60\'', 'Iron Harm', 'Reduced Sleep (4 hours)']
  },
  { 
    range: [9, 10], 
    result: 'Evantari', 
    description: 'The high elves who believe themselves superior.',
    stats: { lifespan: 250, height: "6'", weight: "150 lb", speed: 30 },
    abilities: ['Dark Vision 60\'', 'Iron Harm', 'Reduced Sleep (4 hours)']
  }
];

// Skill Categories and Base Chances
export const skillCategories = {
  communication: {
    characteristic: 'SOC',
    skills: ['Bargain', 'Command', 'Disguise', 'Etiquette', 'Fast Talk', 'Perform', 'Persuade', 'Teach']
  },
  perception: {
    characteristic: 'ACU', 
    skills: ['Insight', 'Listen', 'Navigate', 'Research', 'Sense', 'Spot', 'Track']
  },
  dexterous: {
    characteristic: 'DEX',
    skills: ['Acrobatics', 'Art', 'Craft', 'Fine Manipulation', 'Hide', 'Repair', 'Sleight of Hand', 'Stealth']
  },
  mental: {
    characteristic: 'INT',
    skills: ['Appraise', 'First Aid', 'Gaming', 'Knowledge', 'Language', 'Medicine', 'Strategy', 'Spellcraft', 'Survival']
  },
  physical: {
    characteristic: 'STR',
    skills: ['Athletics', 'Climb', 'Drive', 'Jump', 'Pilot (Land)', 'Pilot (Sea)', 'Pilot (Air)', 'Ride', 'Swim', 'Throw']
  },
  combat: {
    characteristic: 'DEX',
    skills: ['Brawl', 'Bludgeon Weapons', 'Dodge', 'Grapple', 'Martial Arts', 'Piercing Weapons', 'Ranged Weapons', 'Shield', 'Siege Weapons', 'Slashing Weapons']
  }
};

export const skillBaseChances: Record<string, number> = {
  'Bargain': 5, 'Command': 5, 'Disguise': 1, 'Etiquette': 5, 'Fast Talk': 5, 'Perform': 5, 'Persuade': 15, 'Teach': 10,
  'Insight': 5, 'Listen': 25, 'Navigate': 10, 'Research': 25, 'Sense': 10, 'Spot': 25, 'Track': 10,
  'Acrobatics': 0, 'Art': 5, 'Craft': 5, 'Fine Manipulation': 5, 'Hide': 10, 'Repair': 15, 'Sleight of Hand': 5, 'Stealth': 10,
  'Appraise': 15, 'First Aid': 30, 'Gaming': 15, 'Knowledge': 5, 'Language': 0, 'Medicine': 5, 'Strategy': 1, 'Spellcraft': 0, 'Survival': 15,
  'Athletics': 15, 'Climb': 40, 'Drive': 20, 'Jump': 25, 'Pilot (Land)': 5, 'Pilot (Sea)': 5, 'Pilot (Air)': 1, 'Ride': 5, 'Swim': 25, 'Throw': 25,
  'Brawl': 25, 'Bludgeon Weapons': 20, 'Dodge': 0, 'Grapple': 25, 'Martial Arts': 1, 'Piercing Weapons': 20, 'Ranged Weapons': 25, 'Shield': 15, 'Siege Weapons': 10, 'Slashing Weapons': 15
};

export const createNewCharacter = (): Character => ({
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
  skills: {},
  lifespan: 0,
  height: "",
  weight: "",
  speed: 0,
  specialAbilities: [],
  startingEquipment: [],
  startingFunds: '',
  startingFundsAmount: 0,
  currentStep: 'species'
});

export const rollDice = (sides: number, count: number = 1): number[] => {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
};

export const professionSkills: Record<string, string[]> = {
  'Artist': ['Art', 'Craft', 'Evaluate', 'History', 'Influence', 'Insight', 'Language', 'Literacy', 'Lore', 'Perform'],
  'Assassin': ['Athletics', 'Conceal', 'Deceit', 'Disguise', 'Endurance', 'Evade', 'Insight', 'Perception', 'Stealth', 'Track'],
  'Bandit': ['Athletics', 'Conceal', 'Deceit', 'Endurance', 'Evade', 'Insight', 'Intimidate', 'Perception', 'Ride', 'Stealth'],
  'Beggar': ['Craft', 'Deceit', 'Disguise', 'Evade', 'Insight', 'Intimidate', 'Perception', 'Sleight of Hand', 'Stealth', 'Streetwise'],
  'Bureaucrat': ['Bureaucracy', 'Culture', 'Evaluate', 'Influence', 'Insight', 'Language', 'Literacy', 'Lore', 'Oratory', 'Streetwise'],
  'Charlatan': ['Art', 'Deceit', 'Disguise', 'Fast Talk', 'Influence', 'Insight', 'Perform', 'Sleight of Hand', 'Streetwise', 'Trade'],
  'Courtesan': ['Art', 'Culture', 'Dance', 'Deceit', 'Disguise', 'Influence', 'Insight', 'Language', 'Perform', 'Seduction'],
  'Craftsman': ['Art', 'Craft', 'Drive', 'Evaluate', 'Influence', 'Insight', 'Language', 'Literacy', 'Trade', 'Weaponcraft'],
  'Criminal': ['Athletics', 'Conceal', 'Deceit', 'Disguise', 'Evade', 'Insight', 'Perception', 'Sleight of Hand', 'Stealth', 'Streetwise'],
  'Entertainer': ['Art', 'Dance', 'Fast Talk', 'Influence', 'Insight', 'Language', 'Perform', 'Persuade', 'Sing', 'Streetwise'],
  'Farmer': ['Animal Handling', 'Athletics', 'Craft', 'Drive', 'Endurance', 'First Aid', 'Natural World', 'Plant Lore', 'Repair', 'Weather Watching'],
  'Gambler': ['Deceit', 'Evaluate', 'Fast Talk', 'Gaming', 'Influence', 'Insight', 'Mathematics', 'Perception', 'Sleight of Hand', 'Streetwise'],
  'Herder': ['Animal Handling', 'Athletics', 'Endurance', 'First Aid', 'Natural World', 'Perception', 'Ride', 'Survival', 'Track', 'Weather Watching'],
  'Hunter': ['Animal Handling', 'Athletics', 'Conceal', 'Endurance', 'Natural World', 'Perception', 'Stealth', 'Survival', 'Track', 'Weather Watching'],
  'Laborer': ['Athletics', 'Craft', 'Drive', 'Endurance', 'First Aid', 'Intimidate', 'Repair', 'Streetwise', 'Trade', 'Unarmed Combat'],
  'Merchant': ['Culture', 'Evaluate', 'Fast Talk', 'Influence', 'Insight', 'Language', 'Literacy', 'Mathematics', 'Persuade', 'Trade'],
  'Noble': ['Culture', 'Dance', 'Etiquette', 'Fast Talk', 'Influence', 'Insight', 'Language', 'Literacy', 'Oratory', 'Ride'],
  'Official': ['Bureaucracy', 'Culture', 'Etiquette', 'Influence', 'Insight', 'Language', 'Literacy', 'Lore', 'Oratory', 'Persuade'],
  'Physician': ['Culture', 'First Aid', 'Healing', 'Insight', 'Language', 'Literacy', 'Lore', 'Perception', 'Physician', 'Research'],
  'Priest': ['Culture', 'Fast Talk', 'Influence', 'Insight', 'Language', 'Literacy', 'Lore', 'Oratory', 'Persuade', 'Religion'],
  'Sailor': ['Athletics', 'Boating', 'Climb', 'Craft', 'Navigate', 'Perception', 'Seamanship', 'Survival', 'Swimming', 'Weather Watching'],
  'Scholar': ['Evaluate', 'Language', 'Library Use', 'Literacy', 'Lore', 'Mathematics', 'Oratory', 'Research', 'Teaching', 'Writing'],
  'Scout': ['Athletics', 'Conceal', 'Endurance', 'Navigate', 'Natural World', 'Perception', 'Stealth', 'Survival', 'Track', 'Weather Watching'],
  'Scribe': ['Art', 'Craft', 'Evaluate', 'Language', 'Library Use', 'Literacy', 'Lore', 'Mathematics', 'Research', 'Writing'],
  'Shaman': ['Animal Handling', 'First Aid', 'Healing', 'Insight', 'Lore', 'Natural World', 'Oratory', 'Plant Lore', 'Religion', 'Spirit Lore'],
  'Soldier': ['Athletics', 'Climb', 'Endurance', 'First Aid', 'Formation Fighting', 'Perception', 'Repair', 'Shield Use', 'Survival', 'Unarmed Combat'],
  'Spy': ['Conceal', 'Deceit', 'Disguise', 'Evade', 'Fast Talk', 'Influence', 'Insight', 'Language', 'Perception', 'Stealth'],
  'Thief': ['Athletics', 'Climb', 'Conceal', 'Evade', 'Lockpicking', 'Perception', 'Security Systems', 'Sleight of Hand', 'Stealth', 'Streetwise'],
  'Trader': ['Animal Handling', 'Culture', 'Drive', 'Evaluate', 'Fast Talk', 'Influence', 'Language', 'Navigate', 'Survival', 'Trade'],
  'Warrior': ['Athletics', 'Climb', 'Endurance', 'Intimidate', 'Perception', 'Repair', 'Survival', 'Throw', 'Unarmed Combat', 'Weapon Skill'],
  'Witch': ['Art', 'Craft', 'First Aid', 'Healing', 'Insight', 'Lore', 'Natural World', 'Perception', 'Plant Lore', 'Spirit Lore'],
  'Woodsman': ['Animal Handling', 'Athletics', 'Climb', 'Conceal', 'Endurance', 'Natural World', 'Stealth', 'Survival', 'Track', 'Weather Watching']
};

// Complete Profession Table (d100)
export const professionTable: SpeciesChoice[] = [
  { range: [1, 3], result: 'Artist', description: 'Making art through drawing, painting, sculpture, or other creative expression.',
    stats: { equipment: 'Basic clothing, artistic tools, 2 contacts', funds: '1d4 x 10 + 5 gp' },
    abilities: ['Art (2 skills)', 'Craft', 'Etiquette', 'Insight', 'Knowledge', 'Listen', 'Persuade', 'Research', 'Spot'] },
  { range: [4, 6], result: 'Assassin', description: 'Professional killer skilled in the termination of other living beings in secrecy.',
    stats: { equipment: 'Dark clothing, small weapon, medium weapon', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Dodge', 'Hide', 'Listen', 'Spot', 'Stealth', 'Brawl', 'Disguise', 'Grapple', 'Fine Manipulation', 'Martial Arts'] },
  { range: [7, 9], result: 'Athlete', description: 'Professional sports background, often sponsored by royalty or merchants.',
    stats: { equipment: 'Basic and fine clothes, 1 contact', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Climb', 'Dodge', 'Jump', 'Stealth', 'Throw', 'Brawl', 'First Aid', 'Grapple', 'Insight', 'Listen'] },
  { range: [10, 12], result: 'Beggar', description: 'Surviving by begging for money, food, and necessities.',
    stats: { equipment: 'Basic clothing (rough), small weapon, 3 contacts', funds: '1d3 x 10 gp' },
    abilities: ['Bargain', 'Fast Talk', 'Hide', 'Insight', 'Knowledge (Region)', 'Listen', 'Persuade', 'Sleight of Hand', 'Spot', 'Stealth'] },
  { range: [13, 16], result: 'Crafter', description: 'Making trade goods by hand - blacksmith, glassblower, or fine craftsperson.',
    stats: { equipment: 'Basic clothing, tools of the trade', funds: '1d4 x 10 + 20 gp' },
    abilities: ['Appraise', 'Art', 'Bargain', 'Craft (2 skills)', 'Spot', 'Research', 'Fine Manipulation', 'Repair'] },
  { range: [17, 22], result: 'Criminal', description: 'Making a living by breaking the law through theft, organized crime, or other illegal means.',
    stats: { equipment: 'Basic clothing, small weapon, 1 contact', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Bargain', 'Hide', 'Stealth', 'Drive/Ride', 'Appraise', 'Brawl', 'Climb', 'Fast Talk', 'Fine Manipulation', 'Gaming'] },
  { range: [23, 25], result: 'Detective', description: 'Using observation, deduction, and criminology to investigate occurrences.',
    stats: { equipment: 'Basic clothing, small weapon, 2 contacts', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Knowledge (Law)', 'Listen', 'Persuade', 'Spot', 'Research', 'Art', 'Brawl', 'Disguise', 'Dodge', 'Fast Talk'] },
  { range: [26, 30], result: 'Entertainer', description: 'Using performing talent to entertain audiences through improvisation or scripted performances.',
    stats: { equipment: 'Basic clothing, instrument, 1 contact', funds: '1d4 x 10 + 5 gp' },
    abilities: ['Acrobatics', 'Art', 'Disguise', 'Fast Talk', 'Fine Manipulation', 'Insight', 'Listen', 'Perform', 'Persuade'] },
  { range: [31, 35], result: 'Explorer', description: 'Seeking unknown corners of the world and bringing back knowledge of discoveries.',
    stats: { equipment: 'Basic clothing, medium weapon, backpack', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Climb', 'Navigate', 'Persuade', 'Research', 'Spot', 'Knowledge', 'Fast Talk', 'Melee Weapon', 'Pilot', 'Ride'] },
  { range: [36, 40], result: 'Farmer', description: 'Rural life coaxing a living from the land through crops or animal herds.',
    stats: { equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 5 gp' },
    abilities: ['Bargain', 'Craft', 'Knowledge (Natural History)', 'Listen', 'Spot', 'Brawl', 'Drive', 'First Aid'] },
  { range: [41, 45], result: 'Gambler', description: 'Surviving by chance or cheating fate in games of luck and skill.',
    stats: { equipment: 'Basic clothing, small weapon, 1 contact', funds: '12d4 gp' },
    abilities: ['Bargain', 'Brawl', 'Dodge', 'Fast Talk', 'Gaming', 'Insight', 'Knowledge (Accounting)', 'Persuade', 'Sleight of Hand', 'Spot'] },
  { range: [46, 49], result: 'Herder', description: 'Tending herd animals, riding the open range and bringing them to market.',
    stats: { equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 5 gp' },
    abilities: ['Craft', 'Knowledge (Natural History)', 'Knowledge (Region)', 'Listen', 'Navigate', 'Ride', 'Spot', 'Survival', 'Throw', 'Track'] },
  { range: [50, 54], result: 'Hunter', description: 'Specializing in tracking and hunting wild animals or other beings.',
    stats: { equipment: 'Basic clothing, short bow, small weapon', funds: '1d4 x 5 + 5 gp' },
    abilities: ['Climb', 'Hide', 'Listen', 'Navigate', 'Spot', 'Stealth', 'Track', 'Melee Weapon', 'Ranged Weapons', 'Ride'] },
  { range: [55, 59], result: 'Laborer', description: 'Manual worker in shops, warehouses, or heavy labor jobs.',
    stats: { equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 5 gp' },
    abilities: ['Climb', 'Craft', 'Drive', 'Brawl', 'Grapple', 'Sense', 'Appraise', 'Fine Manipulation', 'Listen', 'Repair'] },
  { range: [60, 63], result: 'Lawkeeper', description: 'Authority to uphold and defend the law in defense of common folk.',
    stats: { equipment: 'Basic clothing, medium weapon, 1 contact', funds: '1d4 x 10 + 5 gp' },
    abilities: ['Brawl', 'Dodge', 'Fast Talk', 'Knowledge (Law)', 'Listen', 'Spot', 'Drive', 'First Aid', 'Grapple', 'Insight'] },
  { range: [64, 67], result: 'Mage', description: 'Training in the ways of magic, understanding mechanics, history, and lore.',
    stats: { equipment: 'Basic clothing, journal, ink and quill, small weapon', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Fine Manipulation', 'Insight', 'Knowledge (Arcane)', 'Persuade', 'Research', 'Sense', 'Spellcraft', 'Appraise', 'Etiquette', 'Listen'] },
  { range: [68, 70], result: 'Merchant', description: 'Making a living in trade, purchasing for less and selling for more.',
    stats: { equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 20 gp' },
    abilities: ['Appraise', 'Bargain', 'Fast Talk', 'Knowledge (Accounting)', 'Knowledge (Business)', 'Persuade', 'Research', 'Command', 'Listen', 'Sense'] },
  { range: [71, 73], result: 'Monster Hunter', description: 'Determined to stop creatures that harm those in Atheles since the Return.',
    stats: { equipment: 'Basic clothing, leather armor, iron manacles, medium weapon', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Brawl', 'Dodge', 'Grapple', 'Knowledge (Monster Lore)', 'Melee Weapon', 'Ranged Weapons', 'Survival', 'Climb', 'Hide', 'Listen'] },
  { range: [74, 76], result: 'Mystic', description: 'Focusing on the spiritual side of the world through study and mystical research.',
    stats: { equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 20 gp' },
    abilities: ['Insight', 'Knowledge (Arcane)', 'Persuade', 'Research', 'Sense', 'Survival', 'Spellcraft', 'Appraise', 'First Aid', 'Listen'] },
  { range: [77, 79], result: 'Noble', description: 'Born into wealth and ruling class, accustomed to elegant lifestyle.',
    stats: { equipment: 'Fine clothing, small weapon, 2 contacts', funds: '1d4 x 10 + 40 gp' },
    abilities: ['Bargain', 'Command', 'Drive', 'Etiquette', 'Literacy', 'Strategy', 'Knowledge', 'Art', 'Craft'] },
  { range: [80, 82], result: 'Occultist', description: 'Student of obscure secrets, hidden lore, and magical power.',
    stats: { equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 20 gp' },
    abilities: ['Fast Talk', 'Insight', 'Knowledge (Arcane)', 'Knowledge (History)', 'Knowledge (Occult)', 'Research', 'Art', 'Craft', 'Knowledge (Archaeology)', 'Medicine'] },
  { range: [83, 85], result: 'Politician', description: 'Elected or appointed to authority position directing government activities.',
    stats: { equipment: 'Fine clothing, small weapon, 4 contacts', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Bargain', 'Etiquette', 'Fast Talk', 'Insight', 'Knowledge (Law)', 'Persuade', 'Command', 'Knowledge', 'Listen', 'Perform'] },
  { range: [86, 88], result: 'Priest', description: 'Faith and belief in the divine leading to priesthood calling.',
    stats: { equipment: 'Basic/fine clothing, 2 contacts', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Fast Talk', 'Insight', 'Knowledge (History)', 'Knowledge (Philosophy)', 'Knowledge (Religion)', 'Perform', 'Persuade', 'Knowledge (Occult)', 'Listen', 'Research'] },
  { range: [89, 90], result: 'Sailor', description: 'Plying ocean waves, maintaining vessel integrity as pirate, naval officer, or trader.',
    stats: { equipment: 'Basic clothing, light weapon', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Climb', 'Dodge', 'Grapple', 'Navigate', 'Pilot (Boat)', 'Swim', 'Athletics', 'Acrobatics', 'Command', 'Language'] },
  { range: [91, 92], result: 'Scholar', description: 'Study and learning define life, specializing in fields of knowledge.',
    stats: { equipment: 'Basic clothing, journal, ink and quill, 1 contact', funds: '1d4 x 5 + 10 gp' },
    abilities: ['Persuade', 'Research', 'Teach', 'Knowledge (5 skills)', 'Craft'] },
  { range: [93, 94], result: 'Servant', description: 'Employed helper tending to household affairs and domestic needs.',
    stats: { equipment: 'Basic clothing, small weapon', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Craft', 'Etiquette', 'Hide', 'Listen', 'Stealth', 'Bargain', 'Drive', 'First Aid', 'Insight', 'Persuade'] },
  { range: [95, 96], result: 'Soldier', description: 'Professional soldier through enlistment or conscription for country defense.',
    stats: { equipment: 'Basic clothing, leather armor, medium weapon', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Brawl', 'Climb', 'Dodge', 'First Aid', 'Command', 'Grapple', 'Hide', 'Listen', 'Melee Weapon', 'Ranged Weapons'] },
  { range: [97, 97], result: 'Spy', description: 'Skilled in subterfuge and infiltration, finding secrets for interested parties.',
    stats: { equipment: 'Basic clothing, small weapon, 1 contact', funds: '1d4 x 10 + 20 gp' },
    abilities: ['Dodge', 'Fast Talk', 'Hide', 'Listen', 'Research', 'Spot', 'Stealth', 'Brawl', 'Disguise', 'Etiquette'] },
  { range: [98, 98], result: 'Thief', description: 'Taking what you want through pickpocketing, burglary, or glamorous theft.',
    stats: { equipment: 'Basic clothing, small weapon, 1 contact', funds: '1d4 x 10 + 20 gp' },
    abilities: ['Appraise', 'Dodge', 'Fast Talk', 'Hide', 'Stealth', 'Bargain', 'Brawl', 'Climb', 'Disguise', 'Fine Manipulation'] },
  { range: [99, 99], result: 'Warrior', description: 'Specializing in individual combat, surviving by reflexes and weapon skills.',
    stats: { equipment: 'Basic clothing, leather armor, medium weapon', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Brawl', 'Dodge', 'Grapple', 'Melee Weapon', 'Ranged Weapons', 'Athletics', 'Climb', 'Hide', 'Listen', 'Ride'] },
  { range: [100, 100], result: 'Witchhunter', description: 'Training in hunting mages, heretics, and necromancers.',
    stats: { equipment: 'Basic clothing, leather armor, iron manacles, medium weapon', funds: '1d4 x 10 + 10 gp' },
    abilities: ['Brawl', 'Dodge', 'Grapple', 'Melee Weapon', 'Ranged Weapons', 'Spellcraft', 'Survival', 'Climb', 'Hide', 'Listen'] }
];

// Archetype Table
export const archetypeTable: SpeciesChoice[] = [
  { range: [1, 5], result: 'Warrior', description: 'Common - You may not be trained, but you have a strong arm and know how to defend yourself.' },
  { range: [6, 9], result: 'Expert', description: 'Common - You may be a craftsperson or a farmer; your abilities lie in skill.' },
  { range: [10, 10], result: 'Mage', description: 'Rare - A user of magic, rare and often mistrusted.' }
];

// Culture Tables for different biology types
export const teranCultureTable: SpeciesChoice[] = [
  { range: [1, 10], result: 'Common Teran Culture', description: 'Standard Teran cultural background' }
];

export const dworvenCultureTable: SpeciesChoice[] = [
  { range: [1, 10], result: 'Traditional Dworven Culture', description: 'Ancient Dworven ways and customs' }
];

export const dweranCultureTable: SpeciesChoice[] = [
  { range: [1, 10], result: 'Mixed Heritage Culture', description: 'Blend of Teran and Dworven traditions' }
];

export const elflingCultureTable: SpeciesChoice[] = [
  { range: [1, 10], result: 'Calling Elfling Culture', description: 'Traditional Elfling customs and the Calling' }
];

export const feralElflingCultureTable: SpeciesChoice[] = [
  { range: [1, 10], result: 'Feral Elfling Culture', description: 'Adapted culture from the Disappearance' }
];

export const faunCultureTable: SpeciesChoice[] = [
  { range: [1, 10], result: 'Forest Faun Culture', description: 'Deep forest traditions and nature worship' }
];

export const orogCultureTable: SpeciesChoice[] = [
  { range: [1, 10], result: 'Shell-Bearer Culture', description: 'Ancient Orog traditions and shell-craft' }
];

export const getTableForStep = (step: string) => {
  switch (step) {
    case 'species':
      return speciesTable;
    case 'terian':
      return terianBiologyTable;
    case 'fey':
      return feyBiologyTable;
    case 'elven':
      return elvenCultureTable;
    case 'teranCulture':
      return teranCultureTable;
    case 'dworvenCulture':
      return dworvenCultureTable;
    case 'dweranCulture':
      return dweranCultureTable;
    case 'elflingCulture':
      return elflingCultureTable;
    case 'feralElflingCulture':
      return feralElflingCultureTable;
    case 'faunCulture':
      return faunCultureTable;
    case 'orogCulture':
      return orogCultureTable;
    case 'profession':
      return professionTable;
    case 'archetype':
      return archetypeTable;
    default:
      return [];
  }
};