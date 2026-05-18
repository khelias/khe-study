import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { setLocale } from '../../../i18n';
import { useGameStore } from '../../../stores/gameStore';
import { usePlaySessionStore } from '../../../stores/playSessionStore';
import { GameResultScreen } from '../GameResultScreen';

function renderResultScreen() {
  return render(
    <MemoryRouter>
      <GameResultScreen type="gameOver" />
    </MemoryRouter>,
  );
}

describe('GameResultScreen', () => {
  beforeEach(() => {
    setLocale('et');
    usePlaySessionStore.getState().resetSessionState();
    useGameStore.setState({
      soundEnabled: false,
      hearts: 2,
      highScores: {
        addition_snake: 4,
      },
    });
  });

  it('labels the game-over primary action as rescuing the attempt', () => {
    usePlaySessionStore.setState({
      gameState: 'game_over',
      gameType: 'word_builder',
      score: 7,
    });

    renderResultScreen();

    expect(screen.getByRole('button', { name: 'Päästa katse' })).toBeInTheDocument();
  });

  it('rescues the attempt and makes it ineligible for high score', () => {
    usePlaySessionStore.setState({
      gameState: 'game_over',
      gameType: 'word_builder',
      score: 7,
      highScoreEligible: true,
    });

    renderResultScreen();
    fireEvent.click(screen.getByRole('button', { name: 'Päästa katse' }));

    const state = usePlaySessionStore.getState();
    expect(state.gameState).toBe('playing');
    expect(state.highScoreEligible).toBe(false);
  });

  it('does not mark rescued attempts as new records', () => {
    usePlaySessionStore.setState({
      gameState: 'game_over',
      gameType: 'addition_snake',
      score: 10,
      highScoreEligible: false,
    });

    renderResultScreen();

    expect(screen.queryByText('Uus rekord!')).not.toBeInTheDocument();
  });

  it('shows the snake session summary on snake game over', () => {
    usePlaySessionStore.setState({
      gameState: 'game_over',
      gameType: 'addition_snake',
      score: 7,
      snakeSessionStats: {
        factsAttempted: 4,
        factsCorrect: 3,
        maxStreak: 3,
        maxSnakeLength: 9,
        factHistory: {
          '8 - 3': { attempts: 2, correct: 1 },
          '2 + 2': { attempts: 2, correct: 2 },
        },
      },
    });

    renderResultScreen();

    expect(screen.getByText('Selle mängu kokkuvõte')).toBeInTheDocument();
    expect(screen.getByText('Pikim uss')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Need tehted vajavad veel harjutamist')).toBeInTheDocument();
    expect(screen.getByText('8 - 3')).toBeInTheDocument();
    expect(screen.queryByText('2 + 2')).not.toBeInTheDocument();
  });

  it('does not show the snake session summary for non-snake game over', () => {
    usePlaySessionStore.setState({
      gameState: 'game_over',
      gameType: 'word_builder',
      score: 7,
      snakeSessionStats: {
        factsAttempted: 4,
        factsCorrect: 3,
        maxStreak: 3,
        maxSnakeLength: 9,
        factHistory: {
          '8 - 3': { attempts: 2, correct: 1 },
        },
      },
    });

    renderResultScreen();

    expect(screen.queryByText('Selle mängu kokkuvõte')).not.toBeInTheDocument();
    expect(screen.queryByText('8 - 3')).not.toBeInTheDocument();
  });
});
