import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakLine } from '../StreakLine';
import { createRound } from '../../engine/round';
import { setLocale } from '../../i18n';
import { usePlaySessionStore } from '../../stores/playSessionStore';

describe('StreakLine', () => {
  beforeEach(() => {
    setLocale('et');
    usePlaySessionStore.setState({ round: createRound({ kind: 'tasks', size: 6 }) });
  });

  it('says nothing below three in a row', () => {
    usePlaySessionStore.setState({ currentStreak: 2 });
    render(<StreakLine />);
    expect(screen.queryByTestId('streak-line')).toBeNull();
  });

  it('counts the run from the third right answer', () => {
    usePlaySessionStore.setState({ currentStreak: 3 });
    render(<StreakLine />);
    expect(screen.getByTestId('streak-line')).toHaveTextContent('3 õiget järjest');
  });

  it('stays quiet once the round is over', () => {
    usePlaySessionStore.setState({
      currentStreak: 4,
      round: { ...createRound({ kind: 'tasks', size: 6 }), status: 'reached' },
    });
    render(<StreakLine />);
    expect(screen.queryByTestId('streak-line')).toBeNull();
  });
});
