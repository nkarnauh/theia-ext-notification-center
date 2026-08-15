import { Disposable, DisposableCollection, Emitter, Event } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';
import { Notification, NotificationClient } from '../../shared';

@injectable()
export class NotificationClientImpl implements NotificationClient, Disposable {
    protected readonly onNotificationEmitter = new Emitter<Notification>();
    readonly onDidReceiveNotification: Event<Notification> = this.onNotificationEmitter.event;

    protected readonly onDidChangeHistoryEmitter = new Emitter<Notification[]>();
    readonly onDidChangeHistory: Event<Notification[]> = this.onDidChangeHistoryEmitter.event;

    protected readonly toDispose = new DisposableCollection(
        this.onNotificationEmitter,
        this.onDidChangeHistoryEmitter
    );
    protected history: Notification[] = [];

    onNotification(notification: Notification): void {
        this.history.push(notification);
        this.onNotificationEmitter.fire(notification);
        this.emitHistory();
    }

    replaceHistory(notifications: Notification[]): void {
        this.history = [...notifications];
        this.emitHistory();
    }

    clearHistory(): void {
        this.history = [];
        this.emitHistory();
    }

    getHistory(): Notification[] {
        return [...this.history];
    }

    dispose(): void {
        this.toDispose.dispose();
        this.history = [];
    }

    protected emitHistory(): void {
        this.onDidChangeHistoryEmitter.fire(this.getHistory());
    }
}
