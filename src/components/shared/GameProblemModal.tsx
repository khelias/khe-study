/**
 * GameProblemModal Component
 *
 * A reusable modal for displaying problems/questions that interrupt gameplay.
 * Used by games like BattleLearn, MathSnake, and others that need conditional problem displays.
 *
 * Design Philosophy:
 * - Focuses player attention on the problem
 * - Overlays game board with semi-transparent backdrop
 * - Animates in/out smoothly
 * - Accessible with keyboard navigation
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AppModal } from './AppModal';
import { useTranslation } from '../../i18n/useTranslation';

interface GameProblemModalProps {
  isOpen: boolean;
  title?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  selectedOption: number | null;
  onOptionSelect: (index: number) => void;
  disabled?: boolean;
  variant?: 'default' | 'compact';
  icon?: React.ReactNode;
  onClose?: () => void; // Optional close handler (for dismissible modals)
  /** Indices of options to show as eliminated (e.g. paid hint "remove one wrong") */
  eliminatedIndices?: readonly number[];
  /** Optional footer content (e.g. paid hint buttons) */
  children?: React.ReactNode;
}

export const GameProblemModal: React.FC<GameProblemModalProps> = ({
  isOpen,
  title,
  prompt,
  options,
  correctIndex,
  selectedOption,
  onOptionSelect,
  disabled = false,
  variant = 'default',
  icon,
  onClose,
  eliminatedIndices = [],
  children,
}) => {
  const t = useTranslation();
  const firstOptionRef = useRef<HTMLButtonElement>(null);

  // Focus first option when modal opens
  useEffect(() => {
    if (isOpen && firstOptionRef.current) {
      firstOptionRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCompact = variant === 'compact';

  return (
    <AppModal
      labelledBy={title ? 'problem-title' : undefined}
      onClose={onClose}
      size={isCompact ? 'md' : 'lg'}
      testId="game-problem-modal"
      contentClassName={isCompact ? 'p-4' : 'p-6 sm:p-8'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {title && (
          <div className="flex items-center gap-2">
            {icon && <div className="text-xl text-muted">{icon}</div>}
            <h2 id="problem-title" className="fam-heading">
              {title}
            </h2>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="fam-icon-btn ml-auto" aria-label={t.common.close}>
            <X size={18} aria-hidden />
          </button>
        )}
      </div>

      {/* Problem Prompt */}
      <div className={`text-center ${isCompact ? 'mb-4' : 'mb-6'}`}>
        <p className={`font-medium text-ink ${isCompact ? 'text-base' : 'text-xl sm:text-2xl'}`}>
          {prompt}
        </p>
      </div>

      {/* Options Grid */}
      <div
        className={`grid ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-3 ${isCompact ? 'gap-2' : 'gap-3'}`}
      >
        {(() => {
          const firstInteractiveIndex = options.findIndex((_, i) => !eliminatedIndices.includes(i));
          return options.map((option, index) => {
            const isEliminated = eliminatedIndices.includes(index);
            if (isEliminated) {
              return (
                <div
                  key={index}
                  className={`
                    ${isCompact ? 'px-4 py-3 text-base' : 'px-6 py-4 text-lg sm:text-xl'}
                    rounded-lg border border-dashed border-rule bg-sunken
                    min-h-[3.5rem] sm:min-h-[4rem]
                  `}
                  aria-hidden
                />
              );
            }
            const isSelected = selectedOption === index;
            const isCorrect = index === correctIndex;
            const showResult = isSelected && selectedOption !== null;

            return (
              <button
                key={index}
                ref={index === firstInteractiveIndex ? firstOptionRef : null}
                data-testid={`game-problem-option-${index}`}
                onClick={() => onOptionSelect(index)}
                disabled={disabled || selectedOption !== null}
                className={`
                  ${isCompact ? 'px-4 py-3 text-base' : 'px-6 py-4 text-lg sm:text-xl'}
                  rounded-lg font-semibold transition-colors duration-200
                  border-2
                  min-h-[3.5rem] sm:min-h-[4rem]
                  ${
                    showResult
                      ? isCorrect
                        ? 'bg-ok/10 border-ok text-ok'
                        : 'bg-bad/10 border-bad text-bad'
                      : 'bg-surface border-rule-strong text-ink hover:bg-sunken hover:border-muted active:bg-sunken'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {option}
              </button>
            );
          });
        })()}
      </div>

      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </AppModal>
  );
};
