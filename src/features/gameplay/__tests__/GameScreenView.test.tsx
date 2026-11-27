import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { GameScreenView } from '../GameScreenView';

const view = (gameType: string) => {
  const noop = vi.fn();
  return render(
    <GameScreenView
      bgClass=""
      confetti={false}
      enhancedConfetti={false}
      particleActive={false}
      onEnhancedConfettiComplete={noop}
      notifications={[]}
      onNotificationDismiss={noop}
      score={0}
      round={null}
      showSettingsMenu={false}
      settingsMenuRef={createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>}
      settingsMenuSlot={null}
      onReturnToMenu={noop}
      onSettingsClick={noop}
      onShopClick={noop}
      currentLevel={1}
      gameType={gameType}
      onLevelBadgeClick={noop}
      problem={null}
      soundEnabled={false}
      stars={0}
      spendStars={() => false}
      onFailure={noop}
      onTimeUp={noop}
      onAnswer={noop}
      onMove={undefined}
      paused={false}
      onTipReplay={noop}
      canReopenTip={false}
    />,
  );
};

describe('the play area', () => {
  it('is the light stage for a boxed game', () => {
    const { container } = view('balance_scale');
    const stage = container.querySelector('[data-stage]');
    expect(stage?.getAttribute('data-stage')).toBe('boxed');
    expect(stage?.classList.contains('light-stage')).toBe(true);
  });

  it('takes the full height without the light stage for an immersive game', () => {
    const { container } = view('star_mapper');
    const stage = container.querySelector('[data-stage]');
    expect(stage?.getAttribute('data-stage')).toBe('immersive');
    expect(stage?.classList.contains('light-stage')).toBe(false);
    expect(stage?.classList.contains('flex-1')).toBe(true);
  });
});
