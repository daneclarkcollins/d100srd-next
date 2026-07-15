/**
 * SagaBorn D100 game data — single import surface.
 * Run `npm run validate:data` after any data change.
 */
export * from './types';
export * from './rules';
export * from './dice';
export { SKILLS } from './skills';
export { TALENTS } from './talents';
export { SPECIES } from './species';
export { LIFEPATH_TABLES } from './lifepath';
export { PROFESSIONS } from './professions';
export { SPELLS } from './spells';
export { WEAPONS, ARMOR, GEAR, SHIELDS, AMMUNITION, MOUNTS, VEHICLES, SIEGE_WEAPONS } from './equipment';
export { CREATURES, CREATURE_TIERS, ENCOUNTER_DIFFICULTY, difficultyFor } from './creatures';
export type { CreatureStatBlock } from './creatures';
