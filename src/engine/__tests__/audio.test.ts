import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const started: number[] = [];

class FakeAudioContext {
  currentTime = 0;
  state = 'running';
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: (hz: number) => started.push(hz) },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }
}

describe('playMoment', () => {
  beforeEach(() => {
    started.length = 0;
    vi.resetModules();
    vi.stubGlobal('AudioContext', FakeAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('plays nothing while sound is off', async () => {
    const { playMoment } = await import('../audio');
    playMoment('right', false);
    expect(started).toEqual([]);
  });

  it('plays a rising pair for a right answer and a single low tone for a wrong one', async () => {
    const { playMoment } = await import('../audio');
    playMoment('right');
    expect(started).toHaveLength(2);
    expect(started[1]).toBeGreaterThan(started[0]!);

    started.length = 0;
    playMoment('wrong');
    expect(started).toEqual([220]);
  });

  it('plays a falling pair for a lost life and a rising run for a new level', async () => {
    const { playMoment } = await import('../audio');
    playMoment('lifeLost');
    expect(started[1]).toBeLessThan(started[0]!);

    started.length = 0;
    playMoment('levelUp');
    expect(started).toEqual([...started].sort((a, b) => a - b));
    expect(started).toHaveLength(3);
  });
});
