import { describe, it, expect, beforeEach } from 'vitest';
import { usePlaySessionStore } from '../playSessionStore';

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
      // hearts removed - now in gameStore (persistent global resource)
      // stars removed - now in gameStore (persistent currency)
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

    it('should end game', () => {
      const { startGame, endGame } = usePlaySessionStore.getState();

      startGame('word_builder');
      endGame();

      expect(usePlaySessionStore.getState().gameState).toBe('game_over');
    });

    it('should mark rescued attempts as ineligible for high score', () => {
      const { startGame, endGame, rescueAttempt } = usePlaySessionStore.getState();

      startGame('word_builder');
      expect(usePlaySessionStore.getState().highScoreEligible).toBe(true);

      endGame();
      rescueAttempt();

      expect(usePlaySessionStore.getState().gameState).toBe('playing');
      expect(usePlaySessionStore.getState().highScoreEligible).toBe(false);
    });
  });

  // Note: Hearts are now in gameStore (persistent global resource), not playSessionStore
  // Heart tests should be in gameStore.test.ts

  describe('Level Progress', () => {
    it('should initialize level progress on game start', () => {
      const { startGame } = usePlaySessionStore.getState();
      startGame('word_builder');

      const state = usePlaySessionStore.getState();
      expect(state.levelProgress).toBeTruthy();
      expect(state.levelProgress?.correctAnswers).toBe(0);
      expect(state.levelProgress?.totalAnswers).toBe(0);
    });

    it('should track level answers', () => {
      const { startGame, recordLevelAnswer } = usePlaySessionStore.getState();
      startGame('word_builder');

      recordLevelAnswer(true);
      recordLevelAnswer(true);
      recordLevelAnswer(false);

      const state = usePlaySessionStore.getState();
      expect(state.levelProgress?.correctAnswers).toBe(2);
      expect(state.levelProgress?.totalAnswers).toBe(3);
    });

    it('should reset level progress', () => {
      const { startGame, recordLevelAnswer, resetLevelProgress } = usePlaySessionStore.getState();
      startGame('word_builder');

      recordLevelAnswer(true);
      recordLevelAnswer(true);
      expect(usePlaySessionStore.getState().levelProgress?.correctAnswers).toBe(2);

      resetLevelProgress();
      const state = usePlaySessionStore.getState();
      expect(state.levelProgress?.correctAnswers).toBe(0);
      expect(state.levelProgress?.totalAnswers).toBe(0);
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

  describe('Hints', () => {
    it('should show and hide hint', () => {
      const { setShowHint } = usePlaySessionStore.getState();

      setShowHint(true);
      expect(usePlaySessionStore.getState().showHint).toBe(true);

      setShowHint(false);
      expect(usePlaySessionStore.getState().showHint).toBe(false);
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

      setBgClass('bg-green-50');
      expect(usePlaySessionStore.getState().bgClass).toBe('bg-green-50');

      setBgClass('bg-red-50');
      expect(usePlaySessionStore.getState().bgClass).toBe('bg-red-50');
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
});
