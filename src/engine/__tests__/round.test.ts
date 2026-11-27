import { describe, expect, it } from 'vitest';
import {
  createRound,
  finishTimedRound,
  gainRoundLife,
  isRoundPerfect,
  loseRoundLife,
  recordRoundAnswer,
  ROUND_LIVES,
  roundHasLives,
  type RoundSpec,
  type RoundState,
} from '../round';

const answerTimes = (round: RoundState, times: number, isCorrect = true): RoundState => {
  let next = round;
  for (let i = 0; i < times; i++) next = recordRoundAnswer(next, isCorrect);
  return next;
};

describe('round', () => {
  it('starts with three lives and no progress', () => {
    const round = createRound({ kind: 'tasks', size: 8 });
    expect(round).toMatchObject({ progress: 0, lives: ROUND_LIVES, status: 'playing' });
  });

  describe('goal per kind', () => {
    it.each<[RoundSpec['kind'], number]>([
      ['tasks', 8],
      ['board', 2],
      ['run', 1],
      ['puzzle', 3],
    ])('a %s round of %i reaches its goal on its last right answer', (kind, size) => {
      const before = answerTimes(createRound({ kind, size }), size - 1);
      expect(before.status).toBe('playing');
      const after = recordRoundAnswer(before, true);
      expect(after.status).toBe('reached');
      expect(after.progress).toBe(size);
    });

    it('a wrong answer does not move the goal', () => {
      const round = recordRoundAnswer(createRound({ kind: 'tasks', size: 8 }), false);
      expect(round.progress).toBe(0);
      expect(round.answered).toBe(1);
    });

    it('a board counted on its win ignores right answers until the win', () => {
      const spec: RoundSpec = { kind: 'board', size: 1, countsOn: 'win' };
      const shots = answerTimes(createRound(spec), 5);
      expect(shots.progress).toBe(0);
      expect(shots.correct).toBe(5);
      const won = recordRoundAnswer(shots, true, { confirmsWin: true });
      expect(won.status).toBe('reached');
      expect(won.answered).toBe(5);
    });

    it('takes no answers once the round has ended', () => {
      const reached = answerTimes(createRound({ kind: 'run', size: 1 }), 1);
      expect(recordRoundAnswer(reached, true)).toBe(reached);
      expect(loseRoundLife(reached)).toBe(reached);
    });
  });

  describe('lives', () => {
    it('the third failure ends the round', () => {
      let round = createRound({ kind: 'tasks', size: 8 });
      round = loseRoundLife(loseRoundLife(round));
      expect(round).toMatchObject({ lives: 1, status: 'playing' });
      round = loseRoundLife(round);
      expect(round).toMatchObject({ lives: 0, status: 'lost' });
    });

    it('a new round has its lives back', () => {
      const lost = loseRoundLife(
        loseRoundLife(loseRoundLife(createRound({ kind: 'run', size: 1 }))),
      );
      expect(lost.status).toBe('lost');
      expect(createRound(lost.spec).lives).toBe(ROUND_LIVES);
    });

    it('a timed round has no lives to lose', () => {
      const spec: RoundSpec = { kind: 'timed', size: 0 };
      expect(roundHasLives(spec)).toBe(false);
      const round = createRound(spec);
      expect(loseRoundLife(round)).toBe(round);
    });

    it('is perfect only when no life was lost', () => {
      const spec: RoundSpec = { kind: 'tasks', size: 2 };
      expect(isRoundPerfect(answerTimes(createRound(spec), 2))).toBe(true);
      const withLoss = answerTimes(loseRoundLife(createRound(spec)), 2);
      expect(withLoss.status).toBe('reached');
      expect(isRoundPerfect(withLoss)).toBe(false);
    });

    it('gives a lost life back up to three, and a regained life is still not perfect', () => {
      const spec: RoundSpec = { kind: 'board', size: 1 };
      const full = createRound(spec);
      expect(gainRoundLife(full)).toBe(full);
      const regained = gainRoundLife(loseRoundLife(full));
      expect(regained.lives).toBe(ROUND_LIVES);
      expect(isRoundPerfect(answerTimes(regained, 1))).toBe(false);
      const lost = loseRoundLife(loseRoundLife(loseRoundLife(full)));
      expect(gainRoundLife(lost)).toBe(lost);
      const timed = createRound({ kind: 'timed', size: 0 });
      expect(gainRoundLife(timed)).toBe(timed);
    });
  });

  describe('timed round', () => {
    const spec: RoundSpec = { kind: 'timed', size: 0 };

    it('never reaches its goal before the clock stops', () => {
      expect(answerTimes(createRound(spec), 30).status).toBe('playing');
    });

    it('reaches its goal at 90% right with at least ten answers', () => {
      const round = recordRoundAnswer(answerTimes(createRound(spec), 9), false);
      expect(finishTimedRound(round).status).toBe('reached');
    });

    it('is lost under ten answers or under 90%', () => {
      expect(finishTimedRound(answerTimes(createRound(spec), 9)).status).toBe('lost');
      const twoWrong = answerTimes(answerTimes(createRound(spec), 8), 2, false);
      expect(finishTimedRound(twoWrong).status).toBe('lost');
    });

    it('a round with lives is not judged by the clock', () => {
      const round = createRound({ kind: 'tasks', size: 8 });
      expect(finishTimedRound(round)).toBe(round);
    });
  });
});
