/**
 * Right answers in a row, one line at the play area's top edge from the third
 * on (board 3A frame 4). It fades by itself and never covers the task.
 */

import React from 'react';
import { usePlaySessionStore } from '../stores/playSessionStore';
import { STREAK_LINE_FROM } from '../hooks/useAnswerHandler';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';

export const StreakLine: React.FC = () => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const streak = usePlaySessionStore((state) => state.currentStreak);
  const playing = usePlaySessionStore((state) => state.round?.status === 'playing');
  // The live region stays mounted so a screen reader hears each new count.
  return (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-0 top-1 z-10 text-center text-sm font-semibold text-star"
    >
      {playing && streak >= STREAK_LINE_FROM && (
        <p key={streak} data-testid="streak-line" className="streak-line">
          {formatText(t.feedback.streakLine).replace('{count}', String(streak))}
        </p>
      )}
    </div>
  );
};
