/**
 * SagaBorn D100 — Talents
 *
 * Source: doc 003 "Skills and Talents" (2026-07-14 pull) + doc 000 Errata (2026-07-13).
 * RULE OF PRECEDENCE: the errata WINS over chapter text when they disagree
 * (Powerful Attack, Evasion, Elemental Focus, Bardic Knowledge are errata-unified here).
 *
 * Unified talents that appear in multiple archetype trees are encoded ONCE with
 * multiple entries in `trees` (Powerful Attack, Extra Attack, Artful Dodger,
 * Evasion, Improved Evasion, Spell Sight, Mage Lore, Elemental Focus).
 *
 * Prereq semantics: outer array = AND, inner array = OR. Entries are canonical
 * talent names in this file, or "special:<text>" for non-talent requirements.
 */

import { Talent } from './types';

export const TALENTS: Talent[] = [
  // -------------------------------------------------------------------------
  // Warrior — Fighter Talent Tree
  // -------------------------------------------------------------------------
  {
    name: 'Gain Health',
    cost: 2,
    trees: ['Fighter'],
    prerequisites: [],
    summary: 'Gain HP equal to your CON, added to your total Hit Points Max.',
  },
  {
    name: 'Heroic Surge',
    cost: 1,
    trees: ['Fighter'],
    prerequisites: [['Gain Health']],
    summary: 'Once per encounter, take a bonus Heroic Action or Move Action.',
  },
  {
    // Errata-unified (errata Exec Summary #2 / Part 1 #13): one talent, Fighter + Berserker.
    name: 'Powerful Attack',
    cost: 1,
    trees: ['Fighter', 'Berserker'],
    prerequisites: [['Gain Health', 'Rage']],
    summary:
      'Before rolling an attack, you may take a -10 melee attack roll penalty to gain +1d8 to the melee damage roll.',
  },
  {
    name: 'Weapon Specialty',
    cost: 1,
    trees: ['Fighter'],
    prerequisites: [['Heroic Surge', 'Powerful Attack']],
    summary:
      'Choose one specific weapon to specialize in, gaining +5 to that weapon skill. The choice cannot be changed.',
  },
  {
    name: 'Shield Specialty',
    cost: 1,
    trees: ['Fighter'],
    prerequisites: [['Heroic Surge', 'Powerful Attack']],
    summary:
      'Use your Shield skill to attempt to block attacks against adjacent creatures; counts as one of your defensive rolls (normal cumulative penalties apply) and does not prevent the defended creature from taking its own defensive action.',
  },
  {
    // Unified: listed identically in the Fighter, Berserker, and Archeon trees.
    name: 'Extra Attack',
    cost: 1,
    trees: ['Fighter', 'Berserker', 'Archeon'],
    prerequisites: [['Rage Mind', 'Resist Magic', 'Weapon Specialty']],
    summary: 'You gain one additional attack each round.',
  },
  {
    name: 'Reposition',
    cost: 1,
    trees: ['Fighter'],
    prerequisites: [['Extra Attack']],
    summary:
      'Once per round as a reaction, when flanked, get a free move of up to 5 ft that does not provoke attacks of opportunity.',
  },
  {
    name: 'Defensive Specialist',
    cost: 1,
    trees: ['Fighter'],
    prerequisites: [['Extra Attack']],
    summary:
      'Each defensive ability (Dodge, Parry, Shield) tracks its own separate penalty pool; repeated uses of the same pool in a round still accrue the normal penalty.',
  },
  {
    name: 'Natural Strength',
    cost: 1,
    trees: ['Fighter'],
    prerequisites: [['Extra Attack']],
    summary: 'Gain 2 STR.',
  },
  {
    name: 'Bonus Attack',
    cost: 1,
    trees: ['Fighter'],
    prerequisites: [['Reposition', 'Natural Strength']],
    summary:
      'Once per round, make an additional attack as a Free Action, in addition to Extra Attack and attacks from any other source.',
  },

  // -------------------------------------------------------------------------
  // Warrior — Berserker Talent Tree
  // -------------------------------------------------------------------------
  {
    name: 'Rage',
    cost: 2,
    trees: ['Berserker'],
    prerequisites: [],
    summary:
      'Once per encounter as a Free Action, rage: +2 damage to melee attacks and ignore 1 damage for 1 minute while attacking or moving to attack a hostile target. Cannot cast spells or maintain spell concentration while raging.',
  },
  {
    name: 'Fast Movement',
    cost: 1,
    trees: ['Berserker'],
    prerequisites: [['Rage', 'Powerful Attack', 'Expert Tracker']],
    summary: "Add 10' to base movement speed. No bonus while wearing heavy armor.",
  },
  {
    name: 'Rage Mind',
    cost: 1,
    trees: ['Berserker'],
    prerequisites: [['Fast Movement']],
    summary: 'While Raging, gain immunity to Charm and Fear effects and resistance to Horror 1.',
  },
  {
    // Canonical name (doc tree list prints "Natural CON"; the talent entry is Natural Constitution).
    name: 'Natural Constitution',
    cost: 1,
    trees: ['Berserker'],
    prerequisites: [['Rage Mind']],
    summary: 'Gain 2 CON.',
  },
  {
    name: 'Focused Rage',
    cost: 1,
    trees: ['Berserker'],
    prerequisites: [['Natural Constitution']],
    summary:
      'Your Rage improves to +4 damage and DR 3. Once per encounter; lasts 1 minute while attacking or moving to attack; no spellcasting or spell concentration.',
  },

  // -------------------------------------------------------------------------
  // Warrior — Archeon Talent Tree
  // -------------------------------------------------------------------------
  {
    // Canonical name "Magebane" (doc tree list prints "Mage Bane").
    name: 'Magebane',
    cost: 2,
    trees: ['Archeon'],
    prerequisites: [],
    summary:
      "Once per round, roll two d100s during an attack against any creature or person using magic spells and choose the better roll; also usable during Heroic Actions against spellcasters.",
  },
  {
    name: 'Magic Sense',
    cost: 1,
    trees: ['Archeon'],
    prerequisites: [['Magebane']],
    summary:
      'Detect whether magic (and whether ravaging magic) has been used around a place, person, or creature: automatic after 30 minutes; 12 seconds + Sense check to spot a magic user within 30 ft; easy Sense check to identify ravaging magic when witnessed, or after an hour with a person to tell if they carry ravage points.',
  },
  {
    name: 'Disperse Magic',
    cost: 1,
    trees: ['Archeon'],
    prerequisites: [['Magebane']],
    summary:
      "Once per round as a Reaction (not an action), negate magic that would affect you so you take no damage; you must be aware of the attack. Resolved as a Heroic Action: your Survival or Spellcraft vs the spellcaster's Spellcraft.",
  },
  {
    // data note: doc text says "roll 2d100 and choose the highest roll" — known direction bug
    // (d100 roll-under: lower is better). Encoded as lower (better), pending doc fix.
    name: 'Resist Magic',
    cost: 1,
    trees: ['Archeon'],
    prerequisites: [['Magic Sense']],
    summary:
      'Roll 2d100 and choose the lower (better) roll on Survival checks to escape or resist a persistent magical effect.',
  },
  {
    name: 'Spell Siphon',
    cost: 2,
    trees: ['Archeon'],
    prerequisites: [['Disperse Magic']],
    summary:
      'Absorb a spell that affects you (opposed Heroic Action: ACU vs Spellcraft) so it does not affect you; you may store the siphoned spell and cast it once, taking damage equal to its mana per round stored.',
  },
  {
    name: 'Spell Shield',
    cost: 1,
    trees: ['Archeon'],
    prerequisites: [['Resist Magic', 'Spell Siphon']],
    summary:
      'Once per encounter as a Move Action, create a directional shield protecting those behind you up to 10 ft, negating all magical spell damage (including AoE) for up to 4 rounds. Targets outside the shield take damage as normal.',
  },
  {
    name: 'Disruption',
    cost: 1,
    trees: ['Archeon'],
    prerequisites: [['Spell Shield']],
    summary:
      "Once per encounter as a Move Action, disrupt a mage within 40': each round the mage must win a Heroic Action (their Spellcraft vs your Survival) to cast spells or spend mana; maintained spells are canceled while you concentrate (Free Action to maintain Disruption; concentration cost scales with the canceled spell's mana: <=3 Free, 5 Move, 7 Standard Action).",
  },

  // -------------------------------------------------------------------------
  // Expert — Factor Talent Tree
  // -------------------------------------------------------------------------
  // data note: the Factor tree list in doc 003 includes "Evasion" at position 3, but no
  // Factor Evasion talent is defined and the errata records "Factor reference not found
  // by Mike" — known doc bug. Evasion is therefore NOT given the Factor tree.
  {
    name: 'Loyalty',
    cost: 2,
    trees: ['Factor'],
    prerequisites: [],
    summary:
      "Once per round as a free action, give an ally within 20' a +5% bonus to a combat skill during their attack roll.",
  },
  {
    name: 'Barter',
    cost: 1,
    trees: ['Factor'],
    prerequisites: [['Loyalty']],
    summary:
      'Automatically negotiate a 10% decrease or increase in the cost of retail goods bought or sold.',
  },
  {
    name: 'Contacts',
    cost: 1,
    trees: ['Factor'],
    prerequisites: [['Barter']],
    summary:
      'Gain +5% to Insight and Persuade skill checks with people you know, and +5% to finding or identifying a person of interest or knowing where to get rare goods.',
  },
  {
    name: 'Blend In',
    cost: 1,
    trees: ['Factor'],
    prerequisites: [['Loyalty']],
    summary: 'You and your companions gain +15% to Disguise skill checks in any environment.',
  },
  {
    name: 'Examiner',
    cost: 1,
    trees: ['Factor'],
    prerequisites: [['Blend In']],
    summary: 'Identify one item per day as per the Identify spell.',
  },
  {
    name: 'Improved Barter',
    cost: 1,
    trees: ['Factor'],
    prerequisites: [['Contacts']],
    summary:
      'Automatically negotiate a 20% decrease or increase in the cost of retail goods bought or sold.',
  },
  {
    name: 'Masterful Contacts',
    cost: 1,
    trees: ['Factor'],
    prerequisites: [['Improved Barter']],
    summary:
      'Gain +3 to Perception and Communication skill checks with people you know, and +3 to finding or identifying a person of interest or knowing where to get rare goods.',
  },
  {
    name: 'Masterful Intuition',
    cost: 1,
    trees: ['Factor'],
    prerequisites: [['Examiner']],
    summary: 'Gain a +5% expertise bonus to all Perception skill checks involving diplomacy.',
  },
  {
    name: 'Broker',
    cost: 1,
    trees: ['Factor'],
    prerequisites: [['Masterful Contacts']],
    summary:
      'Gain +4 to finding the sources of any rare or wondrous goods, and automatically negotiate a 30% decrease or increase in the cost of retail goods bought or sold.',
  },

  // -------------------------------------------------------------------------
  // Expert — Rogue Talent Tree
  // -------------------------------------------------------------------------
  {
    name: 'Sneak Attack',
    cost: 2,
    trees: ['Rogue'],
    prerequisites: [],
    summary:
      'Once per round on a successful hit, deal 1d6 extra damage when the attack is Easy because the target is flanked, prone, disabled, or grappled. Requires a light or medium melee weapon or a ranged weapon.',
  },
  {
    name: 'Trapfinding',
    cost: 1,
    trees: ['Rogue'],
    prerequisites: [['Sneak Attack']],
    summary: 'When searching for traps, roll 2d100 and choose the better result.',
  },
  {
    // Unified: listed identically in the Rogue and Ranger trees.
    name: 'Artful Dodger',
    cost: 1,
    trees: ['Rogue', 'Ranger'],
    prerequisites: [['Sneak Attack', 'Quick Shot']],
    summary: 'Once per round, use a Free Action as a Move Action.',
  },
  {
    // Errata-unified (errata Part 1 #13): one talent, Rogue + Ranger.
    name: 'Evasion',
    cost: 1,
    trees: ['Rogue', 'Ranger'],
    prerequisites: [['Artful Dodger']],
    summary:
      'On a successful save against an attack that deals half damage on a save, you take no damage instead.',
  },
  {
    name: 'Precise Strike',
    cost: 1,
    trees: ['Rogue'],
    prerequisites: [['Sneak Attack']],
    summary: 'Your Sneak Attack deals 2d6 extra damage instead of 1d6.',
  },
  {
    // Unified: listed identically in the Rogue and Ranger trees.
    name: 'Improved Evasion',
    cost: 1,
    trees: ['Rogue', 'Ranger'],
    prerequisites: [['Evasion']],
    summary: 'Upon failing a save, take only half damage.',
  },
  {
    name: 'Gut Feeling',
    cost: 1,
    trees: ['Rogue'],
    prerequisites: [['Trapfinding']],
    summary:
      'Sense the presence of any traps when entering an area; a Spot check is still required to locate the trap.',
  },
  {
    name: 'Trap Mastery',
    cost: 1,
    trees: ['Rogue'],
    prerequisites: [['Gut Feeling']],
    summary: 'Once per round as a Free Action, search for traps, disarm traps, or open a lock.',
  },
  {
    // Canonical name (doc tree list has the typo "Expert Mobiity").
    name: 'Expert Mobility',
    cost: 1,
    trees: ['Rogue'],
    prerequisites: [['Improved Evasion']],
    summary: 'You never provoke an Attack of Opportunity for moving.',
  },

  // -------------------------------------------------------------------------
  // Expert — Ranger Talent Tree
  // -------------------------------------------------------------------------
  {
    name: 'Quick Shot',
    cost: 2,
    trees: ['Ranger'],
    prerequisites: [],
    summary:
      'Once per round, attack twice with a ranged or missile weapon as a single Standard Action; both attacks suffer a -10% skill penalty.',
  },
  {
    name: 'Expert Tracker',
    cost: 1,
    trees: ['Ranger'],
    prerequisites: [['Quick Shot']],
    summary: 'Roll 2d100 and use the lower (better) number when using Track.',
  },
  {
    name: 'Favored Enemy',
    cost: 1,
    trees: ['Ranger'],
    prerequisites: [['Quick Shot']],
    summary:
      'Against a Favored Enemy (see Table: Ranger Favored Enemies), add 1d6+1 damage on every hit, no per-round limit; identify these creatures with an Easy Insight or Knowledge check.',
  },
  {
    name: 'Favored Terrain',
    cost: 1,
    trees: ['Ranger'],
    prerequisites: [['Expert Tracker']],
    summary:
      'In your favored terrain (see Table: Favored Terrains), leave no tracks, ignore difficult ground, and gain +2 to Initiative or combat DEX ranking.',
  },
  {
    name: 'Crippling Strike',
    cost: 1,
    trees: ['Ranger'],
    prerequisites: [['Favored Enemy']],
    summary:
      'Once per round on dealing damage, the target makes a DEX save: on a success it moves at half speed for 1 round; on a failure it is momentarily incapacitated and gets no Move Actions for 1 round.',
  },
  {
    name: 'Swift Tracker',
    cost: 1,
    trees: ['Ranger'],
    prerequisites: [['Favored Terrain']],
    summary: 'Continue to Track as a Free Action each round while moving at maximum speed.',
  },
  {
    name: 'Woodland Stride',
    cost: 1,
    trees: ['Ranger'],
    prerequisites: [['Swift Tracker']],
    summary:
      'Suffer no impairment, penalties, or damage from difficult terrain, magical or otherwise, when in the wilds with sky above you.',
  },

  // -------------------------------------------------------------------------
  // Mage — Bard Talent Tree
  // -------------------------------------------------------------------------
  {
    // Errata-reworded (errata Part 1 #18). Grants mana → counts as a spellcasting Talent.
    name: 'Bardic Knowledge',
    cost: 2,
    trees: ['Bard'],
    prerequisites: [],
    grantsMana: true,
    summary:
      "Three times per day, add +15% to any Knowledge Check. On gaining this Talent you receive Mana equal to half your current ACU; you may remember a limited number of spells per the Talent Point Level table; if this is your first Mage talent, learn one spell.",
  },
  {
    // Unified: listed identically in the Bard, Luminar, and Wylder trees.
    name: 'Spell Sight',
    cost: 1,
    trees: ['Bard', 'Luminar', 'Wylder'],
    prerequisites: [['Spellbook', 'Bardic Knowledge', 'Spell Memory']],
    summary:
      'Recognize a spell being cast with a successful Spellcraft roll; if recognized, you may also remember the spell, which can then be put in a Spellbook or remembered with Spell Memory.',
  },
  {
    name: 'Enhanced Perform',
    cost: 1,
    trees: ['Bard'],
    prerequisites: [['Bardic Knowledge']],
    summary:
      "As a Standard Action, use Perform to distract, encourage, or enchant others, granting +10 or -10 to one d100 roll of an affected creature (resisted: your Perform vs target's Insight); continue each round with a Free Action, and pass a Perform roll to keep performing if another action interferes.",
  },
  {
    // Unified: listed identically in the Bard and Luminar trees.
    name: 'Mage Lore',
    cost: 1,
    trees: ['Bard', 'Luminar'],
    prerequisites: [['Bardic Knowledge', 'Spellbook']],
    summary:
      'Roll 2d100 (take the better) when making a Knowledge or Spellcraft check regarding arcane knowledge, magical history, lore, or effects.',
  },
  {
    // data note: doc 003 prints the prerequisite as "Perform" — a skill, not a talent
    // (known doc bug). Encoded as the Bard-tree talent Enhanced Perform.
    name: 'Soothing Song',
    cost: 1,
    trees: ['Bard'],
    prerequisites: [['Enhanced Perform']],
    summary:
      'Heal all within earshot for 1d8+4 HP by performing, uninterrupted, for one hour; if interrupted the spellsong fails, but you may keep attempting it until successful.',
  },
  {
    name: 'Hymn of Horror',
    cost: 1,
    trees: ['Bard'],
    prerequisites: [['Soothing Song']],
    summary:
      'Perform to make enemies who can see and hear you become Shaken while in range (30 ft); a mind-affecting fear effect that cannot escalate targets to Frightened or Panicked.',
  },
  {
    name: 'Inspire Greatness',
    cost: 1,
    trees: ['Bard'],
    prerequisites: [['Hymn of Horror']],
    summary:
      'Your Perform lets one target (self or other) within 30 ft roll 2d100 on Attack Rolls (keeping the better result) and gain +1d8 damage on a successful hit; Move Action to start, Free Action each round to maintain, lasts 5 rounds after you stop.',
  },

  // -------------------------------------------------------------------------
  // Mage — Luminar Talent Tree
  // -------------------------------------------------------------------------
  {
    // Canonical name "Spellbook" (doc entry heading prints "Spell Book").
    name: 'Spellbook',
    cost: 2,
    trees: ['Luminar'],
    prerequisites: [],
    grantsMana: true,
    summary:
      'Track your spells in a Spellbook (any fitting object: runed staff, tattoos, inscribed leather...). On gaining this Talent you receive Mana equal to half your current ACU; if this is your first Mage or Spellcasting talent, learn three spells.',
  },
  {
    // Errata-unified (errata Part 1 #17): one rank talent (I-IV), Luminar + Wylder.
    name: 'Elemental Focus',
    cost: 1,
    ranks: 4,
    trees: ['Luminar', 'Wylder'],
    prerequisites: [['Spell Memory', 'Spellbook']],
    summary:
      'Elemental Focus I-IV, unified for Luminar and Wylder: costs 1 TP per rank, prereq Spell Memory or Spellbook; as a free action, bond a touched object as an elemental focus; counts as a spell for detection, dispels, and other abilities, but takes no spell-memory slot and costs no mana.',
  },
  {
    name: 'Energy Burst',
    cost: 1,
    trees: ['Luminar'],
    prerequisites: [['Spellbook']],
    summary:
      'Fire a small orb of your active Elemental Focus energy at a target (Spot check to hit) dealing 1d6+1 magic damage, range 50 ft; can be charged with an Elemental Focus to add its elemental ability. A Special doubles the damage; a Critical maximizes that special damage.',
  },
  {
    name: 'Energy Blast',
    cost: 1,
    trees: ['Luminar'],
    prerequisites: [['Energy Burst']],
    summary:
      "Up to 3 times per day, cast an exploding orb of your active Elemental Focus doing 4d4 damage — or healing 4d4 HP — to all within a 15' radius; Spot check to target a square; Dodge for half damage; 40' range.",
  },
  {
    name: 'Greater Energy Burst',
    cost: 1,
    trees: ['Luminar'],
    prerequisites: [['Energy Burst']],
    summary: "Your Energy Burst does a total of 2d6+2 damage (plus elemental focus) with an 80' range.",
  },
  {
    name: 'Energy Wall',
    cost: 1,
    trees: ['Luminar'],
    prerequisites: [['Energy Blast']],
    summary:
      "Once per day, summon a 15'x15'x2' wall of your active Elemental Focus energy that does 6d4 damage to any who cross through it; lasts 2d4 rounds; 60' range.",
  },
  {
    name: 'Call of the Elements',
    cost: 1,
    trees: ['Luminar'],
    prerequisites: [['Energy Wall']],
    summary:
      "Once per day, summon a raging storm of your active Elemental Focus doing 8d6+8 damage to all creatures within a 40' radius (Dodge for half), or instead stun all creatures within a 40' radius (Survival check negates); Spot check to target a square; 80' range.",
  },

  // -------------------------------------------------------------------------
  // Mage — Wylder Talent Tree
  // -------------------------------------------------------------------------
  {
    name: 'Spell Memory',
    cost: 2,
    trees: ['Wylder'],
    prerequisites: [],
    grantsMana: true,
    summary:
      'Remember a limited number of spells (per Talent Point Level) without a spellbook. On gaining this Talent you receive Mana equal to half your current ACU; if this is your first Mage or Spellcasting talent, learn three spells.',
  },
  {
    name: 'Wild Magic',
    cost: 1,
    trees: ['Wylder'],
    prerequisites: [['Spell Memory']],
    summary:
      "A burst of untamed energy: succeed on a Spot check to hit a target within 50' for 1d6 magic damage (Special doubles it; Critical maximizes that special damage). Alternatively, charge your weapon as a Free Action to add Wild Magic damage to melee weapon damage on a hit.",
  },
  {
    name: 'Discordian Shield',
    cost: 1,
    trees: ['Wylder'],
    prerequisites: [['Wild Magic', 'Disperse Magic']],
    summary:
      'A swirling vortex of chaos energy grants +2 AV; cast as a Standard or Move Action and lasts as long as you wish.',
  },
  {
    name: 'Greater Wild Magic',
    cost: 1,
    trees: ['Wylder'],
    prerequisites: [['Wild Magic']],
    summary: 'Your Wild Magic gains 1d6 damage.',
  },
  {
    name: 'Chaos Wave',
    cost: 1,
    trees: ['Wylder'],
    prerequisites: [['Discordian Shield']],
    summary:
      "Twice per day as a free action, a wave of chaotic energy bursts from your body in all directions, doing 4d6+3 damage to all in a 10' radius.",
  },
  {
    name: 'Focused Wild Magic',
    cost: 1,
    trees: ['Wylder'],
    prerequisites: [['Chaos Wave']],
    summary:
      "Your Wild Magic becomes a focused burst doing 4d4+4 damage, range 120', and you can change its energy type to any Elemental Focus you have; alternatively charge your weapon as a Free Action to add the damage to melee weapon damage.",
  },
  {
    name: 'Magical Attack',
    cost: 1,
    trees: ['Wylder'],
    prerequisites: [['Focused Wild Magic']],
    summary:
      'When casting a spell that costs mana, you may make one melee weapon attack as a Free Action.',
  },

  // -------------------------------------------------------------------------
  // Common Talents — Skill Talents
  // (Talents cannot allow skills to progress past a character's max skill cap.)
  // -------------------------------------------------------------------------
  {
    name: 'Advanced Skills',
    cost: 1,
    trees: ['Skill'],
    prerequisites: [],
    summary: 'Select one Skill that can advance beyond the skill cap of 90% to 95%.',
  },
  {
    name: 'Agile',
    cost: 1,
    trees: ['Skill'],
    prerequisites: [],
    summary: 'Gain a +3% bonus as a Misc modifier to your Dexterous Skills.',
  },
  {
    name: 'Alertness',
    cost: 1,
    trees: ['Skill'],
    prerequisites: [],
    summary: 'Gain a +3% bonus to your Spot Skill.',
  },
  {
    name: 'Discerning',
    cost: 1,
    trees: ['Skill'],
    prerequisites: [],
    summary: 'Gain a +3% bonus as a Misc modifier to your Perception Skills.',
  },
  {
    name: 'Investigator',
    cost: 1,
    trees: ['Skill'],
    prerequisites: [],
    summary:
      "Gain a +3% Expertise bonus to Insight, Research, and Sense checks while gathering information, examining a location, or sensing a person's motives.",
  },
  {
    name: 'Linguist',
    cost: 1,
    trees: ['Skill'],
    prerequisites: [],
    summary: 'Learn 3 languages of your choice with a base understanding of 30%.',
  },
  {
    name: 'Negotiator',
    cost: 1,
    trees: ['Skill'],
    prerequisites: [],
    summary: 'Gain a +3% bonus as a Misc modifier to your Communication Skills.',
  },
  {
    name: 'Powerful',
    cost: 1,
    trees: ['Skill'],
    prerequisites: [],
    summary: 'Gain a +3% bonus as a Misc modifier to your Physical skills.',
  },
  {
    name: 'Savvy',
    cost: 1,
    trees: ['Skill'],
    prerequisites: [],
    summary: 'Gain a +3% bonus as a Misc modifier to your Mental skills.',
  },
  {
    name: 'Studious',
    cost: 1,
    trees: ['Skill'],
    prerequisites: [],
    summary: 'Gain a +3% bonus as a Misc modifier to a specific Knowledge Skill.',
  },

  // -------------------------------------------------------------------------
  // Common Talents — Combat Talents
  // -------------------------------------------------------------------------
  {
    name: 'Armored and Mounted',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'The rider does not suffer any penalties to Ride due to any type of armor.',
  },
  {
    name: 'Blind Fight',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'In melee, any time you miss because of Blindness, you may reroll your miss chance once for another chance to hit.',
  },
  {
    name: 'Charge',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: "Once per round, move an additional 10' and attempt a Heroic Action during a Move Action.",
  },
  {
    name: 'Cleave',
    cost: 2,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Once per round, when you deal enough damage to disable an enemy (usually HP below 0 or killed), immediately gain an extra melee attack against another creature within reach using the same weapon and base weapon skill; no movement before the extra attack.',
  },
  {
    name: 'Cleave, Relentless',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [['Cleave']],
    summary: 'There is no limit to the number of times you can Cleave in a round.',
  },
  {
    name: 'Death from Above',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'When attacking from a position above your target (horseback, tree, elevated surface), gain +2 to any damage you inflict with melee or ranged weapons.',
  },
  {
    name: 'Dual Wield',
    cost: 2,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Once per round, fight with two medium or light weapons with a -10% to-hit penalty on both attacks.',
  },
  {
    name: 'Expanded Critical',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'Increase the critical success range of all weapon skills by 1 percentage point.',
  },
  {
    name: 'Expert Handling',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'Ignore any negative damage modifiers due to SIZ on small and medium weapon damage.',
  },
  {
    name: 'Far Shot',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Projectile weapon (e.g. bow) range is multiplied by 1.5; thrown weapon range is doubled.',
  },
  {
    name: 'Feint',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      "Confuse an adjacent opponent: on a successful Heroic Action (Acrobatics vs Spot), the opponent's next Parry or Dodge becomes Difficult.",
  },
  {
    // data note: doc text says "choose the highest roll" — known direction bug
    // (d100 roll-under: lower is better). Encoded as lower (better), pending doc fix.
    name: 'Grappler',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Roll 2d100 and choose the lower (better) roll whenever engaged in grappling, tripping, or feats of strength against another.',
  },
  {
    name: 'Guardian',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'As a reaction, use one of your defensive skills on a person or creature adjacent to you.',
  },
  {
    name: 'Improved Initiative',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'Gain a +4 bonus to your initiative.',
  },
  {
    name: 'Knife Expert',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Make 2 attacks with a dagger, knife, or stiletto instead of one for your standard action attack per round.',
  },
  {
    name: 'Knock Down',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'Gain +3% on any attempt to knock over a foe.',
  },
  {
    name: 'Marksman',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'Ranged attacks with a bow or crossbow add 1d4 damage.',
  },
  {
    name: 'Multi-Shot',
    cost: 2,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Once per round as a Standard Action, fire two arrows in a single shot at one opponent; both arrows use the same attack roll (at -10%) and deal normal damage. Range 60 ft.',
  },
  {
    name: 'Nimble',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Once per round, when leaving an area that would normally provoke an attack of opportunity, you avoid that attack of opportunity.',
  },
  {
    // data note: effect unencodable as written — "attacks of opportunity per round equal
    // to your Dex" references the raw DEX characteristic; summarized as written.
    name: 'Opportunistic',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'You may make additional attacks of opportunity per round equal to your Dex.',
  },
  {
    name: 'Over-Extended Attack',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Add an additional 1d6 damage to a successful melee hit, but you also take the same damage as you strain your body in the attack.',
  },
  {
    name: 'Point Blank Shot',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'You suffer no penalties for firing while engaged in melee.',
  },
  {
    name: 'Riposte',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'After a successful Parry with a small or medium melee weapon, you get a single reactive attack.',
  },
  {
    name: 'Shield Bash',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'As a Free Action, attempt to knock an adjacent opponent prone with a shield as a Heroic Action (Shield skill vs DEX or STR); on success, knock them down and do 1d4 damage.',
  },
  {
    name: 'Sidestep',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      "If an opponent misses you with an attack, as a Reaction you can move 5'; this does not provoke an attack of opportunity.",
  },
  {
    name: 'Sprint',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'As a single Move Action per round, move double your normal movement speed without suffering a skill penalty.',
  },
  {
    name: 'Stunning Strike',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Take a -25% penalty to an attack roll; if the attack succeeds, the opponent is Stunned for one round (a successful Stamina check downgrades the stun to dazed).',
  },
  {
    name: 'Take a Hit',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'Your natural AV is increased by 1.',
  },
  {
    name: 'Taunt',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      "As a Free Action, taunt an opponent into focusing on you for 1 round; requires a successful Persuade Heroic Action against the opponent's Spirit.",
  },
  {
    name: 'Toughness',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'Gain a +8 bonus to Max HP.',
  },
  {
    name: 'Weapon Dexterity',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Use your DEX instead of STR when calculating your Damage Modifier with small and medium melee weapons and ranged weapons.',
  },
  {
    name: 'Weapon Expertise',
    cost: 1,
    trees: ['Combat'],
    prerequisites: [],
    summary: 'Gain +1 to the damage of a specific weapon.',
  },
  {
    name: 'Whirlwind Attack',
    cost: 2,
    trees: ['Combat'],
    prerequisites: [],
    summary:
      'Once per round, attack all those within melee range with your standard weapon skill rating; roll dice per target, with a -5% attack penalty against every target after the first.',
  },

  // -------------------------------------------------------------------------
  // Common Talents — Magic Talents
  // -------------------------------------------------------------------------
  {
    name: 'Enlarge Spell',
    cost: 1,
    trees: ['Magic'],
    prerequisites: [],
    summary: 'Double the range of a spell by doubling its mana cost.',
  },
  {
    name: 'Extend Spell',
    cost: 1,
    trees: ['Magic'],
    prerequisites: [],
    summary: 'Double the duration of a spell by doubling its mana cost.',
  },
  {
    name: 'Focused Ravaging',
    cost: 1,
    trees: ['Magic'],
    prerequisites: [],
    summary:
      "Focus where a ravaging spell's energy comes from, dealing the spell's mana cost in damage to a target within 30 ft on a successful Heroic Action (Spellcraft skill vs ACU save); otherwise the energy comes from the surrounding land and creatures.",
  },
  {
    name: 'Hidden Spell',
    cost: 1,
    trees: ['Magic'],
    prerequisites: [],
    summary:
      'Cast a spell with just your mind for 1 additional mana; enemies need a Difficult Spot check to recognize you are casting, and Spell Sight against it is Difficult.',
  },
  {
    name: 'Magical Aptitude',
    cost: 1,
    trees: ['Magic'],
    prerequisites: [],
    summary: 'Gain a +3% bonus as a Misc modifier to your Spellcraft skill.',
  },
  {
    name: 'Maximize Spell',
    cost: 1,
    trees: ['Magic'],
    prerequisites: [],
    summary:
      'Triple the mana cost of a spell to maximize all its numeric effects (e.g. 1d6 damage becomes 6).',
  },
  {
    name: 'Resilient Spell',
    cost: 2,
    trees: ['Magic'],
    prerequisites: [],
    summary: 'All checks made to resist or avoid your spells are Difficult.',
  },
  {
    name: 'Spell Penetration',
    cost: 1,
    trees: ['Magic'],
    prerequisites: [],
    summary: "Gain a +5% bonus to rolls against a creature's spell resistance.",
  },
  {
    name: 'Spell Reach',
    cost: 1,
    trees: ['Magic'],
    prerequisites: [],
    summary: 'Cast a touch-based buff spell on a target within 30 ft.',
  },

  // -------------------------------------------------------------------------
  // Common Talents — Special Talents
  // -------------------------------------------------------------------------
  {
    name: 'Animal Affinity',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary: 'Gain a +10% bonus to all Persuade checks with animals.',
  },
  {
    name: 'Animal Companion',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary:
      'Bond with a loyal animal follower who understands your commands; typical of its species but can improve as you gain experience.',
  },
  {
    name: 'Dazeless',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary: 'Mind-controlling spells are Difficult against you.',
  },
  {
    name: 'Fast Healing',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary:
      'Regain double the normal hit points at rest and recover an additional +3 HP from all magical healing.',
  },
  {
    name: 'Fleet of Foot',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary: 'In a chosen terrain you are not affected by difficult ground.',
  },
  {
    name: 'Forager',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary: 'Once per day when in the wilderness, reroll one skill check.',
  },
  {
    name: 'Heavy Sleeper',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary: 'You can sleep and rest while wearing your armor.',
  },
  {
    name: 'In This Together',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary:
      'As a free action, spend 2 Spirit Points to give a companion a 1d6 bonus to their Horror roll.',
  },
  {
    name: 'Mythic Heroic Action',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary: 'Gain a +10% bonus to any Heroic Action.',
  },
  {
    name: 'Second Wind',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary: 'Once per day, as a free action, regain 1d8+3 Hit Points.',
  },
  {
    name: 'Wild Empathy',
    cost: 1,
    trees: ['Special'],
    prerequisites: [],
    summary:
      'Improve the attitude of an animal: in combat, a successful Persuade Heroic Action stops a hostile animal from attacking or viewing you as a threat for 1 round; out of combat, persuade an animal to follow directions or leave you alone at SG discretion.',
  },
];
