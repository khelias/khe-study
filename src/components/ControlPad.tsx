import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const BUTTON_CLASS =
  'rounded-full border-2 border-rule-strong bg-surface text-ink flex items-center justify-center transition-colors duration-200 active:translate-y-0.5 active:bg-sunken hover:border-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-rule-strong';

interface ControlPadProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export const ControlPad: React.FC<ControlPadProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  disabled = false,
  className,
  compact = false,
}) => {
  return (
    <div
      className={`grid grid-cols-3 ${className ?? ''}`}
      style={{
        gap: compact ? 'clamp(0.5rem, 2vw, 0.75rem)' : 'clamp(0.5rem, 2vw, 0.75rem)',
      }}
    >
      <div />
      <button
        type="button"
        onClick={onUp}
        disabled={disabled}
        aria-label="Up"
        className={BUTTON_CLASS}
        style={{
          width: compact ? 'clamp(3.5rem, 12vw, 4.5rem)' : 'clamp(3.5rem, 12vw, 4.5rem)',
          height: compact ? 'clamp(3.5rem, 12vw, 4.5rem)' : 'clamp(3.5rem, 12vw, 4.5rem)',
        }}
      >
        <ArrowUp size={compact ? 'clamp(1.5rem, 5vw, 2rem)' : 'clamp(1.5rem, 5vw, 2rem)'} />
      </button>
      <div />

      <button
        type="button"
        onClick={onLeft}
        disabled={disabled}
        aria-label="Left"
        className={BUTTON_CLASS}
        style={{
          width: compact ? 'clamp(3.5rem, 12vw, 4.5rem)' : 'clamp(3.5rem, 12vw, 4.5rem)',
          height: compact ? 'clamp(3.5rem, 12vw, 4.5rem)' : 'clamp(3.5rem, 12vw, 4.5rem)',
        }}
      >
        <ArrowLeft size={compact ? 'clamp(1.5rem, 5vw, 2rem)' : 'clamp(1.5rem, 5vw, 2rem)'} />
      </button>
      <div />
      <button
        type="button"
        onClick={onRight}
        disabled={disabled}
        aria-label="Right"
        className={BUTTON_CLASS}
        style={{
          width: compact ? 'clamp(3.5rem, 12vw, 4.5rem)' : 'clamp(3.5rem, 12vw, 4.5rem)',
          height: compact ? 'clamp(3.5rem, 12vw, 4.5rem)' : 'clamp(3.5rem, 12vw, 4.5rem)',
        }}
      >
        <ArrowRight size={compact ? 'clamp(1.5rem, 5vw, 2rem)' : 'clamp(1.5rem, 5vw, 2rem)'} />
      </button>

      <div />
      <button
        type="button"
        onClick={onDown}
        disabled={disabled}
        aria-label="Down"
        className={`col-start-2 ${BUTTON_CLASS}`}
        style={{
          width: compact ? 'clamp(3.5rem, 12vw, 4.5rem)' : 'clamp(3.5rem, 12vw, 4.5rem)',
          height: compact ? 'clamp(3.5rem, 12vw, 4.5rem)' : 'clamp(3.5rem, 12vw, 4.5rem)',
        }}
      >
        <ArrowDown size={compact ? 'clamp(1.5rem, 5vw, 2rem)' : 'clamp(1.5rem, 5vw, 2rem)'} />
      </button>
      <div />
    </div>
  );
};
