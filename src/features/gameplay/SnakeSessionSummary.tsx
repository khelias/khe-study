import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import type { SnakeSessionStats } from '../../stores/playSessionStore';

interface SnakeSessionSummaryProps {
  stats: SnakeSessionStats;
}

/**
 * End-of-session summary card for the snake family. Closes the learning loop
 * the audit (Phase 1 Slice 3b) flagged: previously the snake just died and
 * the screen showed nothing about *what* the kid practiced.
 *
 * Surfaces session-scoped metrics:
 *   - Longest snake reached
 *   - Accuracy (correct / attempted)
 *   - Best in-session streak (also drives grid expansion)
 *   - Top-3 hardest facts (most wrong attempts) — mini-precursor to the
 *     full per-fact mastery tracker planned for Phase 1.
 */
export const SnakeSessionSummary: React.FC<SnakeSessionSummaryProps> = ({ stats }) => {
  const t = useTranslation();
  const summary = t.game.snakeSummary;

  const accuracyPct =
    stats.factsAttempted > 0 ? Math.round((stats.factsCorrect / stats.factsAttempted) * 100) : 0;

  const hardestFacts = Object.entries(stats.factHistory)
    .map(([equation, h]) => ({
      equation,
      attempts: h.attempts,
      wrong: h.attempts - h.correct,
    }))
    .filter((f) => f.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong || b.attempts - a.attempts)
    .slice(0, 3);

  return (
    <div className="border-b border-rule pb-4 mb-4">
      <div className="fam-label mb-3">{summary.title}</div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mb-3">
        <SummaryStat label={summary.maxLength} value={`${stats.maxSnakeLength}`} />
        <SummaryStat
          label={summary.accuracy}
          value={stats.factsAttempted > 0 ? `${accuracyPct}%` : '-'}
        />
        <SummaryStat label={summary.bestStreak} value={`${stats.maxStreak}`} />
        <SummaryStat label={summary.factsAttempted} value={`${stats.factsAttempted}`} />
      </div>

      {stats.factsAttempted === 0 ? (
        <p className="text-sm text-muted">{summary.noFactsAttempted}</p>
      ) : hardestFacts.length === 0 ? (
        <p className="text-sm text-ok font-semibold">{summary.noMistakes}</p>
      ) : (
        <div>
          <div className="fam-label mb-1">{summary.hardestFacts}</div>
          <ul className="flex flex-wrap gap-2">
            {hardestFacts.map((f) => (
              <li
                key={f.equation}
                className="px-2.5 py-1 rounded-lg border border-bad/40 bg-bad/10 text-bad text-sm font-mono"
              >
                {f.equation}
                <span className="ml-1.5 font-sans text-xs">
                  ✕{f.wrong}/{f.attempts}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const SummaryStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center">
    <div className="fam-label mb-0.5">{label}</div>
    <div className="text-lg font-semibold text-ink tabular-nums">{value}</div>
  </div>
);
