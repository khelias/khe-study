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
      panelClassName="border-2 bg-gradient-to-br from-white via-slate-50 to-white"
      contentClassName={isCompact ? 'p-4' : 'p-6 sm:p-8'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {title && (
          <div className="flex items-center gap-2">
            {icon && <div className="text-xl">{icon}</div>}
            <h2
              id="problem-title"
              className={`font-bold text-gray-800 ${isCompact ? 'text-base' : 'text-lg sm:text-xl'}`}
            >
              {title}
            </h2>
          </div>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Problem Prompt */}
      <div className={`text-center ${isCompact ? 'mb-4' : 'mb-6'}`}>
        <p
          className={`font-medium text-gray-700 ${isCompact ? 'text-base' : 'text-xl sm:text-2xl'}`}
        >
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
                    rounded-xl border-2 border-dashed border-slate-200 bg-slate-100/50
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
                  rounded-xl font-bold transition-all duration-200 
                  border-2 shadow-md
                  min-h-[3.5rem] sm:min-h-[4rem]
                  ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-500 border-green-600 text-white scale-105'
                        : 'bg-red-500 border-red-600 text-white'
                      : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-gray-800 hover:from-blue-100 hover:to-blue-200 hover:border-blue-400 hover:scale-105 hover:shadow-lg active:scale-95'
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
