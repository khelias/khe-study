// Accessibility helpers - better accessibility
import React, { ReactNode, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';

// Keyboard navigation helper
// eslint-disable-next-line react-refresh/only-export-components
export const useKeyboardNavigation = (onEscape?: () => void, onEnter?: () => void): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
      if (e.key === 'Enter' && onEnter && !e.shiftKey) {
        onEnter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter]);
};

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
}

const FocusTrap: React.FC<FocusTrapProps> = ({ children, active = true, className }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent): void => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Screen reader friendly message
interface ScreenReaderMessageProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

const ScreenReaderMessage: React.FC<ScreenReaderMessageProps> = ({
  message,
  priority = 'polite',
}) => {
  return (
    <div className="sr-only" role="status" aria-live={priority} aria-atomic="true">
      {message}
    </div>
  );
};

// Skip to content link
interface SkipToContentProps {
  targetId?: string;
}

const SkipToContent: React.FC<SkipToContentProps> = ({ targetId = 'main-content' }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:rounded-lg focus:font-semibold"
    >
      {formatText(t.accessibility.skipToContent)}
    </a>
  );
};

export { FocusTrap, ScreenReaderMessage, SkipToContent };
