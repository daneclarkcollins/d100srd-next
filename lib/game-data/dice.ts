/**
 * Dice expression parser/roller for SagaBorn D100 game data.
 * Supports: "3d6", "1d4+1", "2d6+6", "1d3", "12d4", "1d4x10+20", flat "40".
 */

export interface ParsedDice {
  count: number;
  sides: number;
  multiplier: number;
  bonus: number;
}

const DICE_RE = /^(\d+)d(\d+)(?:x(\d+))?([+-]\d+)?$/i;

export function parseDice(expr: string): ParsedDice | null {
  const trimmed = expr.trim().replace(/\s+/g, '');
  if (/^\d+$/.test(trimmed)) {
    return { count: 0, sides: 0, multiplier: 1, bonus: parseInt(trimmed, 10) };
  }
  const m = DICE_RE.exec(trimmed);
  if (!m) return null;
  return {
    count: parseInt(m[1], 10),
    sides: parseInt(m[2], 10),
    multiplier: m[3] ? parseInt(m[3], 10) : 1,
    bonus: m[4] ? parseInt(m[4], 10) : 0,
  };
}

export function rollDice(expr: string, rng: () => number = Math.random): number {
  const d = parseDice(expr);
  if (!d) throw new Error(`Unparseable dice expression: "${expr}"`);
  let total = 0;
  for (let i = 0; i < d.count; i++) total += Math.floor(rng() * d.sides) + 1;
  return total * d.multiplier + d.bonus;
}

export function diceRange(expr: string): [number, number] {
  const d = parseDice(expr);
  if (!d) throw new Error(`Unparseable dice expression: "${expr}"`);
  return [d.count * d.multiplier + d.bonus, d.count * d.sides * d.multiplier + d.bonus];
}

export function d100(rng: () => number = Math.random): number {
  return Math.floor(rng() * 100) + 1;
}
