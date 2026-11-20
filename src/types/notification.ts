import type { AchievementUnlock } from './achievement';

export type NotificationType =
  'correct' | 'wrong' | 'streak' | 'hint' | 'achievement' | 'info' | 'tip';

export interface Notification {
  id: string;
  type: NotificationType;
  message?: string;
  title?: string;
  achievement?: AchievementUnlock;
  duration?: number;
  streakCount?: number;
  createdAt: number;
}

export type NotificationInput = Omit<Notification, 'id' | 'createdAt'>;
