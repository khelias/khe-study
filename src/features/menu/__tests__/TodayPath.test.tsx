import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setLocale } from '../../../i18n';
import { useGameStore } from '../../../stores/gameStore';
import { TodayPath } from '../TodayPath';
import { localDay } from '../../../meta/path';
import { setLearnerMeta } from '../../../test/utils';

const renderPath = (layout: 'phone' | 'desktop' = 'phone', onPlay = vi.fn()) => {
  render(
    <MemoryRouter>
      <TodayPath layout={layout} onPlay={onPlay} />
    </MemoryRouter>,
  );
  return onPlay;
};

describe('TodayPath', () => {
  const today = localDay(Date.now());

  beforeEach(() => {
    setLocale('et');
    setLearnerMeta({
      path: {
        day: today,
        slots: [
          { gameId: 'balance_scale', stickerId: 'fox' },
          { gameId: 'letter_match', stickerId: null },
          { gameId: 'pattern', stickerId: null },
        ],
      },
      streak: { days: 2, lastDay: localDay(Date.now() - 86_400_000) },
      album: [{ stickerId: 'fox', gameId: 'balance_scale', earnedAt: Date.now() }],
      achievements: ['first_game'],
    });
  });

  it('shows the done round with its sticker and plays the next one', () => {
    const onPlay = renderPath();
    expect(screen.getByRole('heading', { name: 'Tänane rada' })).toBeInTheDocument();
    expect(screen.getByTestId('path-slot-0')).toHaveAttribute('data-state', 'done');
    expect(screen.getByTestId('path-slot-1')).toHaveAttribute('data-state', 'next');
    expect(screen.getByTestId('path-slot-2')).toHaveAttribute('data-state', 'later');
    fireEvent.click(screen.getByRole('button', { name: 'Mängi: Tähedetektiiv' }));
    expect(onPlay).toHaveBeenCalledWith(1, 'letter_match');
  });

  it('counts the streak and the album, path and achievement stickers together', () => {
    renderPath('desktop');
    expect(screen.getByTestId('path-streak')).toHaveTextContent('2 päeva järjest');
    expect(screen.getByRole('link', { name: /Minu album\s*2 kleepsu/ })).toHaveAttribute(
      'href',
      '/album',
    );
  });

  it('picks a new path on a new day', () => {
    setLearnerMeta({
      path: { day: '2020-01-01', slots: [{ gameId: 'pattern', stickerId: 'fox' }] },
    });
    renderPath();
    const path = useGameStore.getState().activeLearnerProfile.meta.path!;
    expect(path.day).toBe(today);
    expect(path.slots).toHaveLength(3);
    expect(screen.getByTestId('path-slot-0')).toHaveAttribute('data-state', 'next');
  });

  it('says the day is done when every round has its sticker', () => {
    setLearnerMeta({
      path: {
        day: today,
        slots: ['fox', 'owl', 'bear'].map((stickerId) => ({ gameId: 'pattern', stickerId })),
      },
    });
    renderPath();
    expect(screen.getByRole('heading', { name: 'Tänane rada tehtud!' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Mängi/ })).toBeNull();
  });

  it("names the parent's focus over the path", () => {
    setLearnerMeta({ focus: { kind: 'subject', subject: 'math' } });
    renderPath();
    expect(screen.getByTestId('path-focus')).toHaveTextContent('Täna harjutad: Matemaatika');
  });
});
