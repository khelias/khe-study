/**
 * Unified Notification System
 *
 * - Single rendering layer for toasts + modal popups
 * - Slot-based stacking (top/bottom); right, wrong, streaks and achievements are shown in
 *   place, not here (board 3A)
 * - Consistent i18n (no hardcoded strings)
 * - Profile-aware text formatting
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Info, Lightbulb, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';
import type { Notification, NotificationType } from '../types/notification';
import { Z_INDEX } from '../utils/zIndex';

export type NotificationSlot = 'top' | 'bottom';

const NOTIFICATION_PRIORITY: Record<NotificationType, number> = {
  hint: 2,
  tip: 1,
  info: 0,
};

const NOTIFICATION_SLOT: Record<NotificationType, NotificationSlot> = {
  hint: 'top',
  info: 'top',
  tip: 'bottom',
};

const DEFAULT_DURATION: Partial<Record<NotificationType, number>> = {
  info: 1000,
  hint: 2200,
};

const AUTO_DISMISS: Record<NotificationType, boolean> = {
  info: true,
  hint: true,
  tip: false,
};

const STACK_LIMIT: Record<NotificationSlot, number> = {
  top: 2,
  bottom: 1,
};

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const sortByPriority = (a: Notification, b: Notification): number => {
  const priorityDiff = NOTIFICATION_PRIORITY[b.type] - NOTIFICATION_PRIORITY[a.type];
  if (priorityDiff !== 0) return priorityDiff;
  return (b.createdAt ?? 0) - (a.createdAt ?? 0);
};

const groupBySlot = (notifications: Notification[]): Record<NotificationSlot, Notification[]> => {
  return notifications.reduce(
    (acc, notification) => {
      const slot = NOTIFICATION_SLOT[notification.type];
      acc[slot].push(notification);
      return acc;
    },
    { top: [], bottom: [] } as Record<NotificationSlot, Notification[]>,
  );
};

const selectVisible = (items: Notification[], slot: NotificationSlot): Notification[] => {
  const sorted = [...items].sort(sortByPriority);
  return sorted.slice(0, STACK_LIMIT[slot]);
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
}) => {
  const grouped = useMemo(() => groupBySlot(notifications), [notifications]);

  const topNotifications = useMemo(() => selectVisible(grouped.top, 'top'), [grouped.top]);
  const bottomNotifications = useMemo(
    () => selectVisible(grouped.bottom, 'bottom'),
    [grouped.bottom],
  );

  return (
    <>
      <NotificationStack slot="top" notifications={topNotifications} onDismiss={onDismiss} />
      <NotificationStack slot="bottom" notifications={bottomNotifications} onDismiss={onDismiss} />
    </>
  );
};

interface NotificationStackProps {
  slot: NotificationSlot;
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const STACK_CLASSES: Record<NotificationSlot, string> = {
  top: 'fixed inset-x-0 top-16 sm:top-20 flex flex-col items-center gap-3 px-4 pointer-events-none',
  bottom:
    'fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-3 px-4 pointer-events-none',
};

const NotificationStack: React.FC<NotificationStackProps> = ({
  slot,
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className={STACK_CLASSES[slot]} style={{ zIndex: Z_INDEX.NOTIFICATIONS }}>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const ENTER_DELAY_MS = 20;
const EXIT_DURATION_MS = 220;

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const slot = NOTIFICATION_SLOT[notification.type];

  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
    }
    exitTimerRef.current = setTimeout(() => {
      onDismiss(notification.id);
    }, EXIT_DURATION_MS);
  }, [exiting, notification, onDismiss]);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), ENTER_DELAY_MS);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  const duration = notification.duration ?? DEFAULT_DURATION[notification.type];
  const autoDismiss =
    notification.duration !== undefined
      ? notification.duration > 0
      : AUTO_DISMISS[notification.type];

  useEffect(() => {
    if (!visible) return;
    if (!autoDismiss || !duration || duration <= 0) return;

    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [autoDismiss, duration, dismiss, visible]);

  if (!visible && !exiting) return null;

  return (
    <ToastNotification
      notification={notification}
      slot={slot}
      isShowing={visible && !exiting}
      onDismiss={dismiss}
      formatText={formatText}
      t={t}
    />
  );
};

interface ToastNotificationProps {
  notification: Notification;
  slot: NotificationSlot;
  isShowing: boolean;
  onDismiss: () => void;
  formatText: (text: string) => string;
  t: ReturnType<typeof useTranslation>;
}

const getToastStateClass = (slot: NotificationSlot, isShowing: boolean): string => {
  if (isShowing) return 'opacity-100 translate-y-0 scale-100';
  if (slot === 'top') return 'opacity-0 -translate-y-2 scale-95';
  return 'opacity-0 translate-y-2 scale-95';
};

const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  slot,
  isShowing,
  onDismiss,
  formatText,
  t,
}) => {
  switch (notification.type) {
    case 'hint': {
      const message = formatText(notification.message ?? t.gameScreen.hints.default);
      return (
        <StandardToast
          slot={slot}
          isShowing={isShowing}
          icon={Lightbulb}
          label={formatText(notification.title ?? t.notifications.hintTitle)}
          message={message}
          role="alert"
          showClose
          onClose={onDismiss}
          closeLabel={t.notifications.closeHint}
        />
      );
    }
    case 'tip': {
      const message = formatText(notification.message ?? '');
      return (
        <StandardToast
          slot={slot}
          isShowing={isShowing}
          icon={Lightbulb}
          label={formatText(notification.title ?? t.notifications.tipTitle)}
          message={message}
          role="status"
          attentionClass={isShowing ? 'animate-fade-in' : ''}
          showClose
          onClose={onDismiss}
          closeLabel={t.notifications.closeTip}
        />
      );
    }
    case 'info':
    default: {
      const message = formatText(notification.message ?? t.notifications.infoTitle);
      return (
        <StandardToast
          slot={slot}
          isShowing={isShowing}
          icon={Info}
          iconClassName="text-muted"
          message={message}
          role="status"
        />
      );
    }
  }
};

interface StandardToastProps {
  slot: NotificationSlot;
  isShowing: boolean;
  icon: LucideIcon;
  iconClassName?: string;
  message: string;
  label?: string;
  role: 'alert' | 'status';
  attentionClass?: string;
  showClose?: boolean;
  onClose?: () => void;
  closeLabel?: string;
}

const StandardToast: React.FC<StandardToastProps> = ({
  slot,
  isShowing,
  icon: Icon,
  iconClassName = 'text-ink',
  message,
  label,
  role,
  attentionClass = '',
  showClose = false,
  onClose,
  closeLabel,
}) => {
  return (
    <div
      className={`
        pointer-events-none fam-float rounded-lg
        ${getToastStateClass(slot, isShowing)}
        ${attentionClass}
        w-full max-w-md
        px-4 py-3
        transition-all duration-200
      `}
      style={{ zIndex: Z_INDEX.NOTIFICATIONS }}
      role={role}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon size={22} className={`mt-0.5 flex-shrink-0 ${iconClassName}`} aria-hidden />
        <div className="min-w-0 flex-1">
          {label && <div className="fam-label mb-0.5">{label}</div>}
          <div className="text-[15px] font-medium leading-snug text-ink">{message}</div>
        </div>
        {showClose && onClose && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            type="button"
            className="fam-icon-btn pointer-events-auto -my-1 -mr-1 flex-shrink-0 active:bg-sunken"
            aria-label={closeLabel}
          >
            <X size={18} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
};
