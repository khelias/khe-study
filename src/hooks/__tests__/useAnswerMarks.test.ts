import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAnswerMarks } from '../useAnswerMarks';
import { playMoment } from '../../engine/audio';

vi.mock('../../engine/audio', () => ({ playMoment: vi.fn() }));

describe('useAnswerMarks', () => {
  it('marks a wrong answer, shows the right one, and keeps both until the task changes', () => {
    const { result, rerender } = renderHook(({ key }) => useAnswerMarks<string>(key, '4', true), {
      initialProps: { key: 'a' },
    });
    expect(result.current.markOf('4')).toBeNull();

    act(() => result.current.markWrong('2'));
    expect(result.current.markOf('2')).toBe('wrong');
    expect(result.current.markOf('4')).toBe('shown');
    expect(playMoment).toHaveBeenLastCalledWith('wrong', true);

    act(() => {
      result.current.markRight('4');
    });
    expect(result.current.markOf('4')).toBe('right');
    expect(result.current.markOf('2')).toBe('wrong');
    expect(playMoment).toHaveBeenLastCalledWith('right', true);

    rerender({ key: 'b' });
    expect(result.current.markOf('2')).toBeNull();
    expect(result.current.markOf('4')).toBeNull();
  });

  it('gives a button its mark, disables a wrong one and keeps the idle look unmarked', () => {
    const { result } = renderHook(() => useAnswerMarks<string>('a', '4', false));
    expect(result.current.buttonProps('3', 'idle', 'base')).toEqual({
      mark: null,
      'data-mark': undefined,
      disabled: false,
      className: 'idle',
    });

    act(() => result.current.markWrong('3'));
    expect(result.current.buttonProps('3', 'idle', 'base')).toEqual({
      mark: 'wrong',
      'data-mark': 'wrong',
      disabled: true,
      className: 'base answer-mark answer-mark-wrong',
    });
    expect(result.current.buttonProps('4', 'idle').className).toBe(
      'bg-white answer-mark answer-mark-shown',
    );
  });
});
