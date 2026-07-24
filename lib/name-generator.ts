/**
 * SagaBorn D100 — Random name generator.
 *
 * Canon source: doc 002's per-species "Common Names" lists and style notes —
 *  - Teran: "as varied as water drops in the ocean" (Martyn, Rikard, Sundaiya,
 *    Margery, Hurst, Wez)
 *  - Dworv: Dorgen, Remli, Dara, Hogren, Stemp
 *  - Dweran: "often borrow names of their parent heritages" (Grogrem, Val, Semmy)
 *  - Elfling: "shortened as Elflings often have very long names" (Teela, Hass,
 *    Willow, Pherilyn, Espa, Elia, Xyla; long form e.g. Tellasnayalanix)
 *  - Feral Elfling: "tend to only have short names" (Asher, Vex, Nyna, Astar, Belax)
 *  - Faun: Di, Cera, Ella, Jaas, Ora
 *  - Orog: Ooda, Tul, Guo, Ot, Dod, Gue
 *  - Elf: Azera, Ranariel, Entroth, Navarth, Solana, Vindalass, Orfindel, Gilandras
 *
 * Each species gets syllable banks built from that phonology, so generated
 * names sound like they belong next to the canon examples. Occasionally a
 * canon name itself is returned to keep the anchors in circulation.
 * Deterministic when given a seeded rng (same seed → same names).
 */

// ---------------------------------------------------------------------------
// RNG (mulberry32 — the project-standard seeded generator)
// ---------------------------------------------------------------------------

export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(arr: readonly T[], rng: () => number): T =>
  arr[Math.floor(rng() * arr.length)];

// ---------------------------------------------------------------------------
// Species banks
// ---------------------------------------------------------------------------

export type NameSpecies =
  | 'Teran' | 'Dworv' | 'Dweran' | 'Elfling'
  | 'Feral Elfling' | 'Faun' | 'Orog' | 'Elf';

export const NAME_SPECIES: NameSpecies[] = [
  'Teran', 'Dworv', 'Dweran', 'Elfling', 'Feral Elfling', 'Faun', 'Orog', 'Elf',
];

export interface GeneratedName {
  name: string;
  species: NameSpecies;
  /** Extra flavor, e.g. an Elfling's unabbreviated true name. */
  detail?: string;
}

interface Bank {
  canon: readonly string[];
  starts: readonly string[];
  mids: readonly string[];
  ends: readonly string[];
  /** Chance a name gets a middle syllable (0–1). */
  midChance: number;
}

const TERAN: Bank = {
  canon: ['Martyn', 'Rikard', 'Sundaiya', 'Margery', 'Hurst', 'Wez'],
  starts: ['Mar', 'Rik', 'Sun', 'Hur', 'Wez', 'Bran', 'Ced', 'Dav', 'Eld', 'Fen',
    'Gar', 'Hal', 'Jor', 'Kell', 'Lor', 'Mor', 'Ned', 'Per', 'Quin', 'Row',
    'Tam', 'Wil', 'Yor', 'Ans', 'Bet', 'Cor'],
  mids: ['ta', 'da', 'ge', 'ri', 'li', 'mo', 've', 'sa', 'de', 'ny', 'la'],
  ends: ['tyn', 'ard', 'ery', 'ick', 'wyn', 'er', 'eth', 'ald', 'ia', 'ya',
    'en', 'is', 'ott', 'red', 'a', 'yn', 'ess'],
  midChance: 0.35,
};

const DWORV: Bank = {
  canon: ['Dorgen', 'Remli', 'Dara', 'Hogren', 'Stemp'],
  starts: ['Dor', 'Rem', 'Dar', 'Hog', 'Stem', 'Bor', 'Bren', 'Gam', 'Grim',
    'Hild', 'Kaz', 'Mog', 'Nar', 'Ors', 'Rug', 'Thra', 'Vond', 'Bal', 'Dru', 'Skar'],
  mids: ['a', 'o', 'ug', 'ren', 'li'],
  ends: ['gen', 'li', 'ra', 'ren', 'din', 'na', 'rik', 'dur', 'gar', 'sten',
    'dis', 'run', 'brek', 'mund', 'da', 'grim'],
  midChance: 0.2,
};

