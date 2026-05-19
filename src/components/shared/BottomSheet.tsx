import React, { useEffect, useRef } from 'react';
import { FocusTrap } from '../AccessibilityHelpers';
import { Z_INDEX } from '../../utils/zIndex';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
  /** Optional close-on-backdrop click. Default true. */
  closeOnBackdrop?: boolean;
  /** Optional Esc-to-close. Default true. */
  closeOnEscape?: boolean;
  /** Adds a drag handle visual at the top. Default true. */
  showHandle?: boolean;
  testId?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  labelledBy,
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showHandle = true,
  testId,
}) => {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    triggerRef.current = document.activeElement as HTMLElement | null;
    return () => {
      triggerRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEscape) return undefined;
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-slate-950/55 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ zIndex: Z_INDEX.MODALS }}
      onClick={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
      data-testid={testId}
    >
      <FocusTrap active={true}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          className="w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden rounded-t-2xl border-t border-x border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom duration-200"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          onClick={(event) => event.stopPropagation()}
        >
          {showHandle && (
            <div className="flex justify-center py-2" aria-hidden>
              <span className="h-1.5 w-10 rounded-full bg-slate-300" />
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </FocusTrap>
    </div>
  );
};
