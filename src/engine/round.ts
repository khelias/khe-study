/**
 * Rounds (ADR 0005 point 1).
 *
 * A game is played in rounds with a visible goal and three lives of their own.
 * A wrong answer or a game's own failure costs a life; the round ends when its
 * goal is reached or its lives run out. A timed round has no lives and is
 * judged when its clock stops. Pure: the play-session store holds the state.
 */

/** What the round's goal counts: tasks answered, boards, runs or puzzles; or a clock. */
export type RoundGoalKind = 'tasks' | 'board' | 'run' | 'puzzle' | 'timed';

export interface RoundSpec {
  kind: RoundGoalKind;
  /** Goal steps that reach the round's goal (ignored for a timed round). */
  size: number;
  /**
   * Which right answer is a goal step: every one (default), or only the call
   * that confirms a won game (BattleLearn, whose right answers fire shots).
   */
  countsOn?: 'answer' | 'win';
}

export type RoundStatus = 'playing' | 'reached' | 'lost';

export interface RoundState {
  spec: RoundSpec;
  progress: number;
  lives: number;
  /** A life was lost, even if a BattleLearn heart gave it back. */
  lostLife: boolean;
  answered: number;
  correct: number;
  status: RoundStatus;
}

export const ROUND_LIVES = 3;
export const TIMED_ROUND_MIN_ANSWERS = 10;
export const TIMED_ROUND_ACCURACY = 0.9;

export const isTimedRound = (spec: RoundSpec): boolean => spec.kind === 'timed';

export const roundHasLives = (spec: RoundSpec): boolean => !isTimedRound(spec);

export const createRound = (spec: RoundSpec): RoundState => ({
  spec,
  progress: 0,
  lives: roundHasLives(spec) ? ROUND_LIVES : 0,
  lostLife: false,
  answered: 0,
  correct: 0,
  status: 'playing',
});

/** A right answer, or the call that confirms a won game, moves the goal on. */
export const recordRoundAnswer = (
  state: RoundState,
  isCorrect: boolean,
  options: { confirmsWin?: boolean } = {},
): RoundState => {
  if (state.status !== 'playing') return state;
  const confirmsWin = options.confirmsWin ?? false;
  const answered = confirmsWin ? state.answered : state.answered + 1;
  const correct = !confirmsWin && isCorrect ? state.correct + 1 : state.correct;
  const isGoalStep = isCorrect && confirmsWin === (state.spec.countsOn === 'win');
  const progress = isGoalStep ? state.progress + 1 : state.progress;
  const reached = !isTimedRound(state.spec) && progress >= state.spec.size;
  return { ...state, answered, correct, progress, status: reached ? 'reached' : 'playing' };
};

/** A wrong answer or a game's own failure. Free in a timed round. */
export const loseRoundLife = (state: RoundState): RoundState => {
  if (state.status !== 'playing' || !roundHasLives(state.spec)) return state;
  const lives = Math.max(0, state.lives - 1);
  return { ...state, lives, lostLife: true, status: lives === 0 ? 'lost' : 'playing' };
};

/** A life back, as BattleLearn's heart cell gives, up to the round's three. */
export const gainRoundLife = (state: RoundState): RoundState => {
  if (state.status !== 'playing' || !roundHasLives(state.spec)) return state;
  if (state.lives >= ROUND_LIVES) return state;
  return { ...state, lives: state.lives + 1 };
};

/** The clock of a timed round stopped: at least ten answers, 90% of them right. */
export const finishTimedRound = (state: RoundState): RoundState => {
  if (state.status !== 'playing' || !isTimedRound(state.spec)) return state;
  const reached =
    state.answered >= TIMED_ROUND_MIN_ANSWERS &&
    state.correct / state.answered >= TIMED_ROUND_ACCURACY;
  return { ...state, status: reached ? 'reached' : 'lost' };
};

/** Right answers as a whole percentage of the round's answers. */
export const roundAccuracy = (state: RoundState): number =>
  state.answered === 0 ? 0 : Math.round((state.correct / state.answered) * 100);

/** A round reached without losing a life (a timed one without a wrong answer). */
export const isRoundPerfect = (state: RoundState): boolean =>
  state.status === 'reached' &&
  (roundHasLives(state.spec) ? !state.lostLife : state.correct === state.answered);