// Dwerans borrow from both parent heritages, plus homely diminutives (Semmy, Val).
const DWERAN_DIMINUTIVES = ['Sem', 'Val', 'Ned', 'Tob', 'Wen', 'Pip', 'Dob', 'Han', 'Mel', 'Roz'];
const DWERAN_DIM_ENDS = ['my', 'y', 'li', 'da', ''];

const ELFLING: Bank = {
  canon: ['Teela', 'Hass', 'Willow', 'Pherilyn', 'Espa', 'Elia', 'Xyla'],
  starts: ['Tee', 'Hass', 'Wil', 'Pher', 'Es', 'El', 'Xy', 'Nia', 'Tal', 'Fay',
    'Lil', 'Mir', 'Sil', 'Wen', 'Ala', 'Bree', 'Cala', 'Isa'],
  mids: ['ri', 'la', 'lo', 'sa', 'na', 'e'],
  ends: ['la', 'low', 'lyn', 'pa', 'ia', 'a', 'ra', 'li', 'sa', 'wyn', 'ssa', 'el'],
  midChance: 0.25,
};

// Long-form Elfling true names (Tellasnayalanix): 5–7 flowing syllables.
const ELFLING_LONG_SYLLABLES = ['tel', 'la', 'sna', 'ya', 'nix', 'phe', 'ri',
  'lyn', 'es', 'pa', 'wil', 'lo', 'xy', 'el', 'ia', 'tee', 'na', 'sa', 'mi',
  'va', 'lis', 'ara', 'wen'];

const FERAL: Bank = {
  canon: ['Asher', 'Vex', 'Nyna', 'Astar', 'Belax'],
  starts: ['Ash', 'Vex', 'Nyn', 'Ast', 'Bel', 'Kez', 'Rax', 'Syl', 'Dax', 'Fenn',
    'Grix', 'Jyn', 'Krel', 'Mav', 'Ryx', 'Tarn', 'Vyx', 'Zef', 'Skar', 'Wren'],
  mids: [],
  ends: ['er', '', 'a', 'ar', 'ax', 'ix', 'is', 'yn', 'ek', 'o'],
  midChance: 0,
};

const FAUN: Bank = {
  canon: ['Di', 'Cera', 'Ella', 'Jaas', 'Ora'],
  starts: ['Di', 'Ce', 'El', 'Jaa', 'Or', 'Li', 'Ma', 'Na', 'Se', 'Ta', 'Vi',
    'Io', 'Ny', 'Pa', 'Ro', 'Su'],
  mids: [],
  ends: ['ra', 'lla', 's', 'a', 'ri', 'o', 'la', 'ssa', 'ia', 'ne', 'lo'],
  midChance: 0,
};

const OROG: Bank = {
  canon: ['Ooda', 'Tul', 'Guo', 'Ot', 'Dod', 'Gue'],
  starts: ['Ood', 'Tul', 'Gu', 'Ot', 'Dod', 'Gue', 'Mok', 'Brug', 'Dur', 'Gor',
    'Hok', 'Krag', 'Lut', 'Nog', 'Rud', 'Thok', 'Ug', 'Zug', 'Ka', 'Bo'],
  mids: [],
  ends: ['', '', 'a', 'o', 'ug', 'od', 'u'],
  midChance: 0,
};

const ELF: Bank = {
  canon: ['Azera', 'Ranariel', 'Entroth', 'Navarth', 'Solana', 'Vindalass', 'Orfindel', 'Gilandras'],
  starts: ['Az', 'Ran', 'En', 'Nav', 'Sol', 'Vin', 'Orf', 'Gil', 'Ael', 'Cael',
    'Elo', 'Fael', 'Ith', 'Lor', 'Myth', 'Quel', 'Syl', 'Thal', 'Aur', 'Cel'],
  mids: ['a', 'ari', 'tro', 'ar', 'an', 'da', 'in', 'and', 'era', 'ala', 'ith', 'or', 'ie', 'ind'],
  ends: ['ra', 'el', 'th', 'ana', 'ass', 'del', 'ras', 'iel', 'oth', 'wen',
    'dir', 'las', 'mir', 'ion', 'ess'],
  midChance: 0.85,
};

