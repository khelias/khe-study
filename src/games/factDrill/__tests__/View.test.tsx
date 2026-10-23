import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FactDrillView } from '../View';
import { generateMultiplicationFactDrill1To5 } from '../generator';
import { createRng } from '../../../engine/rng';
import { usePlaySessionStore } from '../../../stores/playSessionStore';

vi.mock('../../../engine/audio', () => ({
  playSound: vi.fn(),
}));

const GAME = 'multiplication_fact_drill_1_5';

const renderDrill = (paused = false) =>
  render(
    <MemoryRouter>
      <FactDrillView
        problem={generateMultiplicationFactDrill1To5(1, createRng(3))}
        onAnswer={vi.fn()}
        soundEnabled={false}
        gameType={GAME}
        paused={paused}
      />
    </MemoryRouter>,
  );

const secondsLeft = (): number =>
  Number(
    screen
      .getByText(/^\d+s$/)
      .textContent?.replace('s', '')
      .trim(),
  );

/** The answer typed so far, shown after the equation's "=". */
const typedAnswer = (): string | null | undefined =>
  document.querySelector('.text-amber-600')?.textContent;

describe('FactDrillView session', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
        'Date',
      ],
    });
    usePlaySessionStore.getState().resetSessionState();
    usePlaySessionStore.getState().startGame(GAME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resets the session score when restarted mid-sprint', () => {
    usePlaySessionStore.getState().addScore(40);
    renderDrill();

    fireEvent.click(screen.getByRole('button', { name: /Alusta uuesti|Start over/ }));

    expect(usePlaySessionStore.getState().score).toBe(0);
  });

  it('resets the session score when retried after time up', () => {
    renderDrill();
    act(() => {
      vi.advanceTimersByTime(61_000);
    });
    usePlaySessionStore.getState().addScore(25);

    fireEvent.click(screen.getByRole('button', { name: /Proovi uuesti|Try again/i }));

    expect(usePlaySessionStore.getState().score).toBe(0);
  });

  it('holds the clock while paused', () => {
    renderDrill(true);
    const before = secondsLeft();
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(secondsLeft()).toBe(before);
  });

  it('leaves the keys to the covering sheet while paused', () => {
    const { rerender } = renderDrill(true);
    const typed = fireEvent.keyDown(window, { key: '7' });
    expect(typed).toBe(true);
    expect(typedAnswer()).toBe('?');

    rerender(
      <MemoryRouter>
        <FactDrillView
          problem={generateMultiplicationFactDrill1To5(1, createRng(3))}
          onAnswer={vi.fn()}
          soundEnabled={false}
          gameType={GAME}
        />
      </MemoryRouter>,
    );
    fireEvent.keyDown(window, { key: '7' });
    expect(typedAnswer()).toBe('7');
  });
});
