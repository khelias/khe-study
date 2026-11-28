import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameAudio } from '../useGameAudio';

vi.mock('../../engine/audio', () => ({
  playSound: vi.fn(),
  playMoment: vi.fn(),
}));

import { playSound } from '../../engine/audio';

describe('useGameAudio', () => {
  it('plays the click with the sound setting', () => {
    const on = renderHook(() => useGameAudio(true));
    act(() => on.result.current.playClick());
    expect(playSound).toHaveBeenCalledWith('click', true);

    const off = renderHook(() => useGameAudio(false));
    act(() => off.result.current.playClick());
    expect(playSound).toHaveBeenCalledWith('click', false);
  });
});
