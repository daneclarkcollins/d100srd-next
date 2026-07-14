/**
 * SagaBorn D100 — Master skill list
 *
 * Sources:
 *  - /home/claude/d100srd-rules-v2/003-skills-and-talents.md (alphabetical skill
 *    table, category lists, skill descriptions), doc pull 2026-07-14
 *  - /home/claude/errata-2026-07-13.md (Mike's rulings, 7-13-2026)
 *
 * RULE OF PRECEDENCE: the errata WINS over chapter text on any conflict.
 * Where the table and the description still disagree post-errata, the table
 * value is used and a `// data note:` comment marks the discrepancy.
 *
 * Errata applied here: #3 (Craft INT+ACU; languages exempt from creation cap),
 * #7 (Dodge/Hide/Stealth are Dexterous), #11 (Disguise 5%, Gaming INT+ACU,
 * Siege Weapon 5%, Shield per shield type), #12 (melee/missile umbrellas are
 * skill GROUPS, not skills; Parry is a skill that uses the weapon wielded),
 * #14 (Knowledge Arcana added), #38 (Brewing is Cooking).
 * Exec summary: Persuasion is always Persuade; Pilot specialties Air/Land/Sea.
 */

import { Skill } from './types';

export const SKILLS: Skill[] = [
  {
    name: 'Acrobatics',
    category: 'Dexterous',
    base: 10,
    summary: 'Perform physical actions of balance, agility, and coordination.',
  },
  {
    name: 'Appraise',
    category: 'Mental',
    base: 15,
    summary: "Estimate an object's worth, from paintings and gemstones to weapons and horses.",
  },
  {
    name: 'Art (various)',
    category: 'Dexterous',
    base: 5,
    specialties: [
      'Calligraphy',
      'Composing',
      'Drawing',
      'Painting',
      'Poetry',
      'Sculpture',
      'Sketching',
      'Songwriting',
      'Writing',
    ],
    summary: 'Create works of art in paint, sculpture, story, poem, or musical composition (use Perform for acting, dancing, singing, or playing).',
  },
  {
    name: 'Athletics',
    category: 'Physical',
    base: 10,
    summary: 'Perform feats of strength, speed, and endurance.',
  },
  {
    name: 'Bargain',
    category: 'Communication',
    base: 5,
    summary: 'Haggle over prices and negotiate compromises when opposing opinions meet.',
  },
  {
    name: 'Bludgeoning Weapons',
    category: 'Combat',
    base: 15,
    groups: ['melee-weapon'],
    summary: 'Fight with blunt melee weapons such as maces and war hammers.',
  },
  {
    name: 'Brawl',
    category: 'Combat',
    base: 15,
    summary: 'Unarmed combat: kicks, punches, head butts, and the like.',
  },
  {
    name: 'Climb',
    category: 'Physical',
    base: 25,
    summary: 'Climb up or down walls, trees, cliffs, or any other surface.',
  },
  {
    name: 'Command',
    category: 'Communication',
    base: 5,
    summary: 'Inspire, direct, and coordinate subordinates, granting 1/5 your Command skill as a complementary bonus while they follow orders.',
  },
  {
    name: 'Craft (various)',
    category: 'Dexterous',
    base: { formula: 'INT+ACU' }, // errata #3/#10: Craft is INT+ACU (the 40% starting-craft line in 002 is a house rule, deleted)
    specialties: [
      'Alchemy',
      'Artificing',
      'Blacksmithing',
      'Carpentry',
      'Cooking', // errata #38: Brewing folds into Cooking
      'Leatherworking',
      'Poisoner',
      'Tinkerer',
    ],
    summary: 'Construct or make things — from a chair to a meal to a house — and identify how an object was made; can repair items in place of Repair.',
  },
  {
    name: 'Disguise',
    category: 'Communication',
    base: 5, // errata #11: Disguise 5%
    summary: 'Use posture, costume, voice, and other tricks to appear as a different person or kind of person.',
  },
  {
    name: 'Dodge',
    category: 'Dexterous', // errata #7: Dodge changed to Dexterous
    base: { formula: 'DEXx2' },
    summary: 'Evade incoming attacks, downgrading a successful attack by one step per level of Dodge success (Difficult vs. melee attacks).',
  },
  {
    name: 'Etiquette (various)',
    category: 'Communication',
    base: 5,
    summary: "Behave appropriately within a culture, caste, or group's social rules and codes of conduct (specialties by culture/group; no fixed list documented).",
  },
  {
    name: 'Fast Talk',
    category: 'Communication',
    base: 5,
    summary: 'Quickly convince a target of something they may not believe or push a rapid decision — effects are usually temporary.',
  },
  {
    name: 'Fine Manipulation',
    category: 'Dexterous',
    base: 5,
    summary: 'Careful use of hands and fingers: picking locks, disassembling traps, clockwork mechanisms, or artificed devices.',
  },
  {
    name: 'First Aid',
    category: 'Mental',
    base: 30,
    summary: 'Stop bleeding, bandage wounds, set broken limbs, resuscitate, or revive — healing 1d4 HP on success (once per day per being).',
  },
  {
    name: 'Gaming',
    category: 'Mental',
    base: { formula: 'INT+ACU' }, // errata #11: Gaming INT+ACU
    summary: 'Play games of skill and strategy — board games, dice games, wagering games — resolved as opposed rolls against other players.',
  },
  {
    name: 'Grapple',
    category: 'Combat',
    base: 15,
    summary: 'Wrestle or subdue a target, establishing and maintaining holds to apply grapple effects like disarm, immobilize, or throw.',
  },
  {
    name: 'Hide',
    category: 'Dexterous', // errata #7: Hide changed to Dexterous
    base: 10,
    summary: 'Conceal an object or oneself from view, opposed by an observer\'s Spot.',
  },
  {
    name: 'Insight',
    category: 'Perception',
    base: 5,
    summary: "Evaluate another person's character, emotional state, and motives from body language and speech patterns.",
  },
  {
    name: 'Jump',
    category: 'Physical',
    base: 25,
    summary: 'Leap for height or distance, clear obstacles, and reduce falling damage by 1d6 per level of success.',
  },
  {
    name: 'Knowledge (various)',
    category: 'Mental',
    base: 5,
    specialties: [
      'Arcana', // added by errata #14 (exec summary #3): knowledge of the arcane and magical
      'Alchemy',
      'Ancient History',
      'Archaeology',
      'Art History',
      'Commerce',
      'Espionage (Restricted)',
      'Folklore',
      'Forbidden Lore (Restricted)',
      'Group/Subspecialty',
      'History (General)',
      'Law',
      'Linguistics',
      'Literature',
      'Monster Lore (Restricted)',
      'Occult (Restricted)',
      'Philosophy',
      'Politics',
      'Region/Subspecialty',
      'Religion/Subspecialty',
      'Streetwise',
    ],
    summary: 'Academic study or experience in a branch of knowledge — general Knowledge maxes at 40%, after which points go to specialties (Restricted ones need StoryGuide approval).',
  },
  // data note: languages are omitted from the master skill table, but the docs
  // treat them as rated skills (e.g. Persuade across a language barrier keys off
  // a language rating below 50%; errata #3 sets starting languages per the chart
  // and exempts them from the creation cap). Encoded here as Language (various).
  {
    name: 'Language (various)',
    category: 'Communication',
    base: 0,
    summary: 'Speak (and read/write, where literate) a specific language; starting languages sit at 90% and languages are exempt from the 75% creation cap.',
  },
  {
    name: 'Listen',
    category: 'Perception',
    base: 25,
    summary: 'Hear, interpret, and understand sounds, actively or passively, opposed by Stealth.',
  },
  {
    name: 'Martial Arts',
    category: 'Combat',
    base: 5,
    groups: ['melee-weapon'], // data note: description says "It is considered a Melee Weapon skill"
    summary: 'The study of combat and defense using one\'s own body, making hands and feet deal lethal (1d6) damage.',
  },
  {
    name: 'Medicine',
    category: 'Mental',
    base: 5,
    summary: 'Diagnose and treat serious injuries, diseases, and poisonings, perform surgery, and advise long-term care.',
  },
  {
    name: 'Navigate',
    category: 'Perception',
    base: 10,
    summary: 'Find the way to a destination using compass, charts, stars, or memory and intuition.',
  },
  {
    name: 'Parry',
    category: 'Combat',
    base: 'per-item', // errata #12: Parry is a skill that uses the weapon being wielded
    summary: 'Block an incoming attack with a wielded weapon or shield (cumulative -30% per parry after the first; Difficult vs. missiles unless using a shield).',
  },
  {
    name: 'Perform (various)',
    category: 'Communication',
    base: 5,
    specialties: [
      'Act',
      'Conduct Orchestra',
      'Dance',
      'Juggle',
      'Orate',
      'Play Instrument',
      'Recite',
      'Ritual',
      'Sing',
    ],
    summary: 'Perform for an audience — acting, dancing, playing an instrument, singing, or other artistic expression.',
  },
  {
    name: 'Persuade',
    category: 'Communication',
    base: 15, // exec summary #3: Persuasion is always Persuade
    summary: 'Convince someone a particular idea or belief is right through logic, debate, oratory, empathy, or intimidation — effects last indefinitely.',
  },
  {
    name: 'Piercing Weapons',
    category: 'Combat',
    base: 15,
    groups: ['melee-weapon'],
    summary: 'Fight with piercing melee weapons such as daggers and spears.',
  },
  {
    name: 'Pilot (various)',
    category: 'Physical',
    base: 1,
    specialties: ['Air', 'Land', 'Sea'], // exec summary #3: Pilot specialties are Air, Land, Sea
    closedSpecialties: true,
    summary: 'Steer, maneuver, and control a vehicle; most day-to-day piloting is Automatic.',
  },
  {
    name: 'Ranged Weapons',
    category: 'Combat',
    base: 15,
    groups: ['missile-weapon'],
    summary: 'Fight with ranged weapons such as bows, slings, and crossbows (-10% against an adjacent foe; damage type per ammunition).',
  },
  {
    name: 'Repair (various)',
    category: 'Dexterous',
    base: 15,
    summary: 'Fix damaged or non-working equipment (restoring 1d3 HP on success) or make slight modifications and adaptations (specialties by object type; no fixed list documented).',
  },
  {
    name: 'Research',
    category: 'Perception',
    base: 25,
    summary: 'Locate and identify information in libraries, archives, or correspondence; an attempt normally takes four hours.',
  },
  {
    name: 'Ride (various)',
    category: 'Physical',
    base: 5,
    summary: 'Ride, handle, and care for a specific kind of living animal, with specialties by animal type.',
  },
  {
    name: 'Sense',
    category: 'Perception',
    base: 10,
    summary: 'Notice or identify stimuli of taste, touch, smell, and the lesser-known senses (balance, temperature, and the like).',
  },
  {
    name: 'Shield',
    category: 'Combat',
    base: 'per-item', // errata #11: Shields per shield type
    summary: 'Block incoming attacks with a shield (blocks follow parry rules, cumulative -30% per extra roll) or attack with it as a melee weapon.',
  },
  {
    name: 'Siege Weapon',
    category: 'Combat',
    base: 5, // errata #11: Siege Weapons 5%
    summary: 'Handle large weapons such as catapults or ballista — a rare, sought-after expertise.',
  },
  {
    name: 'Slashing Weapons',
    category: 'Combat',
    base: 15,
    groups: ['melee-weapon'],
    summary: 'Fight with slashing melee weapons such as swords, axes, and polearms.',
  },
  {
    name: 'Sleight of Hand',
    category: 'Dexterous',
    base: 5,
    summary: 'Manipulate small objects misleadingly or unnoticed — picking pockets, cheating at cards, tricks of illusion — opposed by Spot.',
  },
  {
    name: 'Spellcraft',
    category: 'Mental',
    base: 0, // exec summary #3: the spellcasting skill is always Spellcraft
    summary: 'Form mana into spells — every use of mana to cast is preceded by a Spellcraft check, and it opposes other Spellcraft in counter attempts.',
  },
  {
    name: 'Spot',
    category: 'Perception',
    base: 25,
    summary: 'Notice details, hidden compartments, disguised foes, or ambushes, and aim weapons and spells; opposed by Hide, Disguise, or Sleight of Hand.',
  },
  {
    name: 'Stealth',
    category: 'Dexterous', // errata #7: Stealth changed to Dexterous
    base: 5, // data note: table says 5%, description says 10% — conflict unresolved post-errata; table value used
    summary: 'Sneak through an area without drawing attention (no cover required; use Hide to avoid being seen while immobile), opposed by Spot or Listen.',
  },
  {
    name: 'Strategy',
    category: 'Mental',
    base: 1,
    summary: 'Guide forces in battle, coordinate logistics, and plan large-scale military enterprises, resolved as opposed rolls between leaders.',
  },
  {
    name: 'Survival',
    category: 'Mental',
    base: 5,
    summary: 'Survive in an environment familiar to the character, from finding food in a forest to streetsmarts in a sewer.',
  },
  {
    name: 'Swim',
    category: 'Physical',
    base: 25,
    summary: 'Move through or under water in dangerous or stressful situations (routine floating and treading water is Automatic).',
  },
  {
    name: 'Teach',
    category: 'Communication',
    base: 10,
    summary: 'Train or teach information or technique to another via lecture, exercise, or sparring.',
  },
  {
    name: 'Throw',
    category: 'Physical',
    base: 25,
    groups: ['missile-weapon'], // data note: docs treat Throw as a missile skill (fumbles use the Missile Weapon Fumbles Table; thrown weapons add the damage modifier)
    summary: 'Hit a target with a thrown weapon or improvised object (including lassos and catching items), out to STRx2 feet before rolls turn Difficult.',
  },
  {
    name: 'Track',
    category: 'Perception',
    base: 10,
    summary: 'Identify tracks or follow a trail — person, vehicle, or animal — across varied ground.',
  },
];
