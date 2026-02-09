import { NotificationEvent } from './notification-event';

export interface NotificationMessage {
  id: string;
  event: NotificationEvent;
  read: boolean;
  dismissed: boolean;
  createdAt: Date;
}
