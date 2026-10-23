import { StrictMode } from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { WordGameView } from '../View';
import type { WordBuilderProblem } from '../../../types/game';

// Mock the translation hook
vi.mock('../../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    common: { forStars_one: 'for {count} star', forStars_other: 'for {count} stars' },
    feedback: { correctAnswerIs: 'The answer is {answer}' },
    gameScreen: {
      wordBuilder: {
        instruction: 'Build the word',
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
    expect(screen.getByText('Build the word')).toBeDefined();

    // Check all letters are in the pool
    expect(screen.getByText('C')).toBeDefined();
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('T')).toBeDefined();
  });

  it('moves a letter into the word on click, which keyboard Enter and Space also fire', () => {
    const onAnswer = vi.fn();
    const { container } = render(
      <WordGameView problem={mockProblem} onAnswer={onAnswer} soundEnabled={false} />,
    );

    const poolContainer = container.querySelector('.flex.flex-wrap.gap-2');
    const poolButtons = poolContainer?.querySelectorAll('button') ?? [];
    expect(poolButtons.length).toBe(3);

    fireEvent.click(poolButtons[0] as HTMLButtonElement);

    expect(poolContainer?.querySelectorAll('button').length).toBe(2);
    expect(screen.getByText('C')).toBeDefined();
  });

  describe('answering under StrictMode', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    const build = (letters: string) => {
      vi.useFakeTimers();
      const onAnswer = vi.fn();
      const { container } = render(
        <StrictMode>
          <WordGameView problem={mockProblem} onAnswer={onAnswer} soundEnabled={false} />
        </StrictMode>,
      );
      const pool = () => [
        ...(container.querySelector('.flex.flex-wrap.gap-2')?.querySelectorAll('button') ?? []),
      ];
      for (const letter of letters) {
        const button = pool().find((b) => b.textContent === letter);
        if (!button) throw new Error(`No ${letter} in the pool`);
        fireEvent.click(button);
      }
      return { onAnswer, pool };
    };

    it('answers a right word once', () => {
      const { onAnswer } = build('CAT');
      act(() => {
        vi.runAllTimers();
      });
      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith(true);
    });

    it('answers a wrong word once, after showing the right one', () => {
      const { onAnswer, pool } = build('TAC');
      expect(screen.getByText('The answer is CAT')).toBeDefined();
      const slots = screen
        .getAllByRole('button')
        .filter((b) => /^[TAC]$/.test(b.textContent ?? ''));
      expect(slots.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith(false);
      expect(pool()).toHaveLength(3);
    });
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
