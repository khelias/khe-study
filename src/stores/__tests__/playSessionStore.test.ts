import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePlaySessionStore } from '../playSessionStore';
import { createMathSnakeProblem } from '../../engine/mathSnake';
import '../../games/registrations';

describe('playSessionStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    usePlaySessionStore.getState().resetSessionState();
  });

  describe('Game Initialization', () => {
    it('should start game correctly', () => {
      const { startGame } = usePlaySessionStore.getState();
      startGame('word_builder');

      const state = usePlaySessionStore.getState();
      expect(state.gameType).toBe('word_builder');
      expect(state.gameState).toBe('playing');
      expect(state.currentStreak).toBe(0);
      expect(state.gameStartTime).toBeTruthy();
    });

    it('should reset adaptive difficulty on game start', () => {
      const { startGame } = usePlaySessionStore.getState();
      startGame('word_builder');

      const state = usePlaySessionStore.getState();
      expect(state.adaptiveDifficulty.recentAccuracy).toEqual([]);
      expect(state.adaptiveDifficulty.consecutiveCorrect).toBe(0);
    });
  });

  describe('Game State Management', () => {
    it('should return to menu', () => {
      const { startGame, returnToMenu } = usePlaySessionStore.getState();

      startGame('word_builder');
      returnToMenu();

      const state = usePlaySessionStore.getState();
      expect(state.gameState).toBe('menu');
      expect(state.gameType).toBeNull();
      expect(state.problem).toBeNull();
    });

    it('ends a round with its result', () => {
      const { startGame, endRound } = usePlaySessionStore.getState();
      startGame('word_builder');
      const result = {
        reached: true,
        starsEarned: 2,
        level: 1,
        leveledUp: false,
        highestLevel: 1,
        roundsReached: 1,
        counted: true,
        achievements: [],
        answered: 6,
        correct: 6,
      };

      endRound(result);

      expect(usePlaySessionStore.getState().gameState).toBe('round_over');
      expect(usePlaySessionStore.getState().roundResult).toEqual(result);
    });
  });

  describe('Rounds', () => {
    it("starts round one with the entry's goal and three lives", () => {
      usePlaySessionStore.getState().startGame('word_builder');
      expect(usePlaySessionStore.getState().round).toMatchObject({
        spec: { kind: 'tasks', size: 6 },
        progress: 0,
        lives: 3,
        status: 'playing',
      });
    });

    it('a lost round ends at its third life and the next round starts full', () => {
      const store = usePlaySessionStore.getState();
      store.startGame('letter_match');
      store.recordRoundAnswer(true);
      store.addScore(10);
      store.loseRoundLife();
      store.loseRoundLife();
      expect(store.loseRoundLife()?.status).toBe('lost');

      usePlaySessionStore.getState().startNextRound();

      const next = usePlaySessionStore.getState();
      expect(next.gameState).toBe('playing');
      expect(next.problem).toBeNull();
      expect(next.score).toBe(0);
      expect(next.roundResult).toBeNull();
      expect(next.round).toMatchObject({ progress: 0, lives: 3, status: 'playing' });
    });

    it('the fact drill plays a timed round judged when its clock stops', () => {
      const store = usePlaySessionStore.getState();
      store.startGame('multiplication_fact_drill_1_5');
      for (let i = 0; i < 10; i++) store.recordRoundAnswer(true);
      expect(usePlaySessionStore.getState().round?.status).toBe('playing');
      expect(store.finishTimedRound()?.status).toBe('reached');
    });

    it('keeps the best streak of the round', () => {
      const store = usePlaySessionStore.getState();
      store.startGame('word_builder');
      store.submitAnswer(true);
      store.submitAnswer(true);
      store.submitAnswer(false);
      store.submitAnswer(true);
      expect(usePlaySessionStore.getState().bestStreak).toBe(2);
    });

    it('returning to the menu drops the round', () => {
      usePlaySessionStore.getState().startGame('word_builder');
      usePlaySessionStore.getState().returnToMenu();
      expect(usePlaySessionStore.getState().round).toBeNull();
    });
  });

  describe('Notifications', () => {
    it('should add and remove notifications', () => {
      const { addNotification, removeNotification } = usePlaySessionStore.getState();

      addNotification({ type: 'info', message: 'Hello' });
      const stateWithNotification = usePlaySessionStore.getState();
      expect(stateWithNotification.notifications.length).toBe(1);
      const [notification] = stateWithNotification.notifications;
      expect(notification?.type).toBe('info');
      expect(typeof notification?.createdAt).toBe('number');

      if (notification) {
        removeNotification(notification.id);
      }
      expect(usePlaySessionStore.getState().notifications.length).toBe(0);
    });

    it('should clear notifications', () => {
      const { addNotification, clearNotifications } = usePlaySessionStore.getState();

      addNotification({ type: 'info', message: 'One' });
      addNotification({ type: 'hint', message: 'Two' });
      expect(usePlaySessionStore.getState().notifications.length).toBe(2);

      clearNotifications();
      expect(usePlaySessionStore.getState().notifications.length).toBe(0);
    });
  });

  describe('Answer Submission', () => {
    it('should update streak on correct answer', () => {
      const { submitAnswer } = usePlaySessionStore.getState();

      submitAnswer(true);
      submitAnswer(true);

      expect(usePlaySessionStore.getState().currentStreak).toBe(2);
    });

    it('should reset streak on wrong answer', () => {
      const { submitAnswer } = usePlaySessionStore.getState();

      submitAnswer(true);
      submitAnswer(true);
      submitAnswer(false);

      expect(usePlaySessionStore.getState().currentStreak).toBe(0);
    });
  });

  describe('Visual Effects', () => {
    it('should manage confetti state', () => {
      const { setConfetti, setEnhancedConfetti } = usePlaySessionStore.getState();

      setConfetti(true);
      expect(usePlaySessionStore.getState().confetti).toBe(true);

      setEnhancedConfetti(true);
      expect(usePlaySessionStore.getState().enhancedConfetti).toBe(true);
    });

    it('should manage particle effects', () => {
      const { setParticleActive } = usePlaySessionStore.getState();

      setParticleActive(true);
      expect(usePlaySessionStore.getState().particleActive).toBe(true);

      setParticleActive(false);
      expect(usePlaySessionStore.getState().particleActive).toBe(false);
    });
  });

  describe('Background Color', () => {
    it('should set background class', () => {
      const { setBgClass } = usePlaySessionStore.getState();

      setBgClass('answer-ok');
      expect(usePlaySessionStore.getState().bgClass).toBe('answer-ok');

      setBgClass('answer-bad');
      expect(usePlaySessionStore.getState().bgClass).toBe('answer-bad');
    });
  });

  describe('Score Management', () => {
    it('should set score', () => {
      const { setScore } = usePlaySessionStore.getState();

      setScore(50);
      expect(usePlaySessionStore.getState().score).toBe(50);
    });

    it('should add score', () => {
      const { addScore } = usePlaySessionStore.getState();

      addScore(10);
      addScore(20);

      expect(usePlaySessionStore.getState().score).toBe(30);
    });
  });

  describe('Problem timing', () => {
    const START = new Date('2026-01-01T10:00:00Z').getTime();

    beforeEach(() => {
      vi.useFakeTimers({ now: START });
      usePlaySessionStore.getState().startGame('addition_snake');
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('keeps the start time while the same problem is updated', () => {
      const { setProblem } = usePlaySessionStore.getState();
      const snake = createMathSnakeProblem([], 1);

      setProblem(snake);
      vi.setSystemTime(START + 1000);
      setProblem({ ...snake, direction: 'UP' });

      expect(usePlaySessionStore.getState().problemStartedAt).toBe(START);
    });

    it('restarts the timer when the snake raises a math challenge', () => {
      const { setProblem } = usePlaySessionStore.getState();
      const snake = createMathSnakeProblem([], 1);
      const math = { equation: '3×4', answer: 12, options: [12, 7, 16] };

      setProblem(snake);
      vi.setSystemTime(START + 20_000);
      setProblem({ ...snake, math });
      vi.setSystemTime(START + 21_000);
      setProblem({ ...snake, math, direction: 'UP' });

      expect(usePlaySessionStore.getState().problemStartedAt).toBe(START + 20_000);
    });
  });
});
