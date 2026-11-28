import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameHeader } from '../GameHeader';
import { createRound } from '../../engine/round';
import { setLocale } from '../../i18n';
import { mockMatchMedia } from '../../test/utils';

const renderHeader = (gameType = 'letter_match', timed = false) =>
  render(
    <GameHeader
      score={42}
      stars={7}
      round={
        timed
          ? createRound({ kind: 'timed', size: 0 })
          : { ...createRound({ kind: 'tasks', size: 5 }), progress: 2, lives: 2 }
      }
      onReturnToMenu={vi.fn()}
      onSettingsClick={vi.fn()}
      currentLevel={3}
      gameType={gameType}
      onLevelClick={vi.fn()}
      showSettingsMenu={false}
      settingsMenuRef={createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>}
      onShopClick={vi.fn()}
    />,
  );

describe('GameHeader', () => {
  beforeEach(() => setLocale('et'));
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('on desktop keeps the game name, level and score, and has no info button', () => {
    mockMatchMedia(false);
    renderHeader();
    expect(screen.queryByTestId('game-bar')).toBeNull();
    expect(screen.getByRole('button', { name: 'Muuda taset' })).toBeTruthy();
    expect(screen.getByTestId('session-score').textContent).toBe('42');
    expect(screen.getByTestId('round-goal')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Kuidas mängida' })).toBeNull();
  });

  it('on a phone is one bar: home, round, hearts, stars and menu', () => {
    mockMatchMedia(true);
    renderHeader();
    const bar = screen.getByTestId('game-bar');
    expect(bar).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tagasi menüüsse' })).toBeTruthy();
    const goal = screen.getByTestId('round-goal');
    expect(goal.textContent).toBe('2/5');
    expect(goal.getAttribute('aria-label')).toBe('Ring');
    expect(screen.getByTestId('round-lives').getAttribute('aria-label')).toBe('Elusid alles: 2');
    expect(screen.getByRole('button', { name: 'Tähed 7, ava pood' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Seaded' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Muuda taset' })).toBeNull();
    expect(screen.queryByTestId('session-score')).toBeNull();
  });

  it("gives the goal to a raft game's stage and names the game on a phone", () => {
    mockMatchMedia(true);
    renderHeader('balance_scale');
    expect(screen.queryByTestId('round-goal')).toBeNull();
    expect(screen.getByTestId('game-bar').textContent).toContain('Kaalud');
    expect(screen.getByTestId('round-lives').getAttribute('aria-label')).toBe('Elusid alles: 2');
  });

  it('on a phone leaves the middle empty for a timed round', () => {
    mockMatchMedia(true);
    renderHeader('letter_match', true);
    expect(screen.queryByTestId('round-goal')).toBeNull();
    expect(screen.queryByTestId('round-lives')).toBeNull();
  });

  it('pulses the heart a wrong answer emptied and rings the last one, not a regained one', () => {
    mockMatchMedia(true);
    const props = {
      score: 0,
      stars: 0,
      onReturnToMenu: vi.fn(),
      onSettingsClick: vi.fn(),
      currentLevel: 1,
      gameType: 'balance_scale',
      onLevelClick: vi.fn(),
      showSettingsMenu: false,
      settingsMenuRef: createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>,
    };
    const round = createRound({ kind: 'tasks', size: 5 });
    const hearts = () => Array.from(screen.getByTestId('round-lives').querySelectorAll('svg'));
    const { rerender } = render(<GameHeader {...props} round={{ ...round, lives: 2 }} />);
    expect(hearts().some((h) => h.classList.contains('heart-lost'))).toBe(false);

    rerender(<GameHeader {...props} round={{ ...round, lives: 1 }} />);
    expect(hearts()[1]).toHaveClass('heart-lost');
    expect(hearts()[0]).toHaveClass('lives-last');

    rerender(<GameHeader {...props} round={{ ...round, lives: 2 }} />);
    expect(hearts().some((h) => h.classList.contains('heart-lost'))).toBe(false);
    expect(hearts().some((h) => h.classList.contains('lives-last'))).toBe(false);
  });
});
