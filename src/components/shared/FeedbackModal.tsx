/**
 * FeedbackModal Component
 *
 * Generic overlay modal to show the user what went wrong or other info
 * (e.g. wrong answer explanation). Renders on top of the game; closed via
 * button or backdrop/Escape.
 */

import React, { useEffect, useRef } from 'react';
import { AppModal } from './AppModal';

export type FeedbackModalVariant = 'wrong' | 'info' | 'default';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modal title (e.g. "Peaaegu!") */
  title?: string;
  /** Main content. Use React node for rich content (paragraphs, lists, etc.) */
  children: React.ReactNode;
  /** Primary button label (e.g. "Jätka") */
  buttonLabel: string;
  /** Visual variant: wrong marks the title in the bad state colour */
  variant?: FeedbackModalVariant;
}

// Only a wrong answer carries a state colour; info and default read as plain ink.
const variantTitleClass: Record<FeedbackModalVariant, string> = {
  wrong: 'text-bad',
  info: '',
  default: '',
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  buttonLabel,
  variant = 'default',
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleClass = variantTitleClass[variant];

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AppModal
      labelledBy={title ? 'feedback-modal-title' : undefined}
      onClose={onClose}
      size="md"
      contentClassName="p-5 sm:p-6"
    >
      {title && (
        <h2 id="feedback-modal-title" className={`fam-heading mb-3 ${titleClass}`}>
          {title}
        </h2>
      )}
      <div className="mb-5 text-[15px] text-ink-2 [&_p]:mb-2 [&_p:last-child]:mb-0">{children}</div>
      <div className="flex justify-end">
        <button
          ref={buttonRef}
          type="button"
          onClick={onClose}
          className="fam-btn fam-btn-primary px-5"
        >
          {buttonLabel}
        </button>
      </div>
    </AppModal>
  );
};
