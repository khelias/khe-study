/**
 * FactDrillView
 *
 * Timed fact-drill sprint. The view owns its own session loop (timer, fact
 * rotation, streak) and only delegates per-answer scoring / highscore /
 * notifications to `useAnswerHandler` via `onAnswer`. Binding's GameConfig
 * carries `sessionMode: 'continuous'`, which keeps the play-session store
 * from auto-generating the next problem or triggering mid-session level-ups.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { playSound } from '../../engine/audio';
import { createRng } from '../../engine/rng';
import {
  FACT_DRILL_DEFAULT_DURATION,
  FACT_DRILL_RECENT_WINDOW,
  buildFactForOperator,
  buildFactPool,
  createFactDrillSession,
  factPairKey,
  pickNextFact,
  recordCorrect,
  recordWrong,
  tickTimer,
  type FactOperator,
} from '../../engine/factDrill';
import { GAME_CONFIG } from '../../games/data';
import { GameResultScreen } from '../../features/gameplay/GameResultScreen';
import { LEGACY_GAME_SKILL_IDS } from '../../learner';
import { useGameStore } from '../../stores/gameStore';
import type { FactDrillProblem, RngFunction } from '../../types/game';

interface FactDrillViewProps {
  problem: FactDrillProblem;
  onAnswer: (isCorrect: boolean) => void;
  soundEnabled: boolean;
  gameType?: string;
  endGame?: () => void;
}

interface FeedbackState {
  phase: 'idle' | 'correct' | 'wrong';
  correctAnswer: number | null;
}

const FEEDBACK_CORRECT_MS = 250;
const FEEDBACK_WRONG_MS = 900;
const MAX_INPUT_LENGTH = 4;

/**
 * Recover the canonical pool pair `(a, b)` with `a <= b` from a displayed
 * problem, so the recent-history window keys match what `pickNextFact` sees.
 * Mirrors the operand layout produced by `buildFactForOperator`.
 */
function poolPairFromProblem(p: FactDrillProblem): [number, number] {
  switch (p.opSymbol) {
    case '÷':
      // Built as (q*d) ÷ d = q → pool pair (q, d) = (answer, factorB).
      return [p.answer, p.factorB];
    case '−':
      // Built as larger − smaller → pool pair (smaller, larger) = (factorB, factorA).
      return [p.factorB, p.factorA];
    default:
      return p.factorA <= p.factorB ? [p.factorA, p.factorB] : [p.factorB, p.factorA];
  }
}

