import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { setLocale } from '../../../i18n';
import { THEME_CATALOG } from '../../../meta/themeCatalog';
import { useGameStore } from '../../../stores/gameStore';
import { ThemeShopSection } from '../ThemeShopSection';

function resetLearnerTheme() {
  const learner = useGameStore.getState().activeLearnerProfile;
  const next = { ...learner, preferences: { ...learner.preferences, theme: undefined } };
  useGameStore.setState({
    learners: [next],
    activeLearnerId: next.id,
    activeLearnerProfile: next,
    ownedThemeIds: [],
    soundEnabled: false,
  });
}

describe('ThemeShopSection', () => {
  beforeEach(() => {
    setLocale('et');
    resetLearnerTheme();
  });

  it('renders one card per catalog theme', () => {
    useGameStore.setState({ stars: 0 });
    render(<ThemeShopSection />);
    expect(screen.getAllByRole('listitem')).toHaveLength(THEME_CATALOG.length);
    for (const theme of THEME_CATALOG) {
      expect(screen.getByText(theme.name.et)).toBeInTheDocument();
    }
  });

  it('shows the default theme as in use when nothing is applied', () => {
    render(<ThemeShopSection />);
    expect(screen.getByRole('button', { name: 'Teema Klassikaline on kasutusel' })).toBeDisabled();
  });

  it('buys a theme and marks it in use', () => {
    useGameStore.setState({ stars: 30 });
    render(<ThemeShopSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Osta teema Meri, hind 30 tähte' }));

    expect(screen.getByRole('button', { name: 'Teema Meri on kasutusel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Kasuta teemat Klassikaline' })).toBeEnabled();
    expect(useGameStore.getState().stars).toBe(0);
  });

  it('disables buying when stars are short', () => {
    useGameStore.setState({ stars: 29 });
    render(<ThemeShopSection />);

    const buy = screen.getByRole('button', { name: 'Osta teema Meri, hind 30 tähte' });
    expect(buy).toBeDisabled();
    const card = buy.closest('li')!;
    expect(within(card).getByText('Pole piisavalt tähti')).toBeInTheDocument();
  });

  it('switches back to an owned theme', () => {
    useGameStore.setState({ stars: 0, ownedThemeIds: ['sea'] });
    render(<ThemeShopSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Kasuta teemat Meri' }));

    expect(useGameStore.getState().activeLearnerProfile.preferences.theme).toBe('sea');
    expect(screen.getByRole('button', { name: 'Teema Meri on kasutusel' })).toBeDisabled();
  });

  it('shows tier badges for paid themes only', () => {
    render(<ThemeShopSection />);
    expect(screen.getByText('Tavaline')).toBeInTheDocument();
    expect(screen.getByText('Haruldane')).toBeInTheDocument();
    expect(screen.getByText('Eriline')).toBeInTheDocument();
  });
});
