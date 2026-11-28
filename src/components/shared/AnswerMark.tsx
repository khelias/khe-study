import React from 'react';
import { Check, X } from 'lucide-react';
import type { AnswerMark } from '../../hooks/useAnswerMarks';

/** The tick or cross beside a marked answer's content. */
export const AnswerMarkIcon: React.FC<{ mark: AnswerMark | null }> = ({ mark }) => {
  if (mark === 'right') return <Check size={20} strokeWidth={3} aria-hidden className="shrink-0" />;
  if (mark === 'wrong') return <X size={18} strokeWidth={3} aria-hidden className="shrink-0" />;
  return null;
};
