/**
 * SyllableGameView Component
 *
 * Game view for syllable builder games.
 */

import React, { useCallback, useState } from 'react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { GAME_CONFIG } from '../data';
import { PaidHintButtons } from '../../components/shared';
import type { SyllableBuilderProblem } from '../../types/game';

type AnswerHandler = (answer: boolean) => void;

interface SyllableGameViewProps {
  problem: SyllableBuilderProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

export const SyllableGameView: React.FC<SyllableGameViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const baseType = gameType?.replace('_adv', '') ?? 'syllable_builder';
  const paidHints = GAME_CONFIG[baseType]?.paidHints ?? [];
  interface SyllablePart {
    part: { text: string; id: string };
    id: string;
  }

  const poolFromProblem = useCallback((): SyllablePart[] => {
    return problem.shuffled.map((p, i) => ({ part: p, id: `${p.text}-${i}` }));
  }, [problem.shuffled]);

  const [current, setCurrent] = useState<Array<{ text: string; id: string } | null>>([]);
  const [pool, setPool] = useState<SyllablePart[]>(() => poolFromProblem());
  const [ghost, setGhost] = useState<boolean>(false);
  const colors: string[] = [
    'bg-orange-100 text-orange-700 border-orange-300',
    'bg-teal-100 text-teal-700 border-teal-300',
    'bg-blue-100 text-blue-700 border-blue-300',
    'bg-pink-100 text-pink-700 border-pink-300',
  ];

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problem.uid);
  if (lastSyncedUid !== problem.uid) {
    setLastSyncedUid(problem.uid);
    setCurrent([]);
    setPool(poolFromProblem());
    setGhost(false);
  }

  const handleSelect = (item: SyllablePart): void => {
    playSound('click', soundEnabled);
    const next = [...current, item.part];
    setCurrent(next);
    setPool(pool.filter((p) => p.id !== item.id));
    if (next.length === problem.syllables.length) {
      const word = next.map((p) => p?.text ?? '').join('');
      if (word === problem.target) {
        onAnswer(true);
      } else {
        setGhost(true);
        setTimeout(() => {
          onAnswer(false);
          setCurrent([]);
          setPool(poolFromProblem());
          setGhost(false);
        }, 700);
      }
    }
  };

  const handleRemove = (idx: number): void => {
    playSound('click', soundEnabled);
    const item = current[idx];
    const next = [...current];
    next.splice(idx, 1);
    setCurrent(next);
    if (item) {
      setPool((prev) => [...prev, { part: item, id: `${item.text}-${Date.now()}` }]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">
        {problem.emoji || problem.hint || '🧩'}
      </div>
      <div className="text-xs sm:text-sm font-semibold text-slate-600 mb-2 px-2 text-center">
        {formatText(t.gameScreen.syllableBuilder.instruction)}
      </div>
      {/* Wrong-answer feedback — reserve space to prevent layout shift. */}
      <div
        className={`mb-2 w-full max-w-sm min-h-[2.25rem] transition-opacity duration-300 ${
          ghost ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {ghost && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border-2 border-rose-200 bg-rose-50 px-3 py-1.5 text-center text-sm font-bold text-rose-700"
          >
            {formatText(t.gameScreen.syllableBuilder.correct)} {problem.syllables.join('-')}
          </div>
        )}
      </div>
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 min-h-[3rem] sm:min-h-[3.5rem] flex-wrap justify-center">
        {Array.from({ length: problem.syllables.length }).map((_, i) => (
          <button
            key={i}
            onClick={() => current[i] && handleRemove(i)}
            className={`px-2 sm:px-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-b-3 sm:border-b-4 flex items-center justify-center text-lg sm:text-2xl font-black transition-all ${current[i] ? colors[i % colors.length] : 'bg-slate-100 border-slate-200 text-slate-300'}`}
          >
            {current[i]?.text || ''}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
        {pool.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className={`px-2 sm:px-4 h-12 sm:h-14 bg-white rounded-xl sm:rounded-2xl border-b-[4px] sm:border-b-[6px] text-lg sm:text-2xl font-black shadow-sm active:translate-y-2 active:border-b-0 hover:brightness-105 transition-colors ${colors[idx % colors.length]}`}
          >
            {item.part.text}
          </button>
        ))}
      </div>
      {paidHints.length > 0 && (
        <PaidHintButtons hints={paidHints} stars={stars} onHintClick={() => {}} />
      )}
    </div>
  );
};
