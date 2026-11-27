import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCompactPlay } from '../useCompactPlay';
import { mockMatchMedia } from '../../test/utils';

describe('useCompactPlay', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('asks for a narrow or a short viewport', () => {
    const spy = mockMatchMedia(true);
    renderHook(() => useCompactPlay());
    expect(spy).toHaveBeenCalledWith('(max-width: 767px), (max-height: 520px)');
  });

  it('follows the query', () => {
    mockMatchMedia(true);
    expect(renderHook(() => useCompactPlay()).result.current).toBe(true);
    mockMatchMedia(false);
    expect(renderHook(() => useCompactPlay()).result.current).toBe(false);
  });
});