const BANKS: Record<NameSpecies, Bank> = {
  Teran: TERAN,
  Dworv: DWORV,
  Dweran: TERAN, // handled specially below (borrows both heritages)
  Elfling: ELFLING,
  'Feral Elfling': FERAL,
  Faun: FAUN,
  Orog: OROG,
  Elf: ELF,
};

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

const CANON_CHANCE = 0.15;
const clean = (raw: string): string => {
  // Collapse tripled letters at syllable joins ("Vexxx" → "Vexx" → fine at 2)
  let s = raw.replace(/(.)\1\1+/g, '$1$1');
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s;
};

const fromBank = (bank: Bank, rng: () => number): string => {
  const start = pick(bank.starts, rng);
  const mid = bank.mids.length > 0 && rng() < bank.midChance ? pick(bank.mids, rng) : '';
  let end = pick(bank.ends, rng);
  // Avoid a jarring duplicate boundary like "Tee" + "e…"
  const seam = (mid || end).charAt(0);
  if (seam && start.charAt(start.length - 1).toLowerCase() === seam.toLowerCase() && 'aeiou'.includes(seam)) {
    end = end || 'a';
  }
  return clean(start + mid + end);
};

const generateFor = (species: NameSpecies, rng: () => number): GeneratedName => {
  const bank = BANKS[species];
  if (rng() < CANON_CHANCE) {
    return { name: pick(bank.canon, rng), species };
  }

  if (species === 'Dweran') {
    // Borrow a parent heritage's style, or go homely-diminutive
    const roll = rng();
    if (roll < 0.2) {
      return { name: clean(pick(DWERAN_DIMINUTIVES, rng) + pick(DWERAN_DIM_ENDS, rng)), species };
    }
    return { name: fromBank(roll < 0.6 ? TERAN : DWORV, rng), species };
  }

  if (species === 'Elfling') {
    const short = fromBank(ELFLING, rng);
    // Every Elfling has a long true name their short name abbreviates —
    // seed it with the short name's opening sound (up to its first vowel)
    const sylCount = 5 + Math.floor(rng() * 3);
    let long = (short.toLowerCase().match(/^[^aeiouy]*[aeiouy]/)?.[0] ?? short.toLowerCase().slice(0, 2));
    for (let i = 0; i < sylCount; i++) long += pick(ELFLING_LONG_SYLLABLES, rng);
    return { name: short, species, detail: `short for ${clean(long)}` };
  }

  return { name: fromBank(bank, rng), species };
};

/**
 * Generate one name. Pass 'Any' to roll the species too.
 * Deterministic when given a seeded rng (see makeRng).
 */
export function generateName(
  species: NameSpecies | 'Any',
  rng: () => number = Math.random
): GeneratedName {
  const resolved: NameSpecies = species === 'Any' ? pick(NAME_SPECIES, rng) : species;
  // A couple of retries guard against rare degenerate outputs
  for (let i = 0; i < 3; i++) {
    const result = generateFor(resolved, rng);
    if (result.name.length >= 2 && result.name.length <= 14) return result;
  }
  return { name: pick(BANKS[resolved].canon, rng), species: resolved };
}

export function generateNames(
  species: NameSpecies | 'Any',
  count: number,
  rng: () => number = Math.random
): GeneratedName[] {
  const out: GeneratedName[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard++ < count * 20) {
    const n = generateName(species, rng);
    const key = `${n.species}:${n.name}`;
    if (seen.has(key)) continue; // no duplicates within a batch
    seen.add(key);
    out.push(n);
  }
  return out;
}

/** True when a game-data species name has a dedicated bank. */
export function isNameSpecies(s: string): s is NameSpecies {
  return (NAME_SPECIES as string[]).includes(s);
}
