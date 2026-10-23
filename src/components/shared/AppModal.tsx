import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { FocusTrap } from '../AccessibilityHelpers';
import { Z_INDEX } from '../../utils/zIndex';

type AppModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AppModalProps {
  children: React.ReactNode;
  labelledBy?: string;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  trapFocus?: boolean;
  size?: AppModalSize;
  className?: string;
  panelClassName?: string;
  contentClassName?: string;
  scrollable?: boolean;
  testId?: string;
  zIndex?: number;
}

interface AppModalHeaderProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  titleId?: string;
  onClose?: () => void;
  closeLabel: string;
  className?: string;
}

const sizeClasses: Record<AppModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
};

export const AppModal: React.FC<AppModalProps> = ({
  children,
  labelledBy,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  trapFocus = true,
  size = 'md',
  className = '',
  panelClassName = '',
  contentClassName = '',
  scrollable = true,
  testId,
  zIndex = Z_INDEX.MODALS,
}) => {
  useEffect(() => {
    if (!onClose || !closeOnEscape) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, onClose]);

  const panel = (
    <div
      data-testid={testId}
      className={[
        'fam-float w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl sm:w-[calc(100vw-2rem)]',
        'max-h-[calc(100dvh-2rem)] animate-in zoom-in-95 duration-200',
        sizeClasses[size],
        panelClassName,
      ].join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className={[
          'max-h-[calc(100dvh-2rem)] overflow-x-hidden',
          scrollable ? 'overflow-y-auto' : 'overflow-y-hidden',
          contentClassName,
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div
      className={[
        'fam-scrim fixed inset-0 flex items-end justify-center p-3',
        'animate-in fade-in duration-200 sm:items-center sm:p-4',
        className,
      ].join(' ')}
      style={{ zIndex }}
      onClick={(event) => {
        if (closeOnBackdrop && onClose && event.target === event.currentTarget) onClose();
      }}
    >
      {trapFocus ? <FocusTrap active={true}>{panel}</FocusTrap> : panel}
    </div>
  );
};

export const AppModalHeader: React.FC<AppModalHeaderProps> = ({
  title,
  icon,
  subtitle,
  titleId,
  onClose,
  closeLabel,
  className = '',
}) => {
  return (
    <div
      className={[
        'sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-rule bg-surface px-5 py-4',
        className,
      ].join(' ')}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <div className="mt-1 flex flex-shrink-0 items-center justify-center text-muted">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 id={titleId} className="fam-heading">
            {title}
          </h2>
          {subtitle && <div className="fam-label mt-1">{subtitle}</div>}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="fam-icon-btn flex-shrink-0"
          aria-label={closeLabel}
        >
          <X size={18} aria-hidden />
        </button>
      )}
    </div>
  );
};
