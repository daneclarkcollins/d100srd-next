/**
 * SagaBorn D100 — Conditions ("Effects", doc 008 §Effects).
 *
 * "Effects are conditional modifiers due to actions against the person or
 * creature." Transcribed from the canonical combat chapter; Broken/Impaled
 * apply to items but are listed for completeness.
 */

export interface Condition {
  name: string;
  summary: string;
}

export const CONDITIONS: Condition[] = [
  { name: 'Anxious', summary: 'All skills suffer −10%.' },
  { name: 'Bleeding', summary: 'Take bleed damage per round on your turn.' },
  { name: 'Blinded', summary: 'Cannot see; skills become Difficult if you normally rely on sight.' },
  { name: 'Cowering', summary: 'Frozen in fear; no actions. Easy to hit in combat.' },
  { name: 'Dazed', summary: 'Lose 1 Action per round; attacks against you are Easy.' },
  { name: 'Deafened', summary: 'Cannot hear; the Listen skill is unusable.' },
  { name: 'Disabled', summary: 'Unconscious and losing 1 hit point per round.' },
  { name: 'Entangled', summary: 'Cannot move (or movement halved if partially saved).' },
  { name: 'Fatigued', summary: '1d6 Bane on all rolls per fatigue level (stacks). Lose 1 level per 8 hours of rest.' },
  { name: 'Flanked', summary: 'Enemies on either side with line of sight to each other; all attacks against you are Easy.' },
  { name: 'Nauseated', summary: 'Cannot attack, cast, or concentrate; single move action per turn only.' },
  { name: 'On Fire', summary: '1d6 damage at the start of your turn; a full round action puts it out.' },
  { name: 'Panicked', summary: 'Must flee and hide from the fear source; cannot attack, may dodge/parry.' },
  { name: 'Prone', summary: 'Move action to stand. Attacks against you are Easy; your attacks are Difficult; no dodge, parries Difficult.' },
  { name: 'Scared', summary: 'All skills become Difficult.' },
  { name: 'Shaken', summary: 'All skills suffer −20%.' },
  { name: 'Slowed', summary: 'Half speed; −20% to attack and defensive rolls.' },
  { name: 'Stressed', summary: 'All skills suffer −30%.' },
  { name: 'Stunned', summary: 'No actions. Each round on your turn, a Stamina save ends the stun.' },
];
