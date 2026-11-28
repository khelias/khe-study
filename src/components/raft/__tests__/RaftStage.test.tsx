import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { RaftStage } from '../RaftStage';
import { createRound, type RoundState } from '../../../engine/round';
import { playMoment } from '../../../engine/audio';
import { setLocale } from '../../../i18n';
import { usePlaySessionStore } from '../../../stores/playSessionStore';

vi.mock('../../../engine/audio', () => ({ playMoment: vi.fn() }));

const fresh = createRound({ kind: 'tasks', size: 8 });
const setRound = (round: RoundState) => act(() => usePlaySessionStore.setState({ round }));
const buoys = () =>
  Array.from(document.querySelectorAll('[data-buoy]')).map((b) => b.getAttribute('data-buoy'));

describe('RaftStage', () => {
  beforeEach(() => {
    setLocale('et');
    vi.mocked(playMoment).mockClear();
    usePlaySessionStore.setState({ round: fresh });
  });

  it('shows the round as buoys, the next one ringed', () => {
    render(<RaftStage taskKey="a">piece</RaftStage>);
    expect(screen.getByTestId('round-goal').getAttribute('aria-label')).toBe('Ring 0/8');
    expect(buoys()).toEqual(['next', ...Array(7).fill('ahead')]);
    expect(screen.getByText('piece')).toBeTruthy();
  });

  it('moves on with the oars on a right answer and keeps a missed buoy red', () => {
    render(<RaftStage taskKey="a">piece</RaftStage>);
    const missed = { ...fresh, lives: 2, lostLife: true, misses: [0] };
    setRound(missed);
    setRound({ ...missed, progress: 1 });
    setRound({ ...missed, progress: 2 });

    expect(buoys().slice(0, 3)).toEqual(['missed', 'passed', 'next']);
    expect(screen.getByTestId('raft-stage').getAttribute('data-progress')).toBe('2');
    expect(playMoment).toHaveBeenCalledWith('raft', expect.any(Boolean), 0.25);
  });

  it('starts the next round with clean buoys', () => {
    render(<RaftStage taskKey="a">piece</RaftStage>);
    setRound({ ...fresh, lives: 1, misses: [0], progress: 8, status: 'reached' });
    expect(buoys()).toEqual(['missed', ...Array(7).fill('passed')]);
    setRound(fresh);
    expect(buoys()).toEqual(['next', ...Array(7).fill('ahead')]);
  });
});
