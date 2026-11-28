import type { RngFunction } from '../types/game';

/**
 * Creates a deterministic random number generator for testability
 * @param seed - The seed for the RNG (defaults to current timestamp)
 * @returns A function that generates random numbers between 0 and 1
 */
export const createRng = (seed: number = Date.now()): RngFunction => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
};

/** A whole number from `min` to `max`, both included; `min` when the range is empty. */
export const randomInt = (min: number, max: number, rng: RngFunction = Math.random): number => {
  if (max <= min) return min;
  return Math.floor(rng() * (max - min + 1)) + min;
};

/**
 * Gets a random element from an array
 * @param arr - The array to pick from
 * @param rng - Random number generator function (defaults to Math.random)
 * @returns A random element from the array or null if array is empty
 */
export const getRandom = <T>(arr: readonly T[], rng: RngFunction = Math.random): T | null => {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(rng() * arr.length)] ?? null;
};

/**
 * Generates a unique ID using the RNG
 * @param rng - Random number generator function (defaults to Math.random)
 * @returns A short unique ID string (always 9+ characters)
 */
export const uid = (rng: RngFunction = Math.random): string => {
  const parts: string[] = [];

  // Use multiple RNG calls for better entropy
  for (let i = 0; i < 4; i++) {
    const intVal = Math.floor(rng() * 0xffffff);
    parts.push(intVal.toString(36));
  }

  let combined = parts.join('');

  // Ensure minimum length
  let attempts = 0;
  while (combined.length < 9 && attempts < 10) {
    combined += Math.floor(rng() * 0xffffff).toString(36);
    attempts++;
  }

  return combined.slice(0, 11) || Math.random().toString(36).substring(2, 11);
};

/** Shuffles an array in place (Fisher-Yates) and returns it. */
export function shuffle<T>(items: T[], rng: RngFunction): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}
