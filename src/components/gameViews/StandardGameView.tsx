/**
 * StandardGameView Component
 *
 * Game view for sentence_logic and letter_match games.
 */

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { GAME_CONFIG } from '../../games/data';
import { PaidHintButtons } from '../shared';
import type { SentenceLogicProblem, LetterMatchProblem } from '../../types/game';

type AnswerHandler = (answer: boolean) => void;

interface StandardGameViewProps {
  problem: SentenceLogicProblem | LetterMatchProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

export const StandardGameView: React.FC<StandardGameViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const baseType = gameType?.replace('_adv', '') ?? problem.type;
  const paidHints = GAME_CONFIG[baseType]?.paidHints ?? [];
  const [disabled, setDisabled] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showWrongHint, setShowWrongHint] = useState(false);
  const problemUid: string = problem.uid;

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problemUid);
  if (lastSyncedUid !== problemUid) {
    setLastSyncedUid(problemUid);
    setDisabled([]);
    setHasAnswered(false);
    setShowWrongHint(false);
  }

  const handleChoice = (
    opt: string | { text: string; pos?: string; answer?: boolean; id?: string },
  ): void => {
    // Prevent multiple clicks
    if (hasAnswered) return;

    playSound('click', soundEnabled);

    const isCorrect =
      problem.type === 'sentence_logic'
        ? typeof opt === 'object' && 'text' in opt
          ? opt.text === problem.answer
          : false
        : opt === problem.answer;

    if (isCorrect) {
      setHasAnswered(true);
      onAnswer(true);
    } else {
      const optId = typeof opt === 'object' && 'text' in opt ? opt.text : opt;
      setDisabled([...disabled, optId]);
      setShowWrongHint(true);
      window.setTimeout(() => setShowWrongHint(false), 1200);
      onAnswer(false);
    }
  };

  const renderOptionContent = (
    opt:
      | string
      | {
          text: string;
          pos?: string;
          answer?: boolean;
          a?: { n?: string; e?: string };
          s?: { n?: string; e?: string };
          sceneName?: string;
          [key: string]: unknown;
        },
    optIdx: number,
  ): React.ReactNode => {
    if (problem.type === 'sentence_logic' && typeof opt === 'object' && opt !== null) {
      const sceneBg = (opt.bg as string | undefined) || 'bg-gray-100';
      const position = String(opt.pos || '').trim();
      const subjectEmoji = opt.s?.e || '❓';
      const anchorEmoji = opt.a?.e || '📦';

      // Container for the visual scene
      const containerClasses = `relative w-full h-48 sm:h-64 ${sceneBg} rounded-lg sm:rounded-xl overflow-hidden group transition-all duration-300 shadow-inner border-2 border-white/30 hover:shadow-lg hover:scale-[1.02]`;

      // NEXT_TO: Side-by-side layout using flexbox
      // Use same size as other positions
      if (position === 'NEXT_TO') {
        const isSubjectLeft = optIdx % 2 === 0; // Alternate left/right per option
        const baseSize = 'text-6xl sm:text-8xl'; // Same size as other positions
        return (
          <div className={containerClasses}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-black/8 rounded-lg sm:rounded-xl"></div>
            <div className="relative w-full h-full flex items-center justify-center gap-2 sm:gap-4 px-2 sm:px-4">
              <div
                className={`${baseSize} filter drop-shadow-2xl animate-pulse-slow flex-shrink-0 ${isSubjectLeft ? 'order-2' : 'order-1'}`}
              >
                {anchorEmoji}
              </div>
              <div
                className={`${baseSize} filter drop-shadow-2xl animate-bounce-subtle flex-shrink-0 ${isSubjectLeft ? 'order-1' : 'order-2'}`}
              >
                {subjectEmoji}
              </div>
            </div>
          </div>
        );
      }

      // Use CSS Grid for precise positioning - much more reliable than absolute positioning
      // Create a 5x5 grid where anchor is always in center (3,3) and subject moves relative to it
      const getGridPosition = (pos: string) => {
        const baseSize = 'text-6xl sm:text-8xl';

        // Anchor is ALWAYS at grid position (3, 3) - center of 5x5 grid
        const anchorGridArea = '3 / 3 / 4 / 4';

        switch (pos) {
          case 'ON':
            // Subject above anchor
            return {
              subjectGridArea: '2 / 3 / 3 / 4', // Row 2, Column 3 (above center)
              anchorGridArea,
              subjectZIndex: 'z-30',
              anchorZIndex: 'z-10',
              sizes: { subject: baseSize, anchor: baseSize },
            };

          case 'UNDER':
            // Subject below anchor
            return {
              subjectGridArea: '4 / 3 / 5 / 4', // Row 4, Column 3 (below center)
              anchorGridArea,
              subjectZIndex: 'z-10',
              anchorZIndex: 'z-30', // Anchor on top
              sizes: { subject: baseSize, anchor: baseSize },
            };

          case 'IN_FRONT':
            // Subject IN FRONT of anchor - subject overlaps anchor from left
            // Anchor is behind (larger, semi-transparent), subject is in front (normal size)
            return {
              subjectGridArea: '3 / 2 / 4 / 4', // Row 3, spans columns 2-3 (left, overlaps center)
              anchorGridArea,
              subjectZIndex: 'z-40',
              anchorZIndex: 'z-10',
              anchorOpacity: 0.4, // Anchor behind is semi-transparent
              anchorScale: 'scale(1.2)', // Anchor behind is larger
              sizes: { subject: baseSize, anchor: baseSize },
            };

          case 'BEHIND':
            // Subject BEHIND anchor - same position, anchor covers subject
            // Subject is behind (larger, semi-transparent), anchor is in front (normal size)
            return {
              subjectGridArea: '3 / 3 / 4 / 4', // Same position as anchor (center)
              anchorGridArea,
              subjectZIndex: 'z-10',
              anchorZIndex: 'z-30', // Anchor on top
              subjectOpacity: 0.4, // Subject behind is semi-transparent
              subjectScale: 'scale(1.2)', // Subject behind is larger
              sizes: { subject: baseSize, anchor: baseSize },
            };

          case 'INSIDE':
            // Subject inside anchor (both centered, different sizes)
            return {
              subjectGridArea: '3 / 3 / 4 / 4', // Same as anchor
              anchorGridArea,
              subjectZIndex: 'z-30',
              anchorZIndex: 'z-10',
              subjectScale: 'scale(0.4)',
              anchorScale: 'scale(1.3)',
              sizes: { subject: baseSize, anchor: baseSize },
            };

          default:
            return {
              subjectGridArea: '3 / 3 / 4 / 4',
              anchorGridArea,
              subjectZIndex: 'z-20',
              anchorZIndex: 'z-10',
              sizes: { subject: baseSize, anchor: baseSize },
            };
        }
      };

      const gridPos = getGridPosition(position);

      return (
        <div className={containerClasses}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-black/8 rounded-lg sm:rounded-xl"></div>

          {/* CSS Grid container - 5x5 grid for precise positioning */}
          <div
            className="absolute inset-0 grid grid-cols-5 grid-rows-5"
            style={{ gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(5, 1fr)' }}
          >
            {/* Anchor - ALWAYS in center (3,3) */}
            <div
              className={`${gridPos.sizes.anchor} filter drop-shadow-2xl ${gridPos.anchorZIndex} animate-pulse-slow flex items-center justify-center`}
              style={{
                gridArea: gridPos.anchorGridArea,
                transform: (gridPos as { anchorScale?: string }).anchorScale || 'scale(1)',
                opacity: (gridPos as { anchorOpacity?: number }).anchorOpacity ?? 1,
                pointerEvents: 'none',
              }}
            >
              {anchorEmoji}
            </div>

            {/* Subject - position varies based on spatial relationship */}
            <div
              className={`${gridPos.sizes.subject} filter drop-shadow-2xl ${gridPos.subjectZIndex} animate-bounce-subtle flex items-center justify-center`}
              style={{
                gridArea: gridPos.subjectGridArea,
                transform: (gridPos as { subjectScale?: string }).subjectScale || 'scale(1)',
                opacity: (gridPos as { subjectOpacity?: number }).subjectOpacity ?? 1,
                pointerEvents: 'none',
              }}
            >
              {subjectEmoji}
            </div>
          </div>
        </div>
      );
    }

    // For non-sentence_logic types (like letter_match)
    const text = typeof opt === 'string' ? opt : String(opt.text ?? '');
    // Letter match: keep letters lowercase (don't format), other types format normally
    return problem.type === 'letter_match' ? text : formatText(text);
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      <div className="mb-4 sm:mb-6 p-3 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border-b-6 sm:border-b-8 border-green-200 shadow-sm text-center w-full">
        {problem.type === 'letter_match' ? (
          <div className="flex justify-center items-center gap-2 sm:gap-4 text-4xl sm:text-6xl font-black text-pink-500">
            {problem.display ?? ''}{' '}
            <ArrowRight size={32} className="sm:w-12 sm:h-12 text-slate-300" /> ?
          </div>
        ) : problem.type === 'sentence_logic' ? (
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-500 mb-1 sm:mb-2 uppercase tracking-wider">
              {formatText(problem.sceneName || t.gameScreen.sentenceLogic.scene)}
            </div>
            <h2 className="text-base sm:text-xl font-black text-green-700 leading-snug tracking-wide px-2">
              {formatText(problem.display ?? '')}
            </h2>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">
              {formatText(t.gameScreen.sentenceLogic.selectCorrectPicture)}
            </div>
          </div>
        ) : null}
      </div>
      {/* Wrong-answer feedback — reserve space to prevent layout shift. */}
      <div
        className={`mb-2 w-full max-w-sm min-h-[2.25rem] transition-opacity duration-300 ${
          showWrongHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {showWrongHint && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border-2 border-rose-200 bg-rose-50 px-3 py-1.5 text-center text-sm font-bold text-rose-700"
          >
            {formatText(t.feedback.notThisOne)}
          </div>
        )}
      </div>
      <div
        className={`grid ${
          problem.type === 'sentence_logic'
            ? problem.options.length === 4
              ? 'grid-cols-2 gap-2 sm:gap-4'
              : problem.options.length === 5
                ? 'grid-cols-3 gap-2 sm:gap-3'
                : 'grid-cols-2 gap-2 sm:gap-4'
            : 'grid-cols-3 gap-2 sm:gap-3'
        } w-full`}
      >
        {problem.options.map((opt, idx) => {
          const optId = typeof opt === 'object' && 'text' in opt ? opt.text : opt;
          const isDisabled = disabled.includes(optId);
          return (
            <button
              key={idx}
              data-testid={`standard-answer-${idx}`}
              disabled={isDisabled}
              onClick={() => handleChoice(opt)}
              className={`
                rounded-xl sm:rounded-2xl border-b-4 sm:border-b-[6px] text-2xl sm:text-3xl font-bold flex items-center justify-center transition-all p-1 shadow-sm
                ${
                  problem.type === 'sentence_logic'
                    ? `col-span-1 h-48 sm:h-64 bg-white border-slate-200 ${problem.options.length === 5 ? 'col-span-1' : ''}`
                    : problem.type === 'letter_match' && problem.options.length === 4
                      ? 'col-span-1 h-20 sm:h-24 bg-white border-pink-200 text-slate-700'
                      : 'h-20 sm:h-24 bg-white border-pink-200 text-slate-700'
                }
                ${isDisabled ? 'bg-slate-100 border-slate-100 opacity-40 cursor-not-allowed scale-95' : 'hover:border-green-400 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] active:scale-95 active:border-b-0 active:translate-y-1 transition-all duration-200'}
              `}
            >
              {renderOptionContent(opt, idx)}
            </button>
          );
        })}
      </div>
      {paidHints.length > 0 && (
        <PaidHintButtons hints={paidHints} stars={stars} onHintClick={() => {}} />
      )}
    </div>
  );
};
