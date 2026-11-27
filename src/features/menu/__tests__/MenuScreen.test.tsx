import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { setLocale } from '../../../i18n';
import { useGameStore } from '../../../stores/gameStore';
import { MenuScreen } from '../MenuScreen';
import { setLearnerMeta } from '../../../test/utils';

// src/test/setup.ts mocks matchMedia to never match, so this is the phone layout.
const renderMenu = () =>
  render(
    <MemoryRouter>
      <MenuScreen />
    </MemoryRouter>,
  );

describe('MenuScreen on a phone', () => {
  beforeEach(() => {
    setLocale('et');
    useGameStore.setState({ hasSeenTutorial: true, favouriteGameIds: ['addition_snake'] });
  });

  it("shows the active learner's stars and achievements", () => {
    setLearnerMeta({ stars: 12, achievements: ['first_game', 'streak_5'] });
    const sibling = useGameStore.getState().addLearner({ displayName: 'Sibling' });
    const { unmount } = renderMenu();
    expect(screen.getByRole('button', { name: /Tähed\s*12/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Näita saavutusi' }).textContent).toContain('2');
    unmount();

    useGameStore.getState().setActiveLearner(sibling);
    renderMenu();
    expect(screen.getByRole('button', { name: /Tähed\s*0/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Näita saavutusi' }).textContent).toContain('0');
  });

  it('lists favourites, then every category open under its heading', () => {
    renderMenu();
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['Lemmikud', 'Keelemängud', 'Matemaatika', 'Loogika', 'Mälu']);
    expect(screen.queryByRole('navigation', { name: 'Valdkonnad' })).toBeNull();
  });

  it('shows a game row with its picture, title and level, and no pills', () => {
    renderMenu();
    const row = screen.getByRole('button', { name: /^Kaalud - .* - Tase 1$/ });
    expect(row.querySelector('svg[viewBox="0 0 80 64"]')).not.toBeNull();
    expect(within(row).getByText('Tase')).toBeInTheDocument();
    expect(row.querySelector('.fam-pill')).toBeNull();
    expect(within(row).queryByText('Uus')).toBeNull();
  });

  it('gives a favourite snake variant the snake picture and a mechanic row its pack count', () => {
    renderMenu();
    const favourite = screen.getByRole('button', { name: /^Liitmisuss - / });
    const snake = screen.getByRole('button', { name: /^Numbrimadu - .* - 6 harjutust$/ });
    expect(favourite.querySelector('svg')?.innerHTML).toBe(snake.querySelector('svg')?.innerHTML);
  });

  it('keeps the favourites heading and its edit control without favourites', () => {
    useGameStore.setState({ favouriteGameIds: [] });
    renderMenu();
    expect(screen.getByRole('heading', { name: 'Lemmikud' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Muuda lemmikuid' })).toBeInTheDocument();
  });

  it('does not auto-open the tutorial modal on first visit', () => {
    useGameStore.setState({ hasSeenTutorial: false });
    renderMenu();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Näita juhendit' })).toBeInTheDocument();
  });
});
