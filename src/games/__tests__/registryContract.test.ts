/**
 * A game is added by registering it from src/games/: the engine, the play
 * session store and the tips read everything per game from its registry
 * entry. Part 1 drives a fixture binding through those generic paths; part 2
 * fails when code outside src/games/ dispatches on a game id or problem type,
 * by a `case` label or a `===` / `!==` comparison. COMPARISON_ALLOWLIST holds
 * the files still comparing on type, and fails once one of them stops.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { gameRegistry } from '../registry';
import { BALANCE_SCALE_CONFIG } from '../balanceScale/config';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameTips } from '../../hooks/useGameTips';
import { useGameStore } from '../../stores/gameStore';
import { usePlaySessionStore } from '../../stores/playSessionStore';
import { createRng } from '../../engine/rng';
import type { Problem } from '../../types/game';
import '../registrations';

const FIXTURE_ID = 'registry_fixture';
const FIXTURE_PACK = 'registry_fixture_pack';

interface FixtureProblem {
  type: typeof FIXTURE_ID;
  uid: string;
  board: string;
  word: string;
  question: string;
}

const asFixture = (problem: Problem) => problem as unknown as FixtureProblem;

const adaptiveDifficulty = {
  recentAccuracy: [],
  averageResponseTime: [],
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  difficultyMultiplier: 1,
  levelAdjustment: 0,
};

describe('a new game needs only its registry entry', () => {
  // Boards repeat ('a' twice) and words repeat in a different case ('Kass'
  // after 'kass'), so the engine has to skip by the entry's key and word.
  const queue: Array<Pick<FixtureProblem, 'board' | 'word'>> = [
    { board: 'a', word: 'kass' },
    { board: 'a', word: 'koer' },
    { board: 'b', word: 'Kass' },
    { board: 'c', word: 'hiir' },
  ];
  let uid = 0;
  const generator = vi.fn(() => {
    const next = queue.shift() ?? { board: `z${uid}`, word: `z${uid}` };
    uid += 1;
    return {
      type: FIXTURE_ID,
      uid: `fixture-${uid}`,
      question: 'q1',
      ...next,
    } as unknown as Problem;
  });
  const cloneProblem = vi.fn((problem: Problem) => ({ ...problem }));
  const questionKey = vi.fn((problem: Problem) => asFixture(problem).question);

  beforeAll(() => {
    gameRegistry.register({
      id: FIXTURE_ID,
      component: () => null,
      generator,
      config: { ...BALANCE_SCALE_CONFIG, id: FIXTURE_ID },
      validator: () => true,
      contentPackId: FIXTURE_PACK,
      problemKey: (problem) => `fixture:${asFixture(problem).board}`,
      dedupeWord: (problem) => asFixture(problem).word,
      contentItemIds: (problem) => [`item-${asFixture(problem).board}`],
      cloneProblem,
      questionKey,
    });
  });

  afterAll(() => {
    gameRegistry.unregister(FIXTURE_ID);
  });

  it('dedupes by the entry key and word, and records its content ids', () => {
    const { result } = renderHook(() => useGameEngine());
    const generate = () =>
      asFixture(result.current.generateUniqueProblemForGame(FIXTURE_ID, 1, adaptiveDifficulty)!);

    expect(generate().board).toBe('a');
    // 'a' again is a repeated key; 'b' brings back 'Kass', a repeated word.
    expect(generate().board).toBe('c');
    expect(useGameStore.getState().getPlayedContent(FIXTURE_PACK)).toEqual(['item-c', 'item-a']);
  });

  it('clones through the entry and restarts the timer when its question key changes', () => {
    vi.useFakeTimers({ now: 1_000 });
    try {
      const { startGame, setProblem } = usePlaySessionStore.getState();
      startGame(FIXTURE_ID);
      const problem = generator();

      setProblem(problem);
      vi.setSystemTime(2_000);
      setProblem({ ...problem });
      expect(usePlaySessionStore.getState().problemStartedAt).toBe(1_000);

      vi.setSystemTime(3_000);
      setProblem({ ...problem, question: 'q2' } as unknown as Problem);
      expect(usePlaySessionStore.getState().problemStartedAt).toBe(3_000);

      expect(cloneProblem).toHaveBeenCalledTimes(3);
      expect(questionKey).toHaveBeenCalled();
      expect(usePlaySessionStore.getState().problem).not.toBe(problem);
    } finally {
      vi.useRealTimers();
    }
  });

  it('records no content ids for a binding without a content pack', () => {
    gameRegistry.register({
      id: `${FIXTURE_ID}_nopack`,
      component: () => null,
      generator,
      config: { ...BALANCE_SCALE_CONFIG, id: `${FIXTURE_ID}_nopack` },
      validator: () => true,
      contentItemIds: () => ['item-x'],
    });
    const record = vi.spyOn(useGameStore.getState(), 'recordPlayedContent');
    try {
      const { result } = renderHook(() => useGameEngine());
      expect(
        result.current.generateUniqueProblemForGame(`${FIXTURE_ID}_nopack`, 1, adaptiveDifficulty),
      ).not.toBeNull();
      expect(record).not.toHaveBeenCalled();
    } finally {
      record.mockRestore();
      gameRegistry.unregister(`${FIXTURE_ID}_nopack`);
    }
  });

  it('has no tips until the locale has them', () => {
    const { result } = renderHook(() => useGameTips(FIXTURE_ID, null, [], () => {}, false));

    expect(result.current.getTipsForGame(FIXTURE_ID)).toEqual([]);
  });
});

describe('no dispatch on game type outside src/games/', () => {
  const SRC = join(__dirname, '../..');
  const EXCLUDED = ['games', 'i18n'].map((dir) => join(SRC, dir));
  const COMPARISON_ALLOWLIST = [
    'components/SettingsMenuContent.tsx',
    'engine/answerHandler.ts',
    'hooks/useAnswerHandler.ts',
    'hooks/useMathSnakeMovement.ts',
  ];

  const sourceFiles = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        return EXCLUDED.includes(path) || name === '__tests__' ? [] : sourceFiles(path);
      }
      return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
    });

  const registeredNames = (): Set<string> => {
    const rng = createRng(1);
    const names = new Set(gameRegistry.getIds());
    for (const entry of gameRegistry.getAll()) {
      names.add(entry.generator(1, rng).type);
    }
    return names;
  };

  it('finds no case label naming a registered game id or problem type', () => {
    const names = registeredNames();

    const offenders = sourceFiles(SRC).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/case '([a-z0-9_]+)'/g)]
        .filter((match) => names.has(match[1]!))
        .map((match) => `${relative(SRC, file)}: case '${match[1]}'`),
    );

    expect(names.size).toBeGreaterThan(30);
    expect(offenders).toEqual([]);
  });

  it('finds no comparison with a registered game id or problem type', () => {
    const names = registeredNames();
    // Whole-file matching, so a comparison Prettier wraps after the operator still counts.
    const comparisons = (file: string): string[] => {
      const source = readFileSync(file, 'utf8');
      const lines = source.split('\n');
      const hitLines = new Set(
        [
          ...source.matchAll(/[!=]==\s*'([a-z0-9_]+)'/g),
          ...source.matchAll(/'([a-z0-9_]+)'\s*[!=]==/g),
        ]
          .filter((match) => names.has(match[1]!))
          .map((match) => source.slice(0, match.index).split('\n').length),
      );
      return [...hitLines]
        .sort((a, b) => a - b)
        .map((line) => `${relative(SRC, file)}:${line}: ${lines[line - 1]!.trim()}`);
    };

    const files = sourceFiles(SRC);
    const offenders = files
      .filter((file) => !COMPARISON_ALLOWLIST.includes(relative(SRC, file)))
      .flatMap(comparisons);
    const stale = COMPARISON_ALLOWLIST.filter((entry) => {
      const file = join(SRC, entry);
      return !files.includes(file) || comparisons(file).length === 0;
    }).map((entry) => `${entry}: remove it from COMPARISON_ALLOWLIST`);

    expect({ offenders, stale }).toEqual({ offenders: [], stale: [] });
  });
});
