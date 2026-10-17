import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getTranslations } from '../../i18n';
import { getGameTips, useGameTips } from '../useGameTips';

describe('useGameTips', () => {
  const tipsFor = (gameType: string) =>
    renderHook(() =>
      useGameTips(gameType, null, [], () => {}, false),
    ).result.current.getTipsForGame(gameType);

  it('reads the tips by game id', () => {
    expect(tipsFor('balance_scale')).toEqual(getGameTips(getTranslations(), 'balance_scale'));
    expect(tipsFor('balance_scale').length).toBeGreaterThan(0);
  });

  it('shows no toast tips for a config with tipToast: false', () => {
    expect(getGameTips(getTranslations(), 'multiplication_fact_drill_1_5').length).toBeGreaterThan(
      0,
    );
    expect(tipsFor('multiplication_fact_drill_1_5')).toEqual([]);
  });
});
