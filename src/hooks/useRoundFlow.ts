/**
 * The end of a round, shared by every game (ADR 0005 points 1, 3 and 4):
 * a life lost to a failure, and a finished round's stars, level and end screen.
 */

import { useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { usePlaySessionStore } from '../stores/playSessionStore';
import { calculateStarReward } from '../engine/progression';
import { playMoment } from '../engine/audio';
import { isRoundPerfect, isTimedRound, roundHasLives, type RoundState } from '../engine/round';
import { gameRegistry } from '../games/registry';
import type { AchievementUnlock } from '../types/achievement';

/** Time for the last answer's feedback before the end screen covers the game. */
export const ROUND_END_DELAY_MS = 900;
const LIFE_LOST_SOUND_DELAY_S = 0.3;

export interface UseRoundFlowResult {
  /** Rewards a round that ended and shows its end screen. */
  finishRound: (round: RoundState) => void;
  /**
   * A wrong answer or a game's own failure: a life, the round's end if it was
   * the last one, else the task starts over where the game registers how.
   */
  failTask: () => RoundState | null;
  /** The clock of a timed round stopped. */
  timeUp: () => void;
}

export function useRoundFlow(): UseRoundFlowResult {
  const finishRound = useCallback((round: RoundState) => {
    const session = usePlaySessionStore.getState();
    const game = useGameStore.getState();
    const { gameType } = session;
    if (!gameType || round.status === 'playing') return;

    const level = game.getLevelForGame(gameType);
    const reached = round.status === 'reached';
    const starsEarned = reached ? calculateStarReward(gameType, level, isRoundPerfect(round)) : 0;

    // The round's answers unlocked some already; stars and the level may add more.
    const achievements: AchievementUnlock[] = [...session.roundAchievements];
    const addAchievements = (unlocks: AchievementUnlock[]) => {
      const seen = new Set(achievements.map((a) => a.id));
      achievements.push(...unlocks.filter((a) => !seen.has(a.id)));
    };
    if (starsEarned > 0) {
      addAchievements(game.earnStars(starsEarned, `round_${gameType}_${level}`).newAchievements);
    }
    // A timed round has no levels to climb (the drill plays at none), so it leaves them alone.
    const record = isTimedRound(round.spec)
      ? null
      : game.recordRoundResult(gameType, level, reached);
    if (record) addAchievements(record.newAchievements);

    if (session.gameStartTime) {
      const playTime = Math.floor((Date.now() - session.gameStartTime) / 1000);
      game.updateStats((stats) => ({
        ...stats,
        totalTimePlayed: stats.totalTimePlayed + playTime,
      }));
    }

    setTimeout(() => {
      // Left for the menu or another round meanwhile: that round has its own end.
      if (usePlaySessionStore.getState().round !== round) return;
      usePlaySessionStore.getState().endRound({
        starsEarned,
        level,
        leveledUp: record?.leveledUp ?? false,
        highestLevel: record?.highestLevel ?? level,
        roundsReached: record?.roundsReached ?? 0,
        achievements,
      });
    }, ROUND_END_DELAY_MS);
  }, []);

  const failTask = useCallback(() => {
    const session = usePlaySessionStore.getState();
    // A failure reported after the round ended (BattleLearn's board stays live
    // until the end screen) must not finish it a second time.
    if (session.round?.status !== 'playing') return session.round;
    const livesBefore = session.round.lives;
    const round = session.loseRoundLife();
    if (round && round.lives < livesBefore) {
      // After the wrong answer's own tone, so the two do not blur.
      playMoment('lifeLost', useGameStore.getState().soundEnabled, LIFE_LOST_SOUND_DELAY_S);
    }
    if (round && round.status !== 'playing') {
      finishRound(round);
    } else if (round && roundHasLives(round.spec) && session.gameType && session.problem) {
      const entry = gameRegistry.get(session.gameType);
      if (entry?.restartTask) session.setProblem(entry.restartTask(session.problem));
    }
    return round;
  }, [finishRound]);

  const timeUp = useCallback(() => {
    if (usePlaySessionStore.getState().round?.status !== 'playing') return;
    const round = usePlaySessionStore.getState().finishTimedRound();
    if (round) finishRound(round);
  }, [finishRound]);

  return { finishRound, failTask, timeUp };
}
