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
import type {
  GameConfig,
  GameHeaderObjective,
  Problem,
  GeneratorFunction,
  Direction,
} from '../types/game';
import type { ContentPackId, SkillId } from '../curriculum/types';
import type { Translations } from '../i18n';

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
  /** True while a sheet covers the game (the description); a timed game holds its clock. */
  paused?: boolean;
}

/** Translations and profile-aware formatting for text a registry hook builds. */
export interface SessionObjectiveText {
  t: Translations;
  formatText: (text: string) => string;
}

/**
 * Validator function type for game answers
 */
export type AnswerValidator = (problem: Problem, userAnswer: unknown) => boolean;

/**
 * Game registry entry. The optional problem hooks are method signatures so an
 * entry typed for its own problem (`GameRegistryEntry<BalanceScaleProblem>`)
 * is storable as `GameRegistryEntry`; callers only pass problems that the
 * entry's generator produced.
 */
export interface GameRegistryEntry<P extends Problem = Problem> {
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

  /** Curriculum skills this binding practices, when its content lives in `src/curriculum/`. */
  skillIds?: SkillId[];

  /** Content pack the generator resolves via `getPackItems(id)`. */
  contentPackId?: ContentPackId;

  /** Key the engine uses to avoid repeating a problem. Default: `${type}:${uid}`. */
  problemKey?(problem: P): string;

  /** Word the engine also avoids repeating, compared case-insensitively. */
  dedupeWord?(problem: P): string;

  /** Content-pack items the problem used, recorded as played. */
  contentItemIds?(problem: P): string[];

  /**
   * Copy with fresh nested arrays, so views that compare by reference see a
   * change. Default: a shallow copy.
   */
  cloneProblem?(problem: P): P;

  /**
   * Identity of the question within the problem; the answer timer restarts
   * when it changes. Default: `null`, the timer runs per problem.
   */
  questionKey?(problem: P): string | null;

  /** Key that remounts the game view when it changes. Default: `problem.uid`. */
  renderKey?(problem: P): string;

  /** Objective shown in the game header for this problem. Default: none. */
  sessionObjective?(problem: P, text: SessionObjectiveText): GameHeaderObjective | null;
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
  register<P extends Problem>(entry: GameRegistryEntry<P>): void {
    if (this.games.has(entry.id)) {
      console.warn(`[GameRegistry] Game "${entry.id}" is already registered. Overwriting.`);
    }
    this.games.set(entry.id, entry);
  }

  /**
   * Remove one game (test fixtures)
   */
  unregister(id: string): void {
    this.games.delete(id);
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
