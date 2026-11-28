import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { setLocale } from '../../../i18n';
import { ACHIEVEMENTS } from '../../../engine/achievements';
import { AlbumScreen } from '../AlbumScreen';
import { setLearnerMeta } from '../../../test/utils';

const DAY = 86_400_000;

describe('AlbumScreen', () => {
  beforeEach(() => setLocale('et'));

  it('shows each path sticker with its game and day, then the empty places of the set', () => {
    const now = Date.now();
    setLearnerMeta({
      album: [
        { stickerId: 'fox', gameId: 'balance_scale', earnedAt: now },
        { stickerId: 'hedgehog', gameId: 'letter_match', earnedAt: now - DAY },
      ],
      achievements: ['first_game'],
    });
    render(
      <MemoryRouter>
        <AlbumScreen />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Minu album' })).toBeInTheDocument();
    const stickers = screen.getAllByTestId('album-sticker');
    expect(stickers.map((s) => s.textContent)).toEqual([
      'RebaneKaalud, täna',
      'SiilTähedetektiiv, eile',
    ]);

    const path = screen.getByRole('region', { name: 'Raja kleepsud' });
    expect(path).toHaveTextContent('2 / 9');
    expect(within(path).getAllByRole('listitem')).toHaveLength(9);

    const achievements = screen.getByRole('region', { name: 'Saavutuste kleepsud' });
    expect(achievements).toHaveTextContent(`1 / ${Object.keys(ACHIEVEMENTS).length}`);
    expect(screen.getByTestId('album-achievement')).toHaveTextContent('Esimene samm');
    expect(screen.getByRole('link', { name: 'Tagasi menüüsse' })).toHaveAttribute('href', '/');
  });
});
