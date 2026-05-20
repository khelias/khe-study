import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setLocale } from '../../../i18n';
import type { Stats } from '../../../types/stats';
import { StatsModal } from '../StatsModal';

const stats: Stats = {
  gamesPlayed: 3,
  correctAnswers: 8,
  wrongAnswers: 2,
  totalScore: 120,
  maxStreak: 4,
  currentStreak: 1,
  maxLevels: {
    shape_shift: 4,
  },
  gamesByType: {
    shape_shift: 3,
  },
  totalTimePlayed: 180,
  lastPlayed: 123,
  collectedStars: 6,
  maxSnakeLength: 0,
};

describe('StatsModal', () => {
  beforeEach(() => {
    setLocale('et');
  });

  it('shows curriculum metadata in progress surfaces', () => {
    render(<StatsModal stats={stats} unlockedAchievements={[]} onClose={vi.fn()} />);

    const metadataRows = screen.getAllByText(
      'Kujundite ladumise pusled · 25 sisuühikut · lihtne / keskmine / raske',
    );

    expect(metadataRows.length).toBeGreaterThanOrEqual(2);
  });
});
