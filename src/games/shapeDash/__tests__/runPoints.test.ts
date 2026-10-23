import { beforeEach, describe, expect, it } from 'vitest';
import { awardShapeDashPoints, GATE_POINTS, recordShapeDashRun, STAR_POINTS } from '../runPoints';
import { useGameStore } from '../../../stores/gameStore';
import { usePlaySessionStore } from '../../../stores/playSessionStore';

describe('awardShapeDashPoints', () => {
  beforeEach(() => {
    usePlaySessionStore.getState().resetSessionState();
    usePlaySessionStore.getState().startGame('shape_dash');
    useGameStore.setState({ highScores: {} });
  });

  it('adds star and gate points to the session score at once and the high score at run end', () => {
    awardShapeDashPoints(STAR_POINTS);
    awardShapeDashPoints(GATE_POINTS * 2);
    expect(useGameStore.getState().getHighScore('shape_dash')).toBe(0);

    recordShapeDashRun(STAR_POINTS + GATE_POINTS * 2);

    expect(usePlaySessionStore.getState().score).toBe(STAR_POINTS + GATE_POINTS * 2);
    expect(useGameStore.getState().getHighScore('shape_dash')).toBe(STAR_POINTS + GATE_POINTS * 2);
  });

  it('keeps a higher earlier record', () => {
    useGameStore.setState({ highScores: { shape_dash: 5000 } });
    awardShapeDashPoints(STAR_POINTS);
    recordShapeDashRun(STAR_POINTS);

    expect(useGameStore.getState().getHighScore('shape_dash')).toBe(5000);
  });
});
