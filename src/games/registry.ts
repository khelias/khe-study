/**
 * Game Registry System
 *
 * Centralized registry for all games. This enables:
 * - Zero-touch game addition (just register and it works)
 * - Dynamic game loading
 * - Plugin/package support
 * - Scales to 100+ games
 */

import type { ComponentType } from 'react';
import type { GameConfig, Problem, GeneratorFunction, Direction } from '../types/game';
import type { ContentPackId, SkillId } from '../curriculum/types';

/**
 * Props that all game view components must accept
 */
export interface GameViewProps {
  problem: Problem;
  onAnswer: (isCorrect: boolean) => void;
  soundEnabled: boolean;
  level?: number;
  onMove?: (direction: Direction) => void;
  gameType?: string;
}

/**
 * Validator function type for game answers
 */
export type AnswerValidator = (problem: Problem, userAnswer: unknown) => boolean;

/**
 * Game registry entry
 *
 * Note: Component type uses GameViewProps for type safety.
 * The GameRenderer handles type casting when rendering.
 */
export interface GameRegistryEntry {
  /** Unique game identifier (e.g., 'word_builder') */
  id: string;

  /** React component that renders the game */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>; // Each game has specific problem types, so we use any here

  /** Function that generates problems for this game */
  generator: GeneratorFunction;

  /** Game configuration (from data.ts) */
  config: GameConfig;

  /** Function that validates user answers */
  validator: AnswerValidator;

  /**
   * Curriculum skills this binding practices. Optional during Phase 1
   * migration — mechanics that still import content directly can omit it.
   * Populated for mechanics whose content has moved into `src/curriculum/`.
   */
  skillIds?: SkillId[];

  /**
   * Content pack consumed by this binding's generator. Optional for the
   * same Phase 1 migration reason. When set, the generator can resolve it
   * via `getPackItems(id)` from `src/curriculum/`.
   */
  contentPackId?: ContentPackId;
}

/**
 * Game Registry
 *
 * Central registry for all games. Games register themselves on import.
 */
class GameRegistry {
  private games = new Map<string, GameRegistryEntry>();

  /**
   * Register a game
   */
  register(entry: GameRegistryEntry): void {
    if (this.games.has(entry.id)) {
      console.warn(`[GameRegistry] Game "${entry.id}" is already registered. Overwriting.`);
    }
    this.games.set(entry.id, entry);
  }

  /**
   * Get a game by ID
   */
  get(id: string): GameRegistryEntry | undefined {
    return this.games.get(id);
  }

  /**
   * Get all registered games
   */
  getAll(): GameRegistryEntry[] {
    return Array.from(this.games.values());
  }

  /**
   * Check if a game is registered
   */
  has(id: string): boolean {
    return this.games.has(id);
  }

  /**
   * Get all game IDs
   */
  getIds(): string[] {
    return Array.from(this.games.keys());
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.games.clear();
  }

  /**
   * Get count of registered games
   */
  getCount(): number {
    return this.games.size;
  }
}

/**
 * Singleton game registry instance
 */
export const gameRegistry = new GameRegistry();
