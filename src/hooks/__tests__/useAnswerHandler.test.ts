import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnswerHandler } from '../useAnswerHandler';
import { useGameEngine } from '../useGameEngine';
import { usePlaySessionStore } from '../../stores/playSessionStore';

import '../../games/registrations';

vi.mock('../../engine/audio', () => ({
  playSound: vi.fn(),
}));

const START = new Date('2026-01-01T10:00:00Z').getTime();

function renderAnswerHandler() {
  return renderHook(() => ({ engine: useGameEngine(), answer: useAnswerHandler() }));
}

describe('useAnswerHandler session response time', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: START });
    usePlaySessionStore.getState().resetSessionState();
    usePlaySessionStore.getState().startGame('word_builder');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('measures the adaptive-difficulty response time from when the problem was shown', () => {
    const { result, rerender } = renderAnswerHandler();
    const { adaptiveDifficulty } = usePlaySessionStore.getState();
    const problem = result.current.engine.generateUniqueProblemForGame(
      'word_builder',
      1,
      adaptiveDifficulty,
    );
    expect(problem).not.toBeNull();
    act(() => usePlaySessionStore.getState().setProblem(problem));
    rerender();

    vi.setSystemTime(START + 2500);
    act(() => result.current.answer.handleAnswer(true));

    expect(usePlaySessionStore.getState().adaptiveDifficulty.averageResponseTime).toEqual([2500]);
  });

  it('records no response time when the problem start is unknown', () => {
    const { result, rerender } = renderAnswerHandler();
    const { adaptiveDifficulty } = usePlaySessionStore.getState();
    const problem = result.current.engine.generateUniqueProblemForGame(
      'word_builder',
      1,
      adaptiveDifficulty,
    );
    act(() => usePlaySessionStore.setState({ problem, problemStartedAt: null }));
    rerender();

    vi.setSystemTime(START + 2500);
    act(() => result.current.answer.handleAnswer(true));

    const state = usePlaySessionStore.getState().adaptiveDifficulty;
    expect(state.recentAccuracy).toEqual([true]);
    expect(state.averageResponseTime).toEqual([]);
  });
});
