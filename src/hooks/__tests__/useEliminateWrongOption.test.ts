import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEliminateWrongOption, wrongOptionIndices } from '../useEliminateWrongOption';

const render = (wrong: number[], deps: unknown[], spendStars?: (count: number) => boolean) =>
  renderHook(({ wrong, deps, spendStars }) => useEliminateWrongOption(wrong, deps, spendStars), {
    initialProps: { wrong, deps, spendStars },
  });

describe('wrongOptionIndices', () => {
  it('returns the index of every option that is not the answer', () => {
    expect(wrongOptionIndices([3, 5, 7, 5], 5)).toEqual([0, 2]);
  });
});

describe('useEliminateWrongOption', () => {
  it('spends one star and eliminates a wrong option', () => {
    const spendStars = vi.fn(() => true);
    const { result } = render([0, 2], ['p1'], spendStars);

    let spent = false;
    act(() => {
      spent = result.current.eliminate();
    });

    expect(spent).toBe(true);
    expect(spendStars).toHaveBeenCalledWith(1);
    expect(result.current.eliminated).toHaveLength(1);
    expect([0, 2]).toContain(result.current.eliminated[0]);
  });

  it('does not eliminate when the star cannot be spent', () => {
    const { result } = render([0, 2], ['p1'], () => false);

    act(() => {
      expect(result.current.eliminate()).toBe(false);
    });

    expect(result.current.eliminated).toEqual([]);
  });

  it('does nothing without spendStars', () => {
    const { result } = render([0, 2], ['p1']);

    act(() => {
      expect(result.current.eliminate()).toBe(false);
    });

    expect(result.current.eliminated).toEqual([]);
  });

  it('stops without spending once every wrong option is gone', () => {
    const spendStars = vi.fn(() => true);
    const { result } = render([0, 2], ['p1'], spendStars);

    act(() => {
      result.current.eliminate();
      result.current.eliminate();
    });
    let spent = true;
    act(() => {
      spent = result.current.eliminate();
    });

    expect(spent).toBe(false);
    expect(spendStars).toHaveBeenCalledTimes(2);
    expect([...result.current.eliminated].sort()).toEqual([0, 2]);
  });

  it('picks distinct options on two calls before a re-render', () => {
    const { result } = render([0, 1, 2], ['p1'], () => true);
    const { eliminate } = result.current;

    act(() => {
      eliminate();
      eliminate();
    });

    expect(new Set(result.current.eliminated).size).toBe(2);
  });

  it('resets when a reset dependency changes', () => {
    const spendStars = vi.fn(() => true);
    const { result, rerender } = render([0, 2], ['p1'], spendStars);

    act(() => {
      result.current.eliminate();
    });
    rerender({ wrong: [0, 2], deps: ['p2'], spendStars });

    expect(result.current.eliminated).toEqual([]);
    act(() => {
      result.current.eliminate();
      result.current.eliminate();
    });
    expect(result.current.eliminated).toHaveLength(2);
  });

  it('stays reset when the deps change and change back', () => {
    const spendStars = vi.fn(() => true);
    const { result, rerender } = render([0, 2], ['p1'], spendStars);

    act(() => {
      result.current.eliminate();
      result.current.eliminate();
    });
    rerender({ wrong: [0, 2], deps: ['p2'], spendStars });
    rerender({ wrong: [0, 2], deps: ['p1'], spendStars });

    expect(result.current.eliminated).toEqual([]);
    let spent = false;
    act(() => {
      spent = result.current.eliminate();
    });
    expect(spent).toBe(true);
    expect(result.current.eliminated).toHaveLength(1);
  });
});
