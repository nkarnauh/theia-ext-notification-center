import { injectable } from '@theia/core/shared/inversify';
import { Notification } from '../shared';

@injectable()
export class NotificationStore {
    static readonly LIMIT = 100;

    protected readonly items: Notification[] = [];

    getAll(): Notification[] {
        return [...this.items];
    }

    push(notification: Notification): void {
        this.items.push(notification);
        if (this.items.length > NotificationStore.LIMIT) {
            this.items.shift();
        }
    }

    clear(): void {
        this.items.length = 0;
    }
}
