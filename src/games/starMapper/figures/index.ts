import { CASSIOPEIA } from './cassiopeia';
import { CORONA_BOREALIS } from './corona_borealis';
import { CYGNUS } from './cygnus';
import { GEMINI } from './gemini';
import { LEO } from './leo';
import { LYRA } from './lyra';
import { ORION } from './orion';
import { PEGASUS } from './pegasus';
import { URSA_MAJOR } from './ursa_major';
import { URSA_MINOR } from './ursa_minor';
import type { Creature } from './types';

/** The creatures of the ten easy constellations; the rest show their lines. */
export const CREATURES: ReadonlyMap<string, Creature> = new Map(
  [
    URSA_MAJOR,
    URSA_MINOR,
    CASSIOPEIA,
    ORION,
    CYGNUS,
    LYRA,
    PEGASUS,
    LEO,
    CORONA_BOREALIS,
    GEMINI,
  ].map((c) => [c.id, c]),
);
