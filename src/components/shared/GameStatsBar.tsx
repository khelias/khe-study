/**
 * GameStatsBar Component
 *
 * A flexible, reusable component for displaying game-specific statistics.
 * Used across multiple games to show contextual information like:
 * - Ships remaining (BattleLearn)
 * - Apples until math (MathSnake)
 * - Phase indicators
 * - Progress counters
 *
 * Design Philosophy:
 * - Compact and unobtrusive
 * - Horizontally scrollable on mobile
 * - Supports badges, counters, and status indicators
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface GameStat {
  id: string;
  icon?: LucideIcon;
  emoji?: string;
  label?: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  pulse?: boolean;
  bounce?: boolean;
}

interface GameStatsBarProps {
  stats: GameStat[];
  className?: string;
}

const variantClasses = {
  default: 'border-rule text-ink',
  success: 'border-ok text-ok',
  warning: 'border-rule-strong text-ink',
  danger: 'border-bad text-bad',
  info: 'border-rule text-ink-2',
};

export const GameStatsBar: React.FC<GameStatsBarProps> = ({ stats, className = '' }) => {
  if (stats.length === 0) return null;

  return (
    <div className={`w-full overflow-x-auto pb-2 ${className}`}>
      <div className="flex items-center justify-center gap-2 sm:gap-3 min-w-max px-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const variantClass = variantClasses[stat.variant || 'default'];
          const animationClass = stat.pulse ? 'animate-pulse' : stat.bounce ? 'animate-bounce' : '';

          return (
            <div
              key={stat.id}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-surface
                text-sm font-semibold whitespace-nowrap
                ${variantClass}
                ${animationClass}
              `}
            >
              {Icon && <Icon className="w-4 h-4 flex-shrink-0" aria-hidden />}
              {stat.emoji && <span className="text-base">{stat.emoji}</span>}
              {stat.label && <span className="text-xs sm:text-sm">{stat.label}:</span>}
              <span className="text-sm sm:text-base">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
