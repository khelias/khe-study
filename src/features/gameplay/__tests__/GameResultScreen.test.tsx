import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { setLocale } from '../../../i18n';
import { createRound, type RoundState } from '../../../engine/round';
import { useGameStore } from '../../../stores/gameStore';
import { usePlaySessionStore, type RoundResult } from '../../../stores/playSessionStore';
import { GameResultScreen } from '../GameResultScreen';
import '../../../games/registrations';

function renderResultScreen() {
  return render(
    <MemoryRouter>
      <GameResultScreen />
    </MemoryRouter>,
  );
}

const result = (overrides: Partial<RoundResult> = {}): RoundResult => ({
  starsEarned: 2,
  level: 1,
  leveledUp: false,
  highestLevel: 1,
  roundsReached: 1,
  achievements: [],
  ...overrides,
});

function endRoundOf(
  gameType: string,
  roundResult: RoundResult,
  roundState: Partial<RoundState> = {},
) {
  usePlaySessionStore.getState().startGame(gameType);
  const round = usePlaySessionStore.getState().round;
  usePlaySessionStore.setState({
    score: 7,
    roundResult,
    gameState: 'round_over',
    round: round && { ...round, status: 'reached', ...roundState },
  });
}

describe('GameResultScreen', () => {
  beforeEach(() => {
    setLocale('et');
    usePlaySessionStore.getState().resetSessionState();
    useGameStore.setState({ soundEnabled: false, highScores: { addition_snake: 4 } });
  });

  it('shows a reached round with its stars and the rounds left to the next level', () => {
    endRoundOf('word_builder', result());

    renderResultScreen();

    expect(screen.getByRole('heading', { name: 'Ring tehtud!' })).toBeInTheDocument();
    expect(screen.getByText('Said 2 tähte')).toBeInTheDocument();
    expect(screen.getByText('Veel 2 ringi ja tuleb tase 2.')).toBeInTheDocument();
  });

  it('shows a level-up', () => {
    endRoundOf('word_builder', result({ leveledUp: true, highestLevel: 3, roundsReached: 0 }));

    renderResultScreen();

    expect(screen.getByText('Uus tase: 3!')).toBeInTheDocument();
  });

  it('shows a lost round without stars', () => {
    endRoundOf('word_builder', result({ starsEarned: 0 }), { status: 'lost' });

    renderResultScreen();

    expect(screen.getByRole('heading', { name: 'Elud said otsa' })).toBeInTheDocument();
    expect(screen.queryByText(/Said .* täh/)).not.toBeInTheDocument();
  });

  it('says a lower level counts nothing', () => {
    endRoundOf('word_builder', result({ level: 1, highestLevel: 3 }));

    renderResultScreen();

    expect(screen.getByText('Selle taseme oled juba läbinud.')).toBeInTheDocument();
  });

  it("lists the round's achievements", () => {
    const achievements = [{ id: 'first_win', title: 'Esimene võit', desc: '', icon: '🏆' }];
    endRoundOf('word_builder', result({ achievements }));

    renderResultScreen();

    expect(screen.getByText('Esimene võit')).toBeInTheDocument();
  });

  it('starts the next round with full lives', () => {
    endRoundOf('word_builder', result({ starsEarned: 0 }), { status: 'lost' });
    usePlaySessionStore.setState({
      round: { ...createRound({ kind: 'tasks', size: 6 }), lives: 0 },
    });

    renderResultScreen();
    fireEvent.click(screen.getByRole('button', { name: 'Järgmine ring' }));

    const state = usePlaySessionStore.getState();
    expect(state.gameState).toBe('playing');
    expect(state.round?.lives).toBe(3);
    expect(state.score).toBe(0);
  });

  it('shows the snake round summary on a snake round', () => {
    endRoundOf('addition_snake', result());
    usePlaySessionStore.setState({
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

    expect(screen.getByText('Selle ringi kokkuvõte')).toBeInTheDocument();
    expect(screen.getByText('Pikim uss')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('8 - 3')).toBeInTheDocument();
    expect(screen.queryByText('2 + 2')).not.toBeInTheDocument();
  });

  it('does not show the snake summary for another game', () => {
    endRoundOf('word_builder', result());

    renderResultScreen();

    expect(screen.queryByText('Selle ringi kokkuvõte')).not.toBeInTheDocument();
  });

  it("shows the fact drill's goal when its timed round is lost", () => {
    endRoundOf('multiplication_fact_drill_1_5', result({ starsEarned: 0 }), {
      status: 'lost',
      answered: 8,
      correct: 6,
    });

    renderResultScreen();

    expect(screen.getByRole('heading', { name: 'Aeg läbi!' })).toBeInTheDocument();
    expect(
      screen.getByText('Ring läheb arvesse, kui vastad vähemalt 10 korda ja peaaegu kõik õigesti.'),
    ).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
