import { Disposable, DisposableCollection, Emitter, Event } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';
import { Notification, NotificationClient } from '../shared';

@injectable()
export class NotificationClientImpl implements NotificationClient, Disposable {
    protected readonly onNotificationEmitter = new Emitter<Notification>();
    readonly onDidReceiveNotification: Event<Notification> = this.onNotificationEmitter.event;

    protected readonly toDispose = new DisposableCollection(this.onNotificationEmitter);
    protected history: Notification[] = [];

    onNotification(notification: Notification): void {
        this.history.push(notification);
        this.onNotificationEmitter.fire(notification);
    }

    replaceHistory(notifications: Notification[]): void {
        this.history = [...notifications];
    }

    getHistory(): Notification[] {
        return [...this.history];
    }

    dispose(): void {
        this.toDispose.dispose();
        this.history = [];
    }
}
