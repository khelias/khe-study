import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaySessionStore } from '../../stores/playSessionStore';
import { useGameStore } from '../../stores/gameStore';
import { GameScreen } from '../gameplay/GameScreen';
import { GameResultScreen } from '../gameplay/GameResultScreen';
import { slugToGameId, isValidGameSlug } from '../../utils/gameSlug';
import { GAME_CONFIG } from '../../games/data';

/**
 * GameRoute component handles direct navigation to a specific game via URL.
 * It initializes the game state and ensures proper profile behavior.
 */
export const GameRoute: React.FC = () => {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const gameState = usePlaySessionStore((state) => state.gameState);
  const startGame = usePlaySessionStore((state) => state.startGame);
  const recordGameStart = useGameStore((state) => state.recordGameStart);

  // Guard: only start the game once per route visit.
  // Without this, returnToMenu() sets gameState back to 'menu', which
  // re-triggers the effect below and restarts the game before navigate('/')
  // completes — causing the "need to click home twice" bug.
  const hasStartedRef = useRef(false);

  // Reset the guard when navigating to a different game slug
  useEffect(() => {
    hasStartedRef.current = false;
  }, [gameSlug]);

  useEffect(() => {
    // Validate the game slug
    if (!gameSlug) {
      void navigate('/');
      return;
    }

    const gameId = slugToGameId(gameSlug);
    const validGameIds = Object.keys(GAME_CONFIG);

    if (!isValidGameSlug(gameSlug, validGameIds)) {
      // Invalid game slug, redirect to menu
      void navigate('/');
      return;
    }

    // Start the game only once per route visit
    if (!hasStartedRef.current && (gameState === 'menu' || gameState === 'round_over')) {
      hasStartedRef.current = true;
      // Check "first time" before incrementing so GameScreen can auto-show description
      const stats = useGameStore.getState().stats;
      const isFirstTime = (stats?.gamesByType?.[gameId] ?? 0) === 0;
      recordGameStart(gameId);
      startGame(gameId, { autoShowGameDescription: isFirstTime });
    }
  }, [gameSlug, gameState, navigate, startGame, recordGameStart]);

  // Render appropriate screen based on game state
  if (gameState === 'playing') {
    return <GameScreen />;
  }

  if (gameState === 'round_over') {
    return <GameResultScreen />;
  }

  // While initializing, show nothing (will redirect if invalid)
  return null;
};
