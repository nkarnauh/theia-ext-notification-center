import { ILogger } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import {
    Notification,
    NotificationClient,
    NotificationInput,
    NotificationService
} from '../shared';
import { NotificationStore } from './notification-store';

@injectable()
export class NotificationServiceImpl implements NotificationService {
    protected client: NotificationClient | undefined;

    constructor(
        @inject(NotificationStore) protected readonly store: NotificationStore,
        @inject(ILogger) protected readonly logger: ILogger
    ) { }

    setClient(client: NotificationClient | undefined): void {
        this.client = client;
    }

    getClient(): NotificationClient | undefined {
        return this.client;
    }

    disconnectClient(client: NotificationClient): void {
        if (this.client === client) {
            this.client = undefined;
        }
    }

    dispose(): void {
        this.client = undefined;
    }

    async push(input: NotificationInput): Promise<Notification> {
        const notification: Notification = {
            ...input,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };
        this.store.push(notification);
        this.client?.onNotification(notification);
        return notification;
    }

    async getHistory(): Promise<Notification[]> {
        return this.store.getAll();
    }

    async clearHistory(): Promise<void> {
        this.store.clear();
    }

    async actionInvoked(notificationId: string, actionId: string): Promise<void> {
        this.logger.info(`Notification action invoked: ${notificationId} / ${actionId}`);
    }
}
