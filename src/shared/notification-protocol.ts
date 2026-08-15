import { RpcServer } from '@theia/core/lib/common/messaging';
import { Notification, NotificationInput } from './notification-types';

export const NOTIFICATION_SERVICE_PATH = '/services/notification-center';

export const NotificationService = Symbol('NotificationService');

export interface NotificationService extends RpcServer<NotificationClient> {
    push(input: NotificationInput): Promise<Notification>;
    getHistory(): Promise<Notification[]>;
    clearHistory(): Promise<void>;
    actionInvoked(notificationId: string, actionId: string): Promise<void>;
}

export const NotificationClient = Symbol('NotificationClient');

export interface NotificationClient {
    onNotification(notification: Notification): void;
}
