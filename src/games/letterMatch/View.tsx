import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import {
  AnswerCardView,
  type AnswerCardGameProps,
} from '../../components/gameViews/AnswerCardView';
import type { LetterMatchProblem } from '../../types/game';

export const LetterMatchView: React.FC<AnswerCardGameProps<LetterMatchProblem>> = (props) => {
  const t = useTranslation();
  const { problem } = props;

  return (
    <AnswerCardView
      {...props}
      prompt={
        <div className="flex justify-center items-center gap-2 sm:gap-4 text-4xl sm:text-6xl font-black text-pink-500">
          {problem.display ?? ''}{' '}
          <ArrowRight size={32} className="sm:w-12 sm:h-12 text-slate-300" /> ?
        </div>
      }
      instruction={t.gameScreen.letterMatch.instruction}
      isCorrect={(opt) => opt === problem.answer}
      optionId={(opt) => opt}
      // Letters stay lowercase, so the option text is not formatted.
      renderOption={(opt) => opt}
      gridClassName="grid-cols-3 gap-2 sm:gap-3"
      optionClassName={
        problem.options.length === 4
          ? 'col-span-1 h-20 sm:h-24 bg-white border-pink-200 text-slate-700'
          : 'h-20 sm:h-24 bg-white border-pink-200 text-slate-700'
      }
    />
  );
};
