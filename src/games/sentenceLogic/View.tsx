import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import {
  AnswerCardView,
  type AnswerCardGameProps,
} from '../../components/gameViews/AnswerCardView';
import type { SentenceLogicProblem } from '../../types/game';

// The generator's scene options carry more than SentenceLogicProblem declares.
type SceneOption = {
  text: string;
  pos?: string;
  answer?: boolean;
  a?: { n?: string; e?: string };
  s?: { n?: string; e?: string };
  sceneName?: string;
  [key: string]: unknown;
};

const renderScene = (opt: SceneOption, optIdx: number): React.ReactNode => {
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
};

export const SentenceLogicView: React.FC<AnswerCardGameProps<SentenceLogicProblem>> = (props) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const { problem } = props;

  return (
    <AnswerCardView
      {...props}
      prompt={
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
      }
      isCorrect={(opt) => typeof opt === 'object' && opt.text === problem.answer}
      optionId={(opt) => (typeof opt === 'string' ? opt : opt.text)}
      renderOption={(opt, idx) =>
        typeof opt === 'string' ? formatText(opt) : renderScene(opt, idx)
      }
      gridClassName={
        problem.options.length === 5 ? 'grid-cols-3 gap-2 sm:gap-3' : 'grid-cols-2 gap-2 sm:gap-4'
      }
      optionClassName={`col-span-1 h-48 sm:h-64 bg-white border-slate-200 ${problem.options.length === 5 ? 'col-span-1' : ''}`}
    />
  );
};
