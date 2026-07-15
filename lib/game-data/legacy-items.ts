/**
 * SagaBorn D100 — Legacy Items (doc 005 §Legacy Items).
 *
 * Permanent magic items are rare in SagaBorn; Legacy Items grow with the hero
 * instead. A hero can hold at most THREE Legacy Items total, gaining a new
 * item (and new powers) at Talent Point Level 4, 7, and 10. Items gain powers
 * based on the hero's TOTAL Talent Point Level, even if the item was gained
 * later. Legacy items do not detect as magic.
 */

export type LegacyItemType = 'attack' | 'defense' | 'focus' | 'wondrous';

export const MAX_LEGACY_ITEMS = 3;

/** TPLs at which a hero gains a new Legacy Item (and items gain new powers). */
export const LEGACY_ITEM_TPLS = [4, 7, 10] as const;

/** TPLs at which existing items unlock further advancements. */
export const LEGACY_POWER_TPLS = [4, 7, 10, 13, 16] as const;

export const LEGACY_ITEM_TYPES: {
  key: LegacyItemType;
  label: string;
  maxOfType: number;
  note?: string;
}[] = [
  { key: 'attack', label: 'Attack (weapon)', maxOfType: 3 },
  { key: 'defense', label: 'Defense (armor)', maxOfType: 1 },
  { key: 'focus', label: 'Magical Focus', maxOfType: 1, note: 'Usable only by mages' },
  { key: 'wondrous', label: 'Wondrous Item', maxOfType: 3 },
];

/** Advancement guidelines per type, keyed by Talent Point Level (doc 005 tables). */
export const LEGACY_ADVANCEMENTS: Record<LegacyItemType, { tpl: number; text: string }[]> = {
  // Melee and Ranged weapon tables are identical in the doc.
  attack: [
    { tpl: 4, text: 'Critical hit range gains 1 point; Special range gains 5 points.' },
    { tpl: 7, text: 'Attacks with this weapon do +1 extra damage and count as magical.' },
    { tpl: 10, text: 'Critical hit range gains an additional 2 points.' },
    { tpl: 13, text: 'Another +1 extra damage; the weapon is unbreakable by mundane means.' },
    { tpl: 16, text: 'Gains an additional tiered ability, or adds +1 to damage.' },
  ],
  defense: [
    { tpl: 4, text: 'Armor skill penalties lowered by 5%.' },
    { tpl: 7, text: 'Immune to acid.' },
    { tpl: 10, text: 'Armor skill penalties lowered by an additional 5% (10% total).' },
    { tpl: 13, text: 'Imbued with a tiered ability.' },
    { tpl: 16, text: 'Unbreakable by mundane means.' },
  ],
  focus: [
    { tpl: 4, text: 'Imbued with a 1-mana spell (buffs self-target only; no dice-pool spells; once per day).' },
    { tpl: 7, text: 'Imbued with a 3-mana spell (same restrictions; once per day).' },
    { tpl: 10, text: 'Item can be called to its owner at any time; imbued with a tiered ability.' },
    { tpl: 13, text: 'Imbued with a 5-mana spell (same restrictions; once per day).' },
    { tpl: 16, text: 'Imbued with a 7-mana spell (same restrictions; once per day).' },
  ],
  wondrous: [
    { tpl: 4, text: 'Imbued with a tiered ability.' },
    { tpl: 7, text: 'Imbued with a 1-mana utility spell (once per day) or a tiered ability.' },
    { tpl: 10, text: 'Imbued with a tiered ability.' },
    { tpl: 13, text: 'Imbued with a 3-mana utility spell (once per day) or a tiered ability.' },
    { tpl: 16, text: 'Unbreakable by mundane means.' },
  ],
};

/** Stackable tiered abilities (doc 005; SG and player may invent more). */
export const LEGACY_TIERED_ABILITIES: string[] = [
  '+1 to Initiative',
  '+5% to saves vs one elemental type (Earth, Fire, Water, Ice, or Electricity)',
  '+5% to Heroic Actions for a specific Characteristic',
  'Infused with Silver, Cold Iron, Tritium, or another special material',
  "Climb Speed +5'",
  "Swim Speed +5'",
  "Movement Speed +5'",
  'Warns of a specific danger (ambushes, traps, a creature type...)',
  'Item resists damage from acid, fire, or water',
];

/** How many Legacy Item slots a hero of the given TPL has unlocked (max 3). */
export function legacySlotsAtTpl(tpl: number): number {
  return LEGACY_ITEM_TPLS.filter((t) => tpl >= t).length;
}
