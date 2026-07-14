/**
 * SagaBorn D100 — Lifepath tables
 *
 * Source: 002 Creating a Character (2026-07-14 doc pull) + errata 2026-07-13.
 * RULE OF PRECEDENCE: errata wins over chapter text.
 *  - errata Part 1 #9 / 7-14 correction: Mystic added to the Profession chart at 96
 *    (Very Rare, Mage) — the rebuilt d100 ranges below are copied from the doc.
 *  - errata Part 2: F3 rows 6-7 branch to F6 (fixed in doc); F6 overlap fixed
 *    (now 1-2 / 3-4 / 5-6 / 7-10); age is narrative only, no bonuses;
 *    Anarvari is the correct spelling (E1/E2 unified).
 *  - errata Part 1 #10: "All characters start with one craft skill at 40%" (CR01
 *    intro) is a house rule slated for deletion — the table itself stands.
 * All row ranges verified to cover each table's die with no gaps or overlaps;
 * any remaining printed quirks are flagged with `// data note:` comments.
 */

import type { LifepathTable } from './types';

export const LIFEPATH_TABLES: LifepathTable[] = [
  // -------------------------------------------------------------------------
  // Species lifepath
  // -------------------------------------------------------------------------
  {
    id: 'L1',
    title: 'Species Lifepath',
    die: '1d10',
    rows: [
      { roll: [1, 6], result: 'Terian: species born and evolved in Atheles.', next: 'LT1' },
      { roll: [7, 9], result: 'Fey: species originating from other worlds.', next: 'F1' },
      { roll: [10, 10], result: 'Elven: a specific species originating from another place, though conflicting origin myths abound.', next: 'E1' },
    ],
  },
  {
    id: 'LT1',
    title: 'Terian Biology',
    die: '1d10',
    appliesTo: ['Terian'],
    rows: [
      { roll: [1, 7], result: 'Teran: the most common biology in Atheles, resilient and skilled.', next: 'LT2' },
      { roll: [8, 9], result: 'Dworven: the oldest people of Atheles — stout, strong, and ingenious crafters.', next: 'LT3' },
      { roll: [10, 10], result: 'Dweran: a person of both Teran and Dworven descent.', next: 'LT4' },
    ],
  },
  {
    id: 'LT2',
    title: 'Teran Cultural Background',
    die: '1d12',
    appliesTo: ['Teran', 'Dweran'],
    rows: [
      { roll: [1, 1], result: 'Tiren: the Kingdom of the Rising Sun — an open-minded but militaristic culture.', next: 'LT5' },
      { roll: [2, 2], result: 'Uthgard: the Dragon Kingdom — a center of learning and engineering with a long history of nationalism and invasion.', next: 'LT5' },
      { roll: [3, 3], result: 'Free Lands: pockets of city-states or nomad tribes left on their own since the Great War.', next: 'LT5' },
      { roll: [4, 4], result: 'Wastelands: the magic-blasted lands of the old Aradan Kingdom, home to vicious beasts and nomad tribes.', next: 'LT5' },
      { roll: [5, 5], result: 'Endamas: the kingdom of the Westlands, ruled from the fortress city of Bordon by an elected king and parliament.', next: 'LT5' },
      { roll: [6, 6], result: 'Ish: the Great Empire of Ish — prosperous, but the government holds an iron fist over those who practice magic.', next: 'LT5' },
      { roll: [7, 7], result: 'Mideon: grasslands of many smaller struggling kingdoms, home to the border keeps holding the beasts of the North at bay.', next: 'LT5' },
      { roll: [8, 8], result: 'Norhan: a kingdom ruled by the Council in Seahaven — a stable life in a land of abundance.', next: 'LT5' },
      { roll: [9, 9], result: 'Vanad: the island kingdom known for its fierce people and seafaring, ruled by families struggling for power.', next: 'LT5' },
      { roll: [10, 10], result: 'Nomad: traveling tribes seeking food and other resources in the empty lands of Atheles.', next: 'LT5' },
      { roll: [11, 11], result: 'Zhou: the Eastern continent over the Inner Sea, trading with and migrating to Atheles for hundreds of years.', next: 'LT5' },
      // data note: row 12 first re-rolls L1 for the foster culture (Terian result = Dworven culture), then proceeds to LT5.
      { roll: [12, 12], result: 'A non-teran culture: biologically teran but raised among another species — roll or choose on Table L1 (a Terian result means a Dworven culture), then that species’ culture chart.', next: 'LT5' },
    ],
  },
  {
    id: 'LT3',
    title: 'Dworven Culture',
    die: '1d10',
    appliesTo: ['Dworv', 'Dweran'],
    rows: [
      { roll: [1, 6], result: 'Free dworv: rejects the religious structure of Greyhelm society; often lives in teran settlements or nomadic families.', next: 'LT5' },
      { roll: [7, 9], result: 'Greyhelm dworv: the religious dworves of the mountains in the kingdom of Greyhelm, isolated until recently.', next: 'LT5' },
      { roll: [10, 10], result: 'Dragon dworv: the hairless dworves of the far South, named for their constant struggle against dragon-like creatures.', next: 'LT5' },
    ],
  },
  {
    id: 'LT4',
    title: 'Dweran Culture',
    die: '1d10',
    appliesTo: ['Dweran'],
    rows: [
      { roll: [1, 8], result: 'Teran Culture: you grew up in a teran community.', next: 'LT2' },
      { roll: [9, 10], result: 'Dworven Culture: rarely, dwerans grow up in dworven communities.', next: 'LT3' },
    ],
  },
  {
    id: 'LT5',
    title: 'Terian Heritage Bonus',
    die: '1d10',
    appliesTo: ['Teran', 'Dworv', 'Dweran'],
    rows: [
      { roll: [1, 3], result: 'Craftsman: gain +3% in Craft (Any).', next: 'PROFESSION', bonus: { skill: 'Craft', specialty: 'Any', amount: 3 } },
      { roll: [4, 7], result: 'Skilled: gain 5 personal points to spend on skills.', next: 'PROFESSION', bonus: { note: '+5 personal skill points' } },
      { roll: [8, 10], result: 'Wanderer: gain +3% to Survival; once per day, reroll a failed Knowledge check.', next: 'PROFESSION', bonus: { skill: 'Survival', amount: 3, note: 'once per day, reroll a failed Knowledge check' } },
    ],
  },
  // -------------------------------------------------------------------------
  // Fey lifepath
  // -------------------------------------------------------------------------
  {
    id: 'F1',
    title: 'Fey Biology',
    die: '1d10',
    appliesTo: ['Fey'],
    rows: [
      { roll: [1, 6], result: 'Elfling.', next: 'F2' },
      { roll: [7, 8], result: 'Feral elfling.', next: 'F3' },
      { roll: [9, 9], result: 'Faun.', next: 'F4' },
      { roll: [10, 10], result: 'Orog.', next: 'F5' },
    ],
  },
  {
    id: 'F2',
    title: 'Elfling Background',
    die: '1d10',
    appliesTo: ['Elfling'],
    rows: [
      { roll: [1, 4], result: 'Tallgarden: a strong, peaceful elfling community with close ties to the terans in nearby Kowal.', next: 'F6' },
      { roll: [5, 8], result: 'The Vale: the rolling hills and mound homes of the idyllic Western lands.', next: 'F6' },
      { roll: [9, 10], result: 'Nomad: a rootless elfling family carried across all the lands by wanderlust.', next: 'F6' },
    ],
  },
  {
    id: 'F3',
    title: 'Feral Elfling Background',
    die: '1d10',
    appliesTo: ['Feral Elfling'],
    rows: [
      { roll: [1, 5], result: 'Your people returned from the In-Between to the North two decades ago; mostly reacclimated but with trouble adjusting to civilization.', next: 'F6' },
      // errata Part 2: rows 6-7 branch to F6 (was misprinted before the fix)
      { roll: [6, 7], result: 'Your people returned to Atheles in the Wastelands of the South, barely less dangerous than the In-Between.', next: 'F6' },
      { roll: [8, 9], result: 'Your people recently returned from the In-Between and are unfamiliar with this strange land known only from legends.', next: 'F6' },
      { roll: [10, 10], result: 'You returned very recently, alone, hungry, and afraid of these strange new lands.', next: 'F6' },
    ],
  },
  {
    id: 'F4',
    title: 'Faun Background',
    die: '1d10',
    appliesTo: ['Faun'],
    rows: [
      { roll: [1, 5], result: 'Sylvan: your family was isolated deep in the mountain forests during the Disappearance, unfamiliar with the outside world.', next: 'F6' },
      { roll: [6, 8], result: 'Warband: your family fought in the Great War before being trapped in the In-Between, where its fierce side emerged.', next: 'F6' },
      { roll: [9, 10], result: 'Nomad: your tribe spent the centuries traveling the limbo of the In-Between and has continued its nomadic lifestyle.', next: 'F6' },
    ],
  },
  {
    id: 'F5',
    title: 'Orog Background',
    die: '1d10',
    appliesTo: ['Orog'],
    rows: [
      { roll: [1, 4], result: 'Ten Towns: a settlement in Ish known for its high Orog population.', next: 'F6' },
      { roll: [5, 8], result: 'Wastelands: a tribe in the Wastes, traveling out to seek a better life.', next: 'F6' },
      { roll: [9, 10], result: 'Outcast: you were outcast from your homeland.', next: 'F6' },
    ],
  },
  {
    id: 'F6',
    title: 'Views of Other Species',
    die: '1d10',
    appliesTo: ['Elfling', 'Feral Elfling', 'Faun', 'Orog'],
    rows: [
      // errata Part 2: F6 overlap fixed — ranges below are the corrected printing
      { roll: [1, 2], result: 'Isolationist: other cultures bring trouble on themselves with war and violence; best to be left alone.', next: 'F7' },
      { roll: [3, 4], result: 'Hurt: you have been affected by the violence of others and hold a grudge.', next: 'F7' },
      { roll: [5, 6], result: 'Optimist: fauns and other cultures, especially terans, should work together.', next: 'F7' },
      { roll: [7, 10], result: 'Mindful: you judge every other creature by its own merits.', next: 'F7' },
    ],
  },
  {
    id: 'F7',
    title: 'Fey Heritage Bonus',
    die: '1d10',
    appliesTo: ['Elfling', 'Feral Elfling', 'Faun', 'Orog'],
    rows: [
      { roll: [1, 3], result: 'Ancient fey: mind-influencing spells are difficult against you; may use the spell Animal Friend as a Standard Action.', next: 'PROFESSION', bonus: { note: 'Mind-influencing spells are difficult against you; may use Animal Friend as a Standard Action' } },
      { roll: [4, 7], result: 'Chaos fey: you are fearless; fear-based spells are difficult against you.', next: 'PROFESSION', bonus: { note: 'Fearless; fear-based spells are difficult against you' } },
      { roll: [8, 10], result: 'Wasteland fey: gain +3% to Survival (Misc. Mod.).', next: 'PROFESSION', bonus: { skill: 'Survival', amount: 3, note: 'Misc. Mod.' } },
    ],
  },
  // -------------------------------------------------------------------------
  // Elven lifepath
  // -------------------------------------------------------------------------
  {
    id: 'E1',
    title: 'Elven Background',
    die: '1d6',
    appliesTo: ['Elf'],
    rows: [
      { roll: [1, 1], result: 'Losvari, the lost elves: fought in the Great War for Aradan, trapped in the In-Between, and just recently returned.', next: 'E2' },
      { roll: [2, 2], result: 'Anarvari, the wilde elves: mainly found in the bushlands between Ish and Endamas; some tribes have migrated to the Wastelands and further north.', next: 'E2' },
      { roll: [3, 3], result: 'Kaelvari, the forest elves: the western wood elves, whose Disappearance was more peaceful than most.', next: 'E2' },
      { roll: [4, 4], result: 'Alostrovari, the sea elves: rare in the East, but found along the Western coast of the Inner Sea.', next: 'E2' },
      { roll: [5, 5], result: 'Evantari, the high elves: believe themselves above the others; no Eastern settlements, but some hunt the Orovari here.', next: 'E2' },
      { roll: [6, 6], result: 'Orovari, the dark elves: pale-skinned elves at odds with the other elven cultures; since the Return they have united the clans and migrated south.', next: 'E2' },
    ],
  },
  {
    id: 'E2',
    title: 'Elven Heritage Bonus',
    die: '1d6',
    appliesTo: ['Elf'],
    rows: [
      { roll: [1, 1], result: 'Alostrovari: Seafaring — once per day, when on a boat, you may reroll a skill check.', next: 'PROFESSION', bonus: { note: 'Once per day, when on a boat, reroll a skill check' } },
      { roll: [2, 2], result: 'Anarvari: Forager — once per day, when in the wilderness, you may reroll a skill check.', next: 'PROFESSION', bonus: { note: 'Once per day, when in the wilderness, reroll a skill check' } },
      { roll: [3, 3], result: 'Evantari: Dazeless — mind-controlling spells are difficult against you.', next: 'PROFESSION', bonus: { note: 'Mind-controlling spells are difficult against you' } },
      { roll: [4, 4], result: 'Kaelvari: Fleet of Foot — in the forest, you move across difficult terrain at normal speed.', next: 'PROFESSION', bonus: { note: 'In the forest, move across difficult terrain at normal speed' } },
      { roll: [5, 5], result: 'Losvari: Demon Sense — +10% knowledge checks about the Navirim, the In-Between, and its inhabitants.', next: 'PROFESSION', bonus: { skill: 'Knowledge', amount: 10, note: 'Checks about the Navirim, the In-Between, and its inhabitants' } },
      { roll: [6, 6], result: 'Orovari: gain +3% to Survival (Misc. Mod.) and +3% knowledge checks about nature.', next: 'PROFESSION', bonus: { skill: 'Survival', amount: 3, note: 'Misc. Mod.; also +3% Knowledge checks about nature' } },
    ],
  },
  // -------------------------------------------------------------------------
  // Profession and Archetype
  // -------------------------------------------------------------------------
  {
    id: 'PROFESSION',
    title: 'Profession Lifepath',
    die: '1d100',
    rows: [
      // Mystic at 96 per errata #9 — ranges copied from the doc's rebuilt table.
      { roll: [1, 4], result: 'Crafter' },
      { roll: [5, 8], result: 'Farmer' },
      { roll: [9, 12], result: 'Herder' },
      { roll: [13, 23], result: 'Hunter' },
      { roll: [24, 36], result: 'Laborer' },
      { roll: [37, 42], result: 'Servant' },
      { roll: [43, 48], result: 'Soldier' },
      { roll: [49, 55], result: 'Warrior' },
      { roll: [56, 57], result: 'Beggar' },
      { roll: [58, 61], result: 'Criminal' },
      { roll: [62, 62], result: 'Detective' },
      { roll: [63, 65], result: 'Entertainer' },
      { roll: [66, 69], result: 'Explorer' },
      { roll: [70, 72], result: 'Gambler' },
      { roll: [73, 74], result: 'Lawkeeper / Guard' },
      { roll: [75, 75], result: 'Merchant' },
      { roll: [76, 76], result: 'Politician' },
      { roll: [77, 77], result: 'Priest' },
      { roll: [78, 78], result: 'Sailor' },
      { roll: [79, 79], result: 'Scholar' },
      { roll: [80, 80], result: 'Thief' },
      { roll: [81, 83], result: 'Artist' },
      { roll: [84, 86], result: 'Athlete' },
      { roll: [87, 90], result: 'Spy' },
      { roll: [91, 92], result: 'Assassin' },
      { roll: [93, 94], result: 'Mage' },
      { roll: [95, 95], result: 'Monster Hunter' },
      { roll: [96, 96], result: 'Mystic' }, // errata #9: Mystic, Very Rare, Mage
      { roll: [97, 97], result: 'Noble' },
      { roll: [98, 98], result: 'Occultist' },
      { roll: [99, 100], result: 'Witch Hunter' },
    ],
  },
  {
    id: 'ARCHETYPE',
    title: 'Archetype',
    die: '1d10',
    rows: [
      { roll: [1, 5], result: 'Warrior — you may not be trained, but you have a strong arm and know how to defend yourself. (Common)' },
      { roll: [6, 9], result: 'Expert — you may be a craftsperson or a farmer; your abilities lie in skill. (Common)' },
      { roll: [10, 10], result: 'Mage — a user of magic, rare and often mistrusted. (Rare)' },
    ],
  },
  // -------------------------------------------------------------------------
  // History lifepath
  // -------------------------------------------------------------------------
  {
    id: 'H1',
    title: 'Friends and Enemies — most important person in your early life',
    die: '1d6',
    rows: [
      { roll: [1, 1], result: 'Family' },
      { roll: [2, 2], result: 'Friend' },
      { roll: [3, 3], result: 'Enemy' },
      { roll: [4, 4], result: 'Mentor' },
      { roll: [5, 5], result: 'Religious Figure' },
      { roll: [6, 6], result: 'Political Figure' },
    ],
  },
  {
    id: 'H2',
    title: 'Family — where is your family now?',
    die: '1d6',
    rows: [
      { roll: [1, 1], result: 'They are wealthy and powerful.' },
      { roll: [2, 2], result: 'They have a bountiful life and security.' },
      { roll: [3, 3], result: 'They have lost everything and search for ways to survive.' },
      { roll: [4, 4], result: 'They make enough to scrape by, but are happy and supportive.' },
      { roll: [5, 5], result: 'They are no longer of this world.' },
      { roll: [6, 6], result: 'I do not know my family.' },
    ],
  },
  // -------------------------------------------------------------------------
  // Religion
  // -------------------------------------------------------------------------
  {
    id: 'R1',
    title: 'Religious Belief',
    die: '1d10',
    rows: [
      { roll: [1, 3], result: 'Monotheistic' },
      { roll: [4, 7], result: 'Polytheistic' },
      { roll: [8, 10], result: 'Agnostic' },
    ],
  },
  {
    id: 'R2',
    title: 'Patron Deity',
    die: '1d20',
    rows: [
      { roll: [1, 2], result: 'The Creator: maker of the universe' },
      { roll: [3, 4], result: 'Tanthias: god of order and light' },
      { roll: [5, 5], result: 'Arias: goddess of love' },
      { roll: [6, 7], result: 'Lunare: goddess of nature' },
      { roll: [8, 9], result: 'Sartas: god of travelers' },
      { roll: [10, 10], result: 'Rindlebok: the trickster' },
      { roll: [11, 12], result: 'Rom: god of war' },
      { roll: [13, 13], result: 'Volinus: god of weather' },
      { roll: [14, 14], result: 'Moorukk: god of death' },
      { roll: [15, 16], result: 'Trund: god of the earth and forge' },
      { roll: [17, 17], result: 'Claravis: goddess of magic' },
      { roll: [18, 18], result: 'Arcist: god of magic' },
      { roll: [19, 19], result: 'Kala: goddess of fate' },
      { roll: [20, 20], result: 'Orum: god of time' },
    ],
  },
  // -------------------------------------------------------------------------
  // Magic attitude
  // -------------------------------------------------------------------------
  {
    id: 'MAGIC',
    title: 'Attitude Toward Magic',
    die: '1d10', // Dworvs add +4 to the roll; elves, fauns, and elflings (incl. feral) do not roll
    appliesTo: ['Teran', 'Dworv', 'Dweran', 'Orog'],
    rows: [
      { roll: [1, 2], result: 'You are afraid of magic. The thought seems alien and chills you to your core.' },
      { roll: [3, 4], result: 'You are opposed to magic and its use; magic is an abomination that should be weeded out and destroyed.' },
      { roll: [5, 6], result: 'Magic makes you uncomfortable.' },
      { roll: [7, 9], result: 'Magic has not been part of your life, so you have little opinion about it.' },
      { roll: [10, 14], result: 'You are open-minded about magic and those who use it.' }, // printed as "10+"; 14 = max with the dworv +4 modifier
    ],
  },
  // -------------------------------------------------------------------------
  // Age (narrative only — errata Part 2: no bonuses or drawbacks)
  // -------------------------------------------------------------------------
  {
    id: 'AGE',
    title: 'Age',
    die: '1d10',
    rows: [
      { roll: [1, 1], result: 'Young: you are a teenager of your species.' },
      { roll: [2, 6], result: 'Young adult: you have passed into adulthood, but are still young for your species.' },
      { roll: [7, 9], result: 'Adult: you are of an average age for your species.' },
      { roll: [10, 10], result: 'Elder: you are old for your species.' },
    ],
  },
  // -------------------------------------------------------------------------
  // Passions (optional)
  // -------------------------------------------------------------------------
  {
    id: 'P1',
    title: 'Passions',
    die: '1d10',
    rows: [
      // data note: row 1 is printed "Devotion (Diety). See Table R1" — R1 is the belief
      // table; the deity table is R2. Encoded as printed.
      { roll: [1, 1], result: 'Devotion (Deity).', next: 'R1' },
      { roll: [2, 3], result: 'Fear (type or individual).', next: 'PF1' },
      { roll: [4, 5], result: 'Hate (group or individual).', next: 'IG1' },
      { roll: [6, 6], result: 'Honor' },
      { roll: [7, 8], result: 'Love (group or individual).', next: 'IG1' },
      { roll: [9, 10], result: 'Loyalty (group or place).', next: 'PL1' },
    ],
  },
  {
    id: 'PF1',
    title: 'Fears',
    die: '1d20',
    rows: [
      { roll: [1, 1], result: 'Darkness' },
      { roll: [2, 2], result: 'Fire' },
      { roll: [3, 3], result: 'Water (drowning, being on boats, rivers, etc.)' },
      { roll: [4, 4], result: 'Heights' },
      { roll: [5, 5], result: 'Confined Spaces' },
      { roll: [6, 6], result: 'Dying' },
      { roll: [7, 7], result: 'The Dead' },
      { roll: [8, 8], result: 'Storms' },
      { roll: [9, 9], result: 'Rodents' },
      { roll: [10, 10], result: 'Insects' },
      { roll: [11, 11], result: 'Snakes' },
      { roll: [12, 12], result: 'Magic' },
      { roll: [13, 13], result: 'God/Gods' },
      { roll: [14, 14], result: 'Pain' },
      { roll: [15, 15], result: 'Demons/Navirites' },
      { roll: [16, 16], result: 'Horses' },
      { roll: [17, 17], result: 'Underground' },
      { roll: [18, 18], result: 'Birds' },
      { roll: [19, 19], result: 'Being Lost' },
      { roll: [20, 20], result: 'Flying' },
    ],
  },
  {
    id: 'IG1',
    title: 'Individuals and Groups',
    die: '1d20',
    rows: [
      { roll: [1, 1], result: 'Family' },
      { roll: [2, 2], result: 'Mother' },
      { roll: [3, 3], result: 'Father' },
      { roll: [4, 4], result: 'Brother' },
      { roll: [5, 5], result: 'Sister' },
      { roll: [6, 6], result: 'Other Family' },
      { roll: [7, 7], result: 'Childhood Friend' },
      { roll: [8, 8], result: 'Family Friend / Acquaintance' },
      { roll: [9, 9], result: 'Boss' },
      { roll: [10, 10], result: 'Lord / Lady' },
      { roll: [11, 11], result: 'King' },
      { roll: [12, 12], result: 'Country' },
      { roll: [13, 13], result: 'Church' },
      { roll: [14, 14], result: 'Institution: School' },
      { roll: [15, 15], result: 'Institution: Company' },
      { roll: [16, 16], result: 'Institution: Group' },
      { roll: [17, 17], result: 'Rival Group' },
      { roll: [18, 18], result: 'Guild' },
      { roll: [19, 19], result: 'Enemy' },
      { roll: [20, 20], result: 'Romantic Partner' },
    ],
  },
  {
    id: 'PL1',
    title: 'Loyalty — Group or Place',
    die: '1d6',
    rows: [
      { roll: [1, 2], result: 'Community.', next: 'PL2' },
      { roll: [3, 4], result: 'Location.', next: 'PL3' },
      { roll: [5, 6], result: 'Individual.', next: 'IG1' },
    ],
  },
  {
    id: 'PL2',
    title: 'Loyalty — Community',
    die: '1d6',
    rows: [
      { roll: [1, 1], result: 'Neighborhood' },
      { roll: [2, 2], result: 'City, Town, or Village' },
      { roll: [3, 3], result: 'Church' },
      { roll: [4, 4], result: 'Guild' },
      { roll: [5, 6], result: 'Adventuring Group' },
    ],
  },
  {
    id: 'PL3',
    title: 'Loyalty — Location',
    die: '1d6',
    rows: [
      { roll: [1, 1], result: 'Neighborhood' },
      { roll: [2, 2], result: 'City, Town, or Village' },
      { roll: [3, 3], result: 'Church' },
      { roll: [4, 4], result: 'Natural Area (Forest, Lake, Mountains, etc.)' },
      { roll: [5, 5], result: 'Country / Kingdom' },
      { roll: [6, 6], result: 'Home' },
    ],
  },
  // -------------------------------------------------------------------------
  // Crafting
  // -------------------------------------------------------------------------
  {
    // data note: the CR01 intro "All characters start with one craft skill at 40%"
    // is a house rule slated for deletion per errata #10; the table itself stands.
    id: 'CR01',
    title: 'Crafting',
    die: '1d8',
    rows: [
      { roll: [1, 1], result: 'Alchemy' },
      { roll: [2, 2], result: 'Blacksmithing' },
      { roll: [3, 3], result: 'Carpentry' },
      { roll: [4, 4], result: 'Cooking' },
      { roll: [5, 5], result: 'Leather Working' },
      { roll: [6, 6], result: 'Poisoner' },
      { roll: [7, 7], result: 'Tinkerer' },
      { roll: [8, 8], result: 'Artificing — only if your character has a mana-giving Talent; if not, reroll.' },
    ],
  },
];