export const FactDrillView: React.FC<FactDrillViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
}) => {
  const t = useTranslation();

  const baseGameType = (gameType ?? '').replace('_adv', '');
  const duration = GAME_CONFIG[baseGameType]?.timerDuration ?? FACT_DRILL_DEFAULT_DURATION;

  // Phase 5c: closed-set spaced repetition. Resolve the skill this binding
  // practices and pass its `factsKnown` to `pickNextFact` so the next fact
  // leans toward the learner's weakest products.
  const skillId = LEGACY_GAME_SKILL_IDS[baseGameType]?.[0];
  const factsKnown = useGameStore((state) =>
    skillId ? state.activeLearnerProfile.skillMastery[skillId]?.factsKnown : undefined,
  );

  const [rng, setRng] = useState<RngFunction>(() => createRng(Date.now()));
  const [session, setSession] = useState(() => createFactDrillSession(duration));
  const [currentProblem, setCurrentProblem] = useState<FactDrillProblem>(problem);
  const [inputStr, setInputStr] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>({ phase: 'idle', correctAnswer: null });

  // Recent-history is internal pacing state — never rendered, mutated from
  // callbacks/effects only. Ref keeps lint quiet and avoids redundant renders.
  const recentRef = useRef<string[]>([]);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pool = useMemo(() => buildFactPool(problem.factorRange), [problem.factorRange]);
  const opSymbol = problem.opSymbol as FactOperator;

  const rememberFact = useCallback((a: number, b: number) => {
    const key = factPairKey(a, b);
    const list = recentRef.current;
    const next = [...list.filter((k) => k !== key), key];
    if (next.length > FACT_DRILL_RECENT_WINDOW) next.shift();
    recentRef.current = next;
  }, []);

  // Seed the recent-history with the initial problem so it does not immediately repeat.
  useEffect(() => {
    const [a, b] = poolPairFromProblem(problem);
    rememberFact(a, b);
    // Initial seed only; resets clear recentRef explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advanceToNextFact = useCallback(() => {
    const pair =
      pickNextFact(pool, new Set(recentRef.current), rng, factsKnown) ??
      ([problem.factorRange[0], problem.factorRange[1]] as [number, number]);
    const next = buildFactForOperator(opSymbol, pair, problem.factorRange, rng);
    rememberFact(pair[0], pair[1]);
    setCurrentProblem(next);
    setInputStr('');
  }, [factsKnown, opSymbol, pool, problem.factorRange, rememberFact, rng]);

  // rAF-based timer. Uses wall-clock delta so backgrounded tabs do not falsify
  // the count. Cleans up on finish / unmount.
  useEffect(() => {
    if (session.isFinished) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number): void => {
      const delta = Math.max(0, (now - last) / 1000);
      last = now;
      setSession((prev) => (prev.isFinished ? prev : tickTimer(prev, delta)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [session.isFinished]);

  const finishFeedback = useCallback(() => {
    setFeedback({ phase: 'idle', correctAnswer: null });
    advanceToNextFact();
  }, [advanceToNextFact]);

  const scheduleFeedbackEnd = useCallback(
    (durationMs: number) => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        feedbackTimeoutRef.current = null;
        finishFeedback();
      }, durationMs);
    },
    [finishFeedback],
  );

  useEffect(
    () => () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    },
    [],
  );

  // Stop ticking feedback once the session has ended.
  useEffect(() => {
    if (session.isFinished && feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
      setFeedback({ phase: 'idle', correctAnswer: null });
    }
  }, [session.isFinished]);

  const submitAnswer = useCallback(() => {
    if (session.isFinished || feedback.phase !== 'idle') return;
    const raw = inputStr.trim();
    if (raw.length === 0) return;
    const value = Number(raw);
    if (!Number.isFinite(value)) return;

    const isCorrect = value === currentProblem.answer;
    if (isCorrect) {
      setSession((prev) => recordCorrect(prev));
      playSound('correct', soundEnabled);
      setFeedback({ phase: 'correct', correctAnswer: currentProblem.answer });
      onAnswer(true);
      scheduleFeedbackEnd(FEEDBACK_CORRECT_MS);
    } else {
      setSession((prev) => recordWrong(prev));
      playSound('wrong', soundEnabled);
      setFeedback({ phase: 'wrong', correctAnswer: currentProblem.answer });
      onAnswer(false);
      scheduleFeedbackEnd(FEEDBACK_WRONG_MS);
    }
  }, [
    currentProblem.answer,
    feedback.phase,
    inputStr,
    onAnswer,
    scheduleFeedbackEnd,
    session.isFinished,
    soundEnabled,
  ]);

  const appendDigit = useCallback(
    (digit: string) => {
      if (session.isFinished || feedback.phase !== 'idle') return;
      setInputStr((prev) => (prev.length >= MAX_INPUT_LENGTH ? prev : prev + digit));
    },
    [feedback.phase, session.isFinished],
  );

  const clearInput = useCallback(() => {
    if (session.isFinished || feedback.phase !== 'idle') return;
    setInputStr('');
  }, [feedback.phase, session.isFinished]);

  const backspace = useCallback(() => {
    if (session.isFinished || feedback.phase !== 'idle') return;
    setInputStr((prev) => prev.slice(0, -1));
  }, [feedback.phase, session.isFinished]);

  // Keyboard support — number keys, Enter, Backspace, Escape.
  useEffect(() => {
    if (session.isFinished) return;
    const handler = (event: KeyboardEvent): void => {
      if (event.key >= '0' && event.key <= '9') {
        appendDigit(event.key);
        event.preventDefault();
      } else if (event.key === 'Enter') {
        submitAnswer();
        event.preventDefault();
      } else if (event.key === 'Backspace') {
        backspace();
        event.preventDefault();
      } else if (event.key === 'Escape') {
        clearInput();
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [appendDigit, backspace, clearInput, session.isFinished, submitAnswer]);

  const handleRestart = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    recentRef.current = [];
    const freshRng = createRng(Date.now());
    setRng(() => freshRng);
    setSession(createFactDrillSession(duration));
    setFeedback({ phase: 'idle', correctAnswer: null });
    setInputStr('');
    // Seed initial problem from the fresh rng + factor range.
    const initialPair =
      pickNextFact(pool, new Set(), freshRng, factsKnown) ??
      ([problem.factorRange[0], problem.factorRange[1]] as [number, number]);
    const initial = buildFactForOperator(opSymbol, initialPair, problem.factorRange, freshRng);
    recentRef.current = [factPairKey(initialPair[0], initialPair[1])];
    setCurrentProblem(initial);
  }, [duration, factsKnown, opSymbol, pool, problem.factorRange]);

  const timeDisplay = Math.ceil(session.timeRemaining);
  const total = session.correctCount + session.wrongCount;
  const accuracy = total === 0 ? 0 : Math.round((session.correctCount / total) * 100);

  const bgClass =
    feedback.phase === 'correct'
      ? 'bg-emerald-50 border-emerald-300'
      : feedback.phase === 'wrong'
        ? 'bg-rose-50 border-rose-300'
        : 'bg-white border-amber-200';

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-6 select-none">
      {/* Status row */}
      <div className="w-full grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="rounded-lg bg-amber-50 border border-amber-200 py-2">
          <div className="text-xs uppercase text-amber-700">
            {t.gameScreen.factDrill.timeLeftLabel}
          </div>
          <div className="text-2xl font-bold text-amber-700 tabular-nums">{timeDisplay}s</div>
        </div>
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 py-2">
          <div className="text-xs uppercase text-emerald-700">
            {t.gameScreen.factDrill.correctLabel}
          </div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            {session.correctCount}
          </div>
        </div>
        <div className="rounded-lg bg-indigo-50 border border-indigo-200 py-2">
          <div className="text-xs uppercase text-indigo-700">
            {t.gameScreen.factDrill.streakLabel}
          </div>
          <div className="text-2xl font-bold text-indigo-700 tabular-nums">
            {session.currentStreak}
          </div>
        </div>
      </div>

      {/* Equation card */}
      <div
        className={`w-full rounded-2xl border-2 shadow-sm transition-colors duration-150 ${bgClass} py-8 px-6 mb-3 flex flex-col items-center`}
        aria-live="polite"
      >
        <div className="text-5xl sm:text-6xl font-extrabold text-slate-800 tracking-wide tabular-nums">
          {currentProblem.equation} = <span className="text-amber-600">{inputStr || '?'}</span>
        </div>
        {feedback.phase === 'wrong' && feedback.correctAnswer !== null && (
          <div className="mt-3 text-base sm:text-lg text-rose-700 font-medium">
            {t.gameScreen.factDrill.feedbackWrong.replace(
              '{answer}',
              String(feedback.correctAnswer),
            )}
          </div>
        )}
        {feedback.phase === 'correct' && (
          <div className="mt-3 text-base sm:text-lg text-emerald-700 font-medium">
            {t.gameScreen.factDrill.feedbackCorrect}
          </div>
        )}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {(['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const).map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => appendDigit(digit)}
            disabled={session.isFinished || feedback.phase !== 'idle'}
            className="rounded-xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-2xl font-bold py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={backspace}
          disabled={session.isFinished || feedback.phase !== 'idle'}
          aria-label={t.gameScreen.factDrill.clearLabel}
          className="rounded-xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 py-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Delete size={24} />
        </button>
        <button
          type="button"
          onClick={() => appendDigit('0')}
          disabled={session.isFinished || feedback.phase !== 'idle'}
          className="rounded-xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-2xl font-bold py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          0
        </button>
        <button
          type="button"
          onClick={submitAnswer}
          disabled={session.isFinished || feedback.phase !== 'idle' || inputStr.length === 0}
          className="rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-lg font-bold py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.gameScreen.factDrill.submitLabel}
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-500 text-center">
        {t.gameScreen.factDrill.keyboardHint}
      </div>

      {!session.isFinished && (
        <button
          type="button"
          onClick={handleRestart}
          className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amber-700 active:text-amber-800 transition-colors"
        >
          <RotateCcw size={14} />
          {t.gameScreen.factDrill.restartLabel}
        </button>
      )}

      {session.isFinished && (
        <GameResultScreen
          type="timeUp"
          onRetry={handleRestart}
          extraStats={
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 text-center">
                <div className="text-[0.65rem] sm:text-xs uppercase text-indigo-700 mb-1">
                  {t.gameScreen.factDrill.bestStreakLabel}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-700 tabular-nums">
                  {session.bestStreak}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                <div className="text-[0.65rem] sm:text-xs uppercase text-slate-500 mb-1">
                  {t.gameScreen.factDrill.finalAccuracyLabel}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                  {accuracy}%
                </div>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};
