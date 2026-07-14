/**
 * SagaBorn D100 — Playable species (biologies)
 *
 * Source: 002 Creating a Character (2026-07-14 doc pull) + errata 2026-07-13.
 * RULE OF PRECEDENCE: errata wins over chapter text.
 *  - errata Part 1 #5: Feral Elflings have the same SIZ roll as Elflings (1d3+3).
 *  - SIZ rolls per 002 "For SIZ: Elfings roll 1d3+3, Dworvs roll 2d6+4;
 *    Terans, Elves, Fauns, and Dwerans roll 2d6+6, and Orogs 1d3+19."
 *  - Lifespan/adulthood/old-age from the "Average age by Species" table in 002.
 *  - Magic-attitude lifepath: dworvs add +4; elves, fauns, and elflings
 *    (incl. feral) do not roll — their cultures celebrate magic.
 */

import type { Species } from './types';

export const SPECIES: Species[] = [
  {
    name: 'Teran',
    sizRoll: '2d6+6',
    traits: [
      'Thrives in almost all environments; no special abilities or genetics beyond that.',
    ],
    adulthoodAge: 18,
    oldAge: 60,
    lifespan: 65,
    avgHeight: "5'8\"",
    avgWeight: '180 lb',
  },
  {
    name: 'Dworv',
    sizRoll: '2d6+4',
    traits: ["Dark Vision 60'"],
    adulthoodAge: 25,
    oldAge: 125,
    lifespan: 150,
    avgHeight: "4'5\"",
    avgWeight: '195 lb',
    magicAttitudeModifier: 4,
  },
  {
    name: 'Dweran',
    sizRoll: '2d6+6',
    traits: ["Dark Vision 30'"],
    adulthoodAge: 18,
    oldAge: 75,
    lifespan: 85,
    avgHeight: "5'3\"",
    avgWeight: '225 lb',
  },
  {
    name: 'Elfling',
    sizRoll: '1d3+3',
    traits: [
      'Harmed by Cold Iron; steel causes discomfort (soreness, itching, skin irritation) but no damage.',
      "Dark Vision 60'",
    ],
    adulthoodAge: 20,
    oldAge: 110,
    lifespan: 130,
    avgHeight: "3'",
    avgWeight: '65 lb',
    magicAttitudeModifier: 'exempt',
  },
  {
    name: 'Feral Elfling',
    sizRoll: '1d3+3', // errata #5: same SIZ as Elflings
    traits: [
      'Harmed by Cold Iron; wearing or using iron deals 1d4 damage per hour; steel causes discomfort but no real damage.',
      "Dark Vision 60'",
    ],
    adulthoodAge: 18,
    oldAge: 75,
    lifespan: 90,
    avgHeight: "3'",
    avgWeight: '65 lb',
    magicAttitudeModifier: 'exempt',
  },
  {
    name: 'Faun',
    sizRoll: '2d6+6',
    traits: [
      'Harmed by Cold Iron; steel causes discomfort but no real damage.',
      "Dark Vision 60'",
    ],
    adulthoodAge: 20,
    oldAge: 80,
    lifespan: 100,
    avgHeight: "5'6\"", // data note: species header says 5'6"; blurb prose says "about six feet tall" — header value kept
    avgWeight: '155 lb',
    magicAttitudeModifier: 'exempt',
  },
  {
    name: 'Orog',
    sizRoll: '1d3+19',
    traits: [
      'Slower in cold weather (below 40 degrees F): movement is halved.',
      '+1 AV from shell and thick skin.',
      'Almost always classified Large in size.',
    ],
    adulthoodAge: 45,
    oldAge: 120,
    lifespan: 150,
    avgHeight: "7'6\"",
    avgWeight: '400 lb',
  },
  {
    name: 'Elf',
    sizRoll: '2d6+6',
    traits: [
      'Harmed by Cold Iron; wearing or using iron deals 1d4 damage per hour; steel causes discomfort but no real damage.',
      "Dark Vision 60'",
      'Requires little food or water.',
      'Needs only 4 hours of sleep (still requires standard rest to regain health and mana).',
    ],
    adulthoodAge: 40,
    oldAge: 225,
    lifespan: 250,
    avgHeight: "6'6\"",
    avgWeight: '195 lb',
    magicAttitudeModifier: 'exempt',
  },
];
