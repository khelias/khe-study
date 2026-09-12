import type { AchievementUnlock } from './achievement';

export type NotificationType =
  'correct' | 'wrong' | 'streak' | 'hint' | 'levelUp' | 'achievement' | 'info' | 'tip';

export interface Notification {
  id: string;
  type: NotificationType;
  message?: string;
  title?: string;
  emoji?: string;
  achievement?: AchievementUnlock;
  duration?: number;
  streakCount?: number;
  createdAt: number;
  /** Called when levelUp popup is dismissed; use to generate next problem after user acknowledges */
  levelUpOnDismiss?: () => void;
}

export type NotificationInput = Omit<Notification, 'id' | 'createdAt'>;
