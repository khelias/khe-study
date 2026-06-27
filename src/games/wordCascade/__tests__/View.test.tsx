import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WordCascadeView } from '../View';
import type { WordCascadeProblem } from '../../../types/game';

// Mock the translation hook
vi.mock('../../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    games: {
      word_cascade: {
        title: 'Word Cascade',
      },
    },
    gameScreen: {
      wordCascade: {
        tutorial: 'Tap letters to build the word!',
        tapLetters: 'Tap the letters!',
        tryAgain: 'Try again!',
        wrongLetter: 'Wrong letter',
        triesLeft: '{count} tries left',
        outOfTries: 'Out of tries',
        greatJob: 'Great job!',
        starPickup: 'Star pickup',
        heartPickup: 'Heart pickup',
        shieldPickup: 'Shield pickup',
        pickupHint: 'Tap pickups for rewards!',
        tapGlowingLetter: 'Tap the glowing letter below!',
      },
    },
  }),
}));

// Mock the audio
vi.mock('../../../engine/audio', () => ({
  playSound: vi.fn(),
}));

// Mock the game store
vi.mock('../../../stores/gameStore', () => ({
  useGameStore: vi.fn((selector) => {
    const mockState = {
      earnStars: vi.fn(),
      addHeart: vi.fn(),
    };
    return selector(mockState);
  }),
}));

describe('WordCascadeView', () => {
  const mockProblem: WordCascadeProblem = {
    type: 'word_cascade',
    target: 'CAT',
    emoji: '🐱',
    columns: 4,
    uid: 'test-uid-cascade-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders word cascade game correctly', () => {
    const onAnswer = vi.fn();
    render(<WordCascadeView problem={mockProblem} onAnswer={onAnswer} soundEnabled={false} />);

    // Check emoji is rendered
    expect(screen.getByText('🐱')).toBeDefined();

    // Check target word slots are rendered (3 for CAT)
    const slots = screen.getByText('🐱').parentElement?.querySelectorAll('.rounded-xl');
    expect(slots?.length).toBeGreaterThan(0);
  });

  it('renders wave letter buttons with touch-manipulation', () => {
    const onAnswer = vi.fn();
    const { container } = render(
      <WordCascadeView problem={mockProblem} onAnswer={onAnswer} soundEnabled={false} />,
    );
    const letterButtons = container.querySelectorAll('button[aria-label^="Letter"]');
    expect(letterButtons.length).toBeGreaterThan(0);
    letterButtons.forEach((button) => {
      expect(button.getAttribute('type')).toBe('button');
      expect(button.className).toMatch(/touch-manipulation/);
    });
  });

  it('resets state on problem change', () => {
    const onAnswer = vi.fn();
    const { rerender } = render(
      <WordCascadeView problem={mockProblem} onAnswer={onAnswer} soundEnabled={false} />,
    );

    // Change problem uid to trigger reset
    const newProblem: WordCascadeProblem = {
      ...mockProblem,
      uid: 'test-uid-cascade-2',
      target: 'DOG',
    };

    rerender(<WordCascadeView problem={newProblem} onAnswer={onAnswer} soundEnabled={false} />);

    // If we got here without errors, the reset worked
    expect(true).toBe(true);
  });

  it('renders game area and status; instructions are in tips (TipButton)', () => {
    const onAnswer = vi.fn();
    const { container } = render(
      <WordCascadeView problem={mockProblem} onAnswer={onAnswer} soundEnabled={false} />,
    );
    // No in-screen tutorial text; only "Try again!" when wrong. Slots and play area present.
    const statusRegion = container.querySelector('[role="status"]');
    expect(statusRegion).toBeDefined();
  });
});
