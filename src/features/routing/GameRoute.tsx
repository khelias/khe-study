import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { usePlaySessionStore } from '../../stores/playSessionStore';
import { useGameStore } from '../../stores/gameStore';
import { GameScreen } from '../gameplay/GameScreen';
import { GameResultScreen } from '../gameplay/GameResultScreen';
import { slugToGameId, isValidGameSlug } from '../../utils/gameSlug';
import { GAME_CONFIG } from '../../games/data';
import { parsePathSlot } from '../../meta/path';
import { setDocumentTitle } from '../../i18n';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';

/**
 * GameRoute component handles direct navigation to a specific game via URL.
 * It initializes the game state and ensures proper profile behavior.
 */
export const GameRoute: React.FC = () => {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pathSlot = parsePathSlot(searchParams.get('path'));
  const gameState = usePlaySessionStore((state) => state.gameState);
  const startGame = usePlaySessionStore((state) => state.startGame);
  const recordGameStart = useGameStore((state) => state.recordGameStart);
  const t = useTranslation();
  const { formatText } = useProfileText();
  const gameTitle = gameSlug
    ? t.games[slugToGameId(gameSlug) as keyof typeof t.games]?.title
    : undefined;
  const tabTitle = gameTitle ? formatText(gameTitle) : undefined;

  useEffect(() => {
    setDocumentTitle(tabTitle);
    return () => setDocumentTitle();
    // t: a language switch resets the title, also for a game named the same in both.
  }, [tabTitle, t]);

  // Start once per visit, so reaching round_over does not restart the game.
  const hasStartedRef = useRef(false);

  // A new game or another round of today's path starts again.
  useEffect(() => {
    hasStartedRef.current = false;
  }, [gameSlug, pathSlot]);

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
      const stats = useGameStore.getState().activeLearnerProfile.meta.stats;
      const isFirstTime = (stats?.gamesByType?.[gameId] ?? 0) === 0;
      recordGameStart(gameId);
      startGame(gameId, { autoShowGameDescription: isFirstTime, pathSlot });
    }
  }, [gameSlug, gameState, navigate, startGame, recordGameStart, pathSlot]);

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
