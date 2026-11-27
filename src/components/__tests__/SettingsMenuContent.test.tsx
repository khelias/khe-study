import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsMenuContent, type SettingsMenuContentProps } from '../SettingsMenuContent';
import { StudyThemeProvider } from '../../theme/StudyThemeProvider';
import { THEME_STORAGE_KEY } from '../../theme/themeKey';
import { setLocale } from '../../i18n';
import { mockMatchMedia } from '../../test/utils';
import { useGameStore } from '../../stores/gameStore';

const renderMenu = (props: Partial<SettingsMenuContentProps>) => {
  const base: SettingsMenuContentProps = {
    soundEnabled: true,
    onToggleSound: vi.fn(),
    onReturnToMenu: vi.fn(),
    onClose: vi.fn(),
    isGameScreen: true,
    gameType: 'balance_scale',
  };
  return render(
    <StudyThemeProvider>
      <SettingsMenuContent {...base} {...props} />
    </StudyThemeProvider>,
  );
};

describe('the game menu', () => {
  beforeEach(() => setLocale('et'));
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
  });

  it('on a phone holds the level, the score, the description and the theme', () => {
    const onLevelClick = vi.fn();
    const onShowDescription = vi.fn();
    const onClose = vi.fn();
    mockMatchMedia(true);
    renderMenu({ level: 2, onLevelClick, score: 42, onShowDescription, onClose });

    fireEvent.click(screen.getByRole('menuitem', { name: 'Muuda taset: 2' }));
    expect(onLevelClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('session-score').textContent).toContain('42');
    fireEvent.click(screen.getByRole('menuitem', { name: 'Kuidas mängida' }));
    expect(onShowDescription).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(2);

    const theme = screen.getByRole('menuitemcheckbox', { name: 'Tume teema' });
    // The mock matches every query, prefers-color-scheme: dark included.
    expect(theme.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(theme);
    expect(theme.getAttribute('aria-checked')).toBe('false');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('on desktop leaves level and score to the bar', () => {
    renderMenu({
      level: 2,
      onLevelClick: vi.fn(),
      score: 42,
      onShowDescription: vi.fn(),
    });
    expect(screen.queryByRole('menuitem', { name: 'Muuda taset: 2' })).toBeNull();
    expect(screen.queryByTestId('session-score')).toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Kuidas mängida' })).toBeTruthy();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Tume teema' })).toBeTruthy();
  });

  it('offers no level for a game without levels', () => {
    mockMatchMedia(true);
    renderMenu({
      gameType: 'multiplication_fact_drill_1_5',
      level: 2,
      onLevelClick: vi.fn(),
      score: 0,
    });
    expect(screen.queryByRole('menuitem', { name: /Muuda taset/ })).toBeNull();
  });

  it('keeps the game items and the theme off the picker menu', () => {
    render(
      <SettingsMenuContent
        soundEnabled={true}
        onToggleSound={vi.fn()}
        onReturnToMenu={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText('Mäng')).toBeNull();
    expect(screen.queryByRole('menuitemcheckbox', { name: 'Tume teema' })).toBeNull();
  });

  it('in the main menu holds the free-stars switch, off by default', () => {
    useGameStore.setState({ demoStarsEnabled: false });
    renderMenu({ isGameScreen: false, gameType: undefined });

    const demo = screen.getByRole('menuitemcheckbox', { name: 'Tasuta tähed poes' });
    expect(demo.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(demo);
    expect(useGameStore.getState().demoStarsEnabled).toBe(true);
    expect(demo.getAttribute('aria-checked')).toBe('true');
    expect(screen.queryByRole('menuitemcheckbox', { name: 'Tume teema' })).toBeNull();
  });

  it('during play has no free-stars switch', () => {
    renderMenu({});
    expect(screen.queryByRole('menuitemcheckbox', { name: 'Tasuta tähed poes' })).toBeNull();
  });
});
