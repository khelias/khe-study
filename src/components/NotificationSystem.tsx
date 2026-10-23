/**
 * Unified Notification System
 *
 * - Single rendering layer for toasts + modal popups
 * - Slot-based stacking (top/center/bottom/overlay)
 * - Consistent i18n (no hardcoded strings)
 * - Profile-aware text formatting
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Flame, Info, Lightbulb, RotateCcw, Trophy, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';
import { AppModal } from './shared';
import type { Notification, NotificationType } from '../types/notification';
import { Z_INDEX } from '../utils/zIndex';

export type NotificationSlot = 'top' | 'center' | 'bottom' | 'overlay';

const NOTIFICATION_PRIORITY: Record<NotificationType, number> = {
  achievement: 7,
  levelUp: 6,
  streak: 5,
  correct: 4,
  wrong: 3,
  hint: 2,
  tip: 1,
  info: 0,
};

const NOTIFICATION_SLOT: Record<NotificationType, NotificationSlot> = {
  correct: 'center',
  streak: 'center',
  wrong: 'center',
  hint: 'top',
  info: 'top',
  tip: 'bottom',
  levelUp: 'overlay',
  achievement: 'overlay',
};

const DEFAULT_DURATION: Partial<Record<NotificationType, number>> = {
  correct: 500,
  streak: 500,
  wrong: 500,
  info: 1000,
  hint: 2200,
  achievement: 3000,
};

const AUTO_DISMISS: Record<NotificationType, boolean> = {
  correct: true,
  streak: true,
  wrong: true,
  info: true,
  hint: true,
  tip: false,
  levelUp: false,
  achievement: true,
};

const STACK_LIMIT: Record<NotificationSlot, number> = {
  top: 2,
  center: 1,
  bottom: 1,
  overlay: 1,
};

const stripEmojis = (text: string): string => {
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
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
    { top: [], center: [], bottom: [], overlay: [] } as Record<NotificationSlot, Notification[]>,
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
  const centerNotifications = useMemo(
    () => selectVisible(grouped.center, 'center'),
    [grouped.center],
  );
  const bottomNotifications = useMemo(
    () => selectVisible(grouped.bottom, 'bottom'),
    [grouped.bottom],
  );
  const overlayNotification = useMemo(
    () => selectVisible(grouped.overlay, 'overlay')[0] ?? null,
    [grouped.overlay],
  );

  return (
    <>
      {overlayNotification && (
        <NotificationItem notification={overlayNotification} onDismiss={onDismiss} />
      )}
      <NotificationStack slot="top" notifications={topNotifications} onDismiss={onDismiss} />
      <NotificationStack slot="center" notifications={centerNotifications} onDismiss={onDismiss} />
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
  center: 'fixed inset-0 flex flex-col items-center justify-center gap-4 px-4 pointer-events-none',
  bottom:
    'fixed inset-x-0 bottom-4 sm:bottom-6 flex flex-col items-center gap-3 px-4 pointer-events-none',
  overlay: '',
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
    if (notification.type === 'levelUp' && notification.levelUpOnDismiss) {
      notification.levelUpOnDismiss();
    }
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

  if (notification.type === 'levelUp') {
    return (
      <LevelUpPopup
        notification={notification}
        isShowing={visible && !exiting}
        onDismiss={dismiss}
        titleFallback={formatText(t.notifications.levelUpTitle)}
        messageFallback={formatText(t.levelUp.greatWork)}
        buttonLabel={formatText(t.levelUp.nextLevel)}
        closeLabel={t.notifications.closeLevelUp}
        formatText={formatText}
      />
    );
  }

  if (notification.type === 'achievement') {
    return (
      <AchievementPopup
        notification={notification}
        isShowing={visible && !exiting}
        onDismiss={dismiss}
        titleFallback={formatText(t.notifications.achievementTitle)}
        closeLabel={t.notifications.closeAchievement}
        formatText={formatText}
      />
    );
  }

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
  if (slot === 'bottom') return 'opacity-0 translate-y-2 scale-95';
  return 'opacity-0 scale-90';
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
    case 'correct': {
      const message = stripEmojis(formatText(notification.message ?? t.notifications.correctTitle));
      return (
        <FeedbackToast
          slot={slot}
          isShowing={isShowing}
          icon={Check}
          message={message}
          role="alert"
          tone="ok"
        />
      );
    }
    case 'streak': {
      const streakCount = notification.streakCount ?? 2;
      const fallback = `${streakCount} ${t.notifications.streakSuffix}`;
      const message = stripEmojis(formatText(notification.message ?? fallback));
      return (
        <FeedbackToast
          slot={slot}
          isShowing={isShowing}
          icon={Flame}
          message={message}
          role="alert"
          tone="ok"
        />
      );
    }
    case 'wrong': {
      const message = stripEmojis(formatText(notification.message ?? t.notifications.wrongTitle));
      return (
        <FeedbackToast
          slot={slot}
          isShowing={isShowing}
          icon={RotateCcw}
          message={message}
          role="alert"
          tone="bad"
          attentionClass={isShowing ? 'animate-shake' : ''}
        />
      );
    }
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

const FEEDBACK_TONE = {
  ok: { icon: 'text-ok', edge: 'border-l-ok' },
  bad: { icon: 'text-bad', edge: 'border-l-bad' },
} as const;

interface FeedbackToastProps {
  slot: NotificationSlot;
  isShowing: boolean;
  icon: LucideIcon;
  message: string;
  role: 'alert' | 'status';
  tone: keyof typeof FEEDBACK_TONE;
  attentionClass?: string;
}

const FeedbackToast: React.FC<FeedbackToastProps> = ({
  slot,
  isShowing,
  icon: Icon,
  message,
  role,
  tone,
  attentionClass = '',
}) => {
  const toneClasses = FEEDBACK_TONE[tone];

  return (
    <div
      className={`
        pointer-events-none fam-float rounded-lg border-l-[3px]
        ${toneClasses.edge}
        ${getToastStateClass(slot, isShowing)}
        ${attentionClass}
        flex w-full max-w-sm items-center gap-3
        px-5 py-4
        transition-all duration-200
      `}
      style={{ zIndex: Z_INDEX.NOTIFICATIONS }}
      role={role}
      aria-live="polite"
    >
      <Icon
        size={28}
        strokeWidth={2.5}
        className={`flex-shrink-0 ${toneClasses.icon}`}
        aria-hidden
      />
      <div className="text-xl font-semibold leading-tight text-ink sm:text-2xl">{message}</div>
    </div>
  );
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

interface LevelUpPopupProps {
  notification: Notification;
  isShowing: boolean;
  onDismiss: () => void;
  titleFallback: string;
  messageFallback: string;
  buttonLabel: string;
  closeLabel: string;
  formatText: (text: string) => string;
}

const LevelUpPopup: React.FC<LevelUpPopupProps> = ({
  notification,
  isShowing,
  onDismiss,
  titleFallback,
  messageFallback,
  buttonLabel,
  closeLabel,
  formatText,
}) => {
  return (
    <AppModal
      labelledBy={`${notification.id}-levelup-title`}
      onClose={onDismiss}
      size="sm"
      zIndex={Z_INDEX.NOTIFICATIONS}
      className={`transition-opacity duration-200 ${isShowing ? 'opacity-100' : 'opacity-0'}`}
      panelClassName={`relative transition-transform duration-200 ${isShowing ? 'scale-100' : 'scale-95'}`}
      contentClassName="p-7 text-center sm:p-8"
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDismiss();
        }}
        className="fam-icon-btn absolute right-3 top-3"
        aria-label={closeLabel}
      >
        <X size={18} aria-hidden />
      </button>
      <Trophy size={44} strokeWidth={1.75} className="mx-auto mb-4 text-ink" aria-hidden />
      <h2 id={`${notification.id}-levelup-title`} className="fam-heading mb-2">
        {notification.title ? formatText(notification.title) : titleFallback}
      </h2>
      <p id={`${notification.id}-levelup-message`} className="mb-6 text-[15px] text-ink-2">
        {notification.message ? formatText(notification.message) : messageFallback}
      </p>
      <button type="button" onClick={onDismiss} className="fam-btn fam-btn-primary w-full">
        {buttonLabel}
      </button>
    </AppModal>
  );
};

interface AchievementPopupProps {
  notification: Notification;
  isShowing: boolean;
  onDismiss: () => void;
  titleFallback: string;
  closeLabel: string;
  formatText: (text: string) => string;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({
  notification,
  isShowing,
  onDismiss,
  titleFallback,
  closeLabel,
  formatText,
}) => {
  const achievement = notification.achievement;

  useEffect(() => {
    if (!achievement) {
      onDismiss();
    }
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <AppModal
      labelledBy={`${notification.id}-achievement-title`}
      onClose={onDismiss}
      size="sm"
      zIndex={Z_INDEX.NOTIFICATIONS}
      className={`transition-opacity duration-200 ${isShowing ? 'opacity-100' : 'opacity-0'}`}
      panelClassName={`relative transition-transform duration-200 ${isShowing ? 'scale-100' : 'scale-95'}`}
      contentClassName="p-7 text-center sm:p-8"
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDismiss();
        }}
        className="fam-icon-btn absolute right-3 top-3"
        aria-label={closeLabel}
      >
        <X size={18} aria-hidden />
      </button>
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-sunken text-5xl">
        {achievement.icon}
      </div>
      <div className="fam-label mb-1">{titleFallback}</div>
      <h2 id={`${notification.id}-achievement-title`} className="fam-heading mb-2">
        {formatText(achievement.title)}
      </h2>
      <p className="text-[15px] text-ink-2">{formatText(achievement.desc)}</p>
    </AppModal>
  );
};
