export interface SpeciesChoice {
  range: [number, number];
  result: string;
  description: string;
  nextTable?: string;
  stats?: {
    lifespan: number;
    height: string;
    weight: string;
    speed: number;
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
  lifespan: number;
  height: string;
  weight: string;
  speed: number;
  specialAbilities: string[];
  startingEquipment: string[];
  startingFunds: string;
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
    description: 'The most common biology in Atheles', 
    nextTable: 'teranCulture',
    stats: { lifespan: 65, height: "5' 8\"", weight: "180 lb", speed: 30 }
  },
  { 
    range: [8, 9], 
    result: 'Dworven', 
    description: 'The oldest people of Atheles', 
    nextTable: 'dworvenCulture',
    stats: { lifespan: 150, height: "4' 5\"", weight: "195 lb", speed: 20 }, 
    abilities: ['Dark Vision 60\''] 
  },
  { 
    range: [10, 10], 
    result: 'Dweran', 
    description: 'A person of both Teran and Dworven descent', 
    nextTable: 'dweranCulture',
    stats: { lifespan: 90, height: "5' 2\"", weight: "185 lb", speed: 25 }
  }
];

export const feyBiologyTable: SpeciesChoice[] = [
  { 
    range: [1, 6], 
    result: 'Elfling', 
    description: 'Small fey folk on their Calling', 
    nextTable: 'elflingCulture',
    stats: { lifespan: 130, height: "3'", weight: "65 lb", speed: 20 }, 
    abilities: ['Dark Vision 60\'', 'Iron Discomfort'] 
  },
  { 
    range: [7, 8], 
    result: 'Feral Elfling', 
    description: 'Caught between worlds during Disappearance', 
    nextTable: 'feralElflingCulture',
    stats: { lifespan: 90, height: "3'", weight: "65 lb", speed: 20 }, 
    abilities: ['Dark Vision 60\'', 'Iron Harm (1d4/hour)'] 
  },
  { 
    range: [9, 9], 
    result: 'Faun', 
    description: 'Reclusive forest dwellers', 
    nextTable: 'faunCulture',
    stats: { lifespan: 120, height: "5' 5\"", weight: "160 lb", speed: 30 }, 
    abilities: ['Dark Vision 60\'', 'Animal Friend'] 
  },
  { 
    range: [10, 10], 
    result: 'Orog', 
    description: 'Powerful warriors from the Wastes', 
    nextTable: 'orogCulture',
    stats: { lifespan: 40, height: "7' 2\"", weight: "350 lb", speed: 30 }, 
    abilities: ['Dark Vision 60\''] 
  }
];

export const elvenCultureTable: SpeciesChoice[] = [
  { range: [1, 1], result: 'Losvari', description: 'The lost elves who fought in the Great War.' },
  { range: [2, 2], result: 'Anavari', description: 'The wilde elves of the bushlands.' },
  { range: [3, 3], result: 'Kaelvari', description: 'The western wood elves.' },
  { range: [4, 4], result: 'Alostrovari', description: 'The sea elves.' },
  { range: [5, 5], result: 'Evantari', description: 'The high elves who believe themselves superior.' }
];

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
  lifespan: 65,
  height: "5' 8\"",
  weight: "180 lb",
  speed: 30,
  specialAbilities: [],
  startingEquipment: [],
  startingFunds: '',
  currentStep: 'species'
});

export const rollDice = (sides: number, count: number = 1): number[] => {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
};

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
    default:
      return [];
  }
};