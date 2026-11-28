export type NotificationType = 'hint' | 'info' | 'tip';

export interface Notification {
  id: string;
  type: NotificationType;
  message?: string;
  title?: string;
  duration?: number;
  createdAt: number;
}

export type NotificationInput = Omit<Notification, 'id' | 'createdAt'>;
