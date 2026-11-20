/**
 * Rounds through the answer handler, one test per row of Phase 1.7's failure
 * table (khe-meta plan study-game-feel-and-progression, Run 3).
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnswerHandler } from '../useAnswerHandler';
import { useGameEngine } from '../useGameEngine';
import { useMathSnakeMovement } from '../useMathSnakeMovement';
import { ROUND_END_DELAY_MS, useRoundFlow } from '../useRoundFlow';
import { usePlaySessionStore } from '../../stores/playSessionStore';
import { useGameStore } from '../../stores/gameStore';
import { createMathSnakeProblem } from '../../engine/mathSnake';
import { calculateStarReward } from '../../engine/progression';
import { createLearnerProfileFromLegacyProgress } from '../../learner';
import { createStats } from '../../engine/stats';
import type { Problem } from '../../types/game';

import '../../games/registrations';

vi.mock('../../engine/audio', () => ({
  playSound: vi.fn(),
}));

function renderRound() {
  return renderHook(() => ({
    engine: useGameEngine(),
    answer: useAnswerHandler(),
    flow: useRoundFlow(),
    move: useMathSnakeMovement(),
  }));
}

function startWith(gameType: string) {
  usePlaySessionStore.getState().resetSessionState();
  usePlaySessionStore.getState().startGame(gameType);
  const { result, rerender } = renderRound();
  const problem = result.current.engine.generateUniqueProblemForGame(
    gameType,
    1,
    usePlaySessionStore.getState().adaptiveDifficulty,
  );
  act(() => usePlaySessionStore.getState().setProblem(problem));
  rerender();
  return { result, rerender, problem: problem as Problem };
}

const round = () => usePlaySessionStore.getState().round;

describe('rounds through the answer handler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const learner = createLearnerProfileFromLegacyProgress({
      displayName: 'Test',
      legacyProfileId: '__active__',
      levelsByProfile: { __active__: {} },
      locale: 'et',
      now: 0,
    });
    useGameStore.setState({
      learners: [learner],
      activeLearnerId: learner.id,
      activeLearnerProfile: learner,
      stars: 0,
      stats: createStats(),
      unlockedAchievements: [],
      soundEnabled: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('quiz: a wrong answer costs a life and the same task stays', () => {
    const { result, problem } = startWith('letter_match');

    act(() => result.current.answer.handleAnswer(false));
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(round()).toMatchObject({ lives: 2, progress: 0, status: 'playing' });
    expect(usePlaySessionStore.getState().problem?.uid).toBe(problem.uid);
  });

  it('quiz: right answers count toward the goal and the last one ends the round with stars', () => {
    const { result, rerender } = startWith('letter_match');

    for (let i = 0; i < 8; i++) {
      act(() => result.current.answer.handleAnswer(true));
      act(() => {
        vi.advanceTimersByTime(700);
      });
      rerender();
    }
    expect(round()?.status).toBe('reached');
    act(() => {
      vi.advanceTimersByTime(ROUND_END_DELAY_MS);
    });

    const session = usePlaySessionStore.getState();
    const stars = calculateStarReward('letter_match', 1, true);
    expect(session.gameState).toBe('round_over');
    expect(session.round?.status).toBe('reached');
    expect(session.roundResult).toMatchObject({ starsEarned: stars, roundsReached: 1 });
    expect(useGameStore.getState().stars).toBe(stars);
    expect(useGameStore.getState().getLevelProgress('letter_match').roundsReached).toBe(1);
  });

  it('quiz: the third wrong answer loses the round without stars or level progress', () => {
    const { result } = startWith('balance_scale');

    for (let i = 0; i < 3; i++) act(() => result.current.answer.handleAnswer(false));
    expect(round()?.status).toBe('lost');
    // The round takes no more answers while its end comes up.
    act(() => result.current.answer.handleAnswer(true));
    expect(round()?.progress).toBe(0);
    act(() => {
      vi.advanceTimersByTime(ROUND_END_DELAY_MS);
    });

    expect(usePlaySessionStore.getState().roundResult).toMatchObject({
      starsEarned: 0,
      roundsReached: 0,
    });
    expect(useGameStore.getState().stars).toBe(0);
  });

  it('snake: a crash costs a life and the snake starts again short', () => {
    usePlaySessionStore.getState().resetSessionState();
    usePlaySessionStore.getState().startGame('addition_snake');
    const base = createMathSnakeProblem([], 1);
    const atWall = {
      ...base,
      apple: null,
      snake: [
        [base.gridSize - 1, 1],
        [base.gridSize - 2, 1],
        [base.gridSize - 3, 1],
        [base.gridSize - 4, 1],
      ] as Array<[number, number]>,
      direction: 'RIGHT' as const,
    };
    act(() => usePlaySessionStore.getState().setProblem(atWall));
    act(() => {
      usePlaySessionStore.getState().recordRoundAnswer(true);
      usePlaySessionStore.getState().recordRoundAnswer(true);
    });
    const { result } = renderRound();

    act(() => result.current.move?.('RIGHT'));

    const after = usePlaySessionStore.getState().problem;
    // The math apples answered before the crash stay counted.
    expect(round()).toMatchObject({ lives: 2, progress: 2, status: 'playing' });
    expect(after?.type === 'math_snake' && after.snake.length).toBe(3);
  });

  it('Word Cascade: three wrong taps cost a life and the same word starts again', () => {
    const { result, problem } = startWith('word_cascade');

    act(() => result.current.answer.handleAnswer(false));

    const after = usePlaySessionStore.getState().problem;
    expect(round()?.lives).toBe(2);
    expect(after?.uid).not.toBe(problem.uid);
    expect(after?.type === 'word_cascade' && problem.type === 'word_cascade').toBe(true);
    if (after?.type === 'word_cascade' && problem.type === 'word_cascade') {
      expect(after.target).toBe(problem.target);
    }
  });

  it('Shape Dash: a crash costs a life; the finish reaches the goal and adds no score of its own', () => {
    const { result } = startWith('shape_dash');

    act(() => result.current.answer.handleAnswer(false));
    expect(round()?.lives).toBe(2);
    act(() => result.current.answer.handleAnswer(true));

    expect(round()?.status).toBe('reached');
    expect(usePlaySessionStore.getState().score).toBe(0);
  });

  it('Robo Path and Star Mapper: a failed attempt costs a life on the same task', () => {
    for (const gameType of ['robo_path', 'star_mapper']) {
      const { result, problem } = startWith(gameType);
      act(() => result.current.answer.handleAnswer(false));
      expect(round()?.lives).toBe(2);
      expect(usePlaySessionStore.getState().problem?.uid).toBe(problem.uid);
    }
  });

  it('BattleLearn: a wrong question costs a life and the question stays', () => {
    const { result, problem } = startWith('battlelearn');

    act(() => result.current.answer.handleAnswer(false));
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(round()).toMatchObject({ lives: 2, progress: 0, status: 'playing' });
    expect(usePlaySessionStore.getState().problem?.uid).toBe(problem.uid);
  });

  it('a failure reported after the round ended does not end it again', () => {
    const { result } = startWith('battlelearn');

    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.flow.failTask();
      });
    }
    expect(round()?.status).toBe('lost');
    const playedAtEnd = useGameStore.getState().stats.totalTimePlayed;
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    act(() => {
      result.current.flow.failTask();
    });
    act(() => {
      vi.advanceTimersByTime(ROUND_END_DELAY_MS);
    });

    // Finishing again would add the play time a second time.
    expect(useGameStore.getState().stats.totalTimePlayed).toBe(playedAtEnd);
    expect(usePlaySessionStore.getState().gameState).toBe('round_over');
  });

  it('BattleLearn: five misses are a failure that costs a life and keeps the board', () => {
    const { result, problem } = startWith('battlelearn');

    act(() => {
      result.current.flow.failTask();
    });

    expect(round()).toMatchObject({ lives: 2, status: 'playing' });
    expect(usePlaySessionStore.getState().problem?.uid).toBe(problem.uid);
  });

  it('memory games: a cleared board reaches the goal; they report no mismatch to cost a life', () => {
    const { result } = startWith('picture_pairs');

    act(() => result.current.answer.handleAnswer(true));

    expect(round()).toMatchObject({ lives: 3, status: 'reached' });
  });

  it('Shape Shift: solved boards count toward the goal; a wrong board is free', () => {
    const { result, rerender } = startWith('shape_shift');

    act(() => result.current.answer.handleAnswer(true));
    act(() => {
      vi.advanceTimersByTime(700);
    });
    rerender();

    expect(round()).toMatchObject({ lives: 3, progress: 1, status: 'playing' });
  });

  it('fact drill: a wrong answer costs no life; the clock judges the round', () => {
    const { result } = startWith('multiplication_fact_drill_1_5');

    act(() => result.current.answer.handleAnswer(false));
    expect(round()).toMatchObject({ lives: 0, status: 'playing' });

    act(() => result.current.flow.timeUp());
    act(() => {
      vi.advanceTimersByTime(ROUND_END_DELAY_MS);
    });

    expect(round()?.status).toBe('lost');
    expect(usePlaySessionStore.getState().gameState).toBe('round_over');
  });

  it('fact drill: a reached timed round gives stars and leaves the level alone', () => {
    const { result } = startWith('multiplication_fact_drill_1_5');
    act(() => {
      for (let i = 0; i < 10; i++) usePlaySessionStore.getState().recordRoundAnswer(true);
    });

    act(() => result.current.flow.timeUp());
    act(() => {
      vi.advanceTimersByTime(ROUND_END_DELAY_MS);
    });

    expect(round()?.status).toBe('reached');
    expect(useGameStore.getState().stars).toBeGreaterThan(0);
    expect(
      useGameStore.getState().getLevelProgress('multiplication_fact_drill_1_5').roundsReached,
    ).toBe(0);
  });

  it("the end screen lists achievements the round's answers unlocked", () => {
    const { result, rerender } = startWith('letter_match');

    for (let i = 0; i < 8; i++) {
      act(() => result.current.answer.handleAnswer(true));
      act(() => {
        vi.advanceTimersByTime(700);
      });
      rerender();
    }
    act(() => {
      vi.advanceTimersByTime(ROUND_END_DELAY_MS);
    });

    // The fifth right answer in a row unlocks perfect_5.
    const ids = usePlaySessionStore.getState().roundResult?.achievements.map((a) => a.id);
    expect(ids).toContain('perfect_5');
  });

  it('leaving for the menu before the end screen drops it', () => {
    const { result } = startWith('balance_scale');

    for (let i = 0; i < 3; i++) act(() => result.current.answer.handleAnswer(false));
    act(() => usePlaySessionStore.getState().returnToMenu());
    act(() => {
      vi.advanceTimersByTime(ROUND_END_DELAY_MS);
    });

    expect(usePlaySessionStore.getState().gameState).toBe('menu');
  });
});
