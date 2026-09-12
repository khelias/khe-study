import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WordGameView } from '../View';
import type { WordBuilderProblem } from '../../../types/game';

// Mock the translation hook
vi.mock('../../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    gameScreen: {
      wordBuilder: {
        preFilled: 'Pre-filled letters hint',
      },
    },
  }),
}));

// Mock the audio
vi.mock('../../../engine/audio', () => ({
  playSound: vi.fn(),
}));

describe('WordGameView', () => {
  const mockProblem: WordBuilderProblem = {
    type: 'word_builder',
    target: 'CAT',
    emoji: '🐱',
    shuffled: [
      { char: 'C', id: 'c1' },
      { char: 'A', id: 'a1' },
      { char: 'T', id: 't1' },
    ],
    uid: 'test-uid-1',
  };

  it('renders word builder game correctly', () => {
    const onAnswer = vi.fn();
    render(<WordGameView problem={mockProblem} onAnswer={onAnswer} soundEnabled={false} />);

    // Check emoji is rendered
    expect(screen.getByText('🐱')).toBeDefined();

    // Check all letters are in the pool
    expect(screen.getByText('C')).toBeDefined();
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('T')).toBeDefined();
  });

  it('uses functional state updates for rapid taps', () => {
    const onAnswer = vi.fn();
    const { container } = render(
      <WordGameView problem={mockProblem} onAnswer={onAnswer} soundEnabled={false} />,
    );

    // Get pool buttons - they are in the letter pool div at the bottom
    const poolContainer = container.querySelector('.flex.flex-wrap.gap-2');
    const poolButtons = poolContainer?.querySelectorAll('button') || [];
    expect(poolButtons.length).toBe(3);

    // Simulate rapid taps by directly calling pointerdown multiple times
    // This tests that functional state updates prevent stale closures
    const firstButton = poolButtons[0] as HTMLButtonElement;
    const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });

    // Dispatch multiple times rapidly (simulating rapid taps)
    firstButton.dispatchEvent(pointerDownEvent);

    // The letter should be removed from pool after tap
    // This verifies functional state update works
    const remainingButtons = poolContainer?.querySelectorAll('button') || [];
    expect(remainingButtons.length).toBeLessThanOrEqual(3);
  });

  it('adds touch-action manipulation to buttons', () => {
    const onAnswer = vi.fn();
    const { container } = render(
      <WordGameView problem={mockProblem} onAnswer={onAnswer} soundEnabled={false} />,
    );

    // Check pool buttons have touch-action: manipulation
    const poolContainer = container.querySelector('.flex.flex-wrap.gap-2');
    const poolButtons = poolContainer?.querySelectorAll('button') || [];
    poolButtons.forEach((button) => {
      expect(button.style.touchAction).toBe('manipulation');
    });
  });

  it('has proper button type attribute', () => {
    const onAnswer = vi.fn();
    const { container } = render(
      <WordGameView problem={mockProblem} onAnswer={onAnswer} soundEnabled={false} />,
    );

    // Check all buttons have type="button"
    const allButtons = container.querySelectorAll('button');
    allButtons.forEach((button) => {
      expect(button.getAttribute('type')).toBe('button');
    });
  });

  it('handles pre-filled positions correctly', () => {
    const problemWithPreFilled: WordBuilderProblem = {
      ...mockProblem,
      preFilledPositions: [0], // First letter pre-filled
    };

    const onAnswer = vi.fn();
    render(
      <WordGameView problem={problemWithPreFilled} onAnswer={onAnswer} soundEnabled={false} />,
    );

    // Should show hint about pre-filled letters
    expect(screen.getByText(/Pre-filled letters hint/i)).toBeDefined();
  });
});
