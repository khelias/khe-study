import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setLocale } from '../../../i18n';
import { STAR_PURCHASE_AMOUNT, useGameStore } from '../../../stores/gameStore';
import { learnerMeta, setLearnerMeta } from '../../../test/utils';
import { ShopModal } from '../ShopModal';

describe('ShopModal', () => {
  beforeEach(() => {
    setLocale('et');
    useGameStore.setState({ soundEnabled: false, demoStarsEnabled: false });
    setLearnerMeta({ stars: 4 });
  });

  it("shows the active learner's stars and no free stars by default", () => {
    render(<ShopModal onClose={vi.fn()} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.queryByText('Tasuta tähed')).toBeNull();
  });

  it('offers free stars while the demo switch is on', () => {
    useGameStore.setState({ demoStarsEnabled: true });
    render(<ShopModal onClose={vi.fn()} />);
    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(`Lisa ${STAR_PURCHASE_AMOUNT}`) }),
    );
    expect(learnerMeta().stars).toBe(4 + STAR_PURCHASE_AMOUNT);
    expect(learnerMeta().stats.collectedStars).toBe(0);
  });
});
