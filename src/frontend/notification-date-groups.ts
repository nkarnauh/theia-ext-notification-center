import { Notification } from '../shared';

export type NotificationDateGroup = 'today' | 'yesterday' | 'earlier';

export const NOTIFICATION_DATE_GROUP_LABELS: Record<NotificationDateGroup, string> = {
    today: 'Сегодня',
    yesterday: 'Вчера',
    earlier: 'Ранее'
};

export const NOTIFICATION_DATE_GROUP_ORDER: NotificationDateGroup[] = ['today', 'yesterday', 'earlier'];

export function startOfLocalDay(timestamp: number): number {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

export function notificationDateGroup(timestamp: number, now = Date.now()): NotificationDateGroup {
    const day = startOfLocalDay(timestamp);
    const today = startOfLocalDay(now);
    if (day === today) {
        return 'today';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (day === yesterday.getTime()) {
        return 'yesterday';
    }
    return 'earlier';
}

export interface NotificationDateGroupSection {
    group: NotificationDateGroup;
    items: Notification[];
}

export function groupNotifications(items: Notification[], now = Date.now()): NotificationDateGroupSection[] {
    const buckets: Record<NotificationDateGroup, Notification[]> = {
        today: [],
        yesterday: [],
        earlier: []
    };
    for (const item of items) {
        buckets[notificationDateGroup(item.timestamp, now)].push(item);
    }
    return NOTIFICATION_DATE_GROUP_ORDER
        .filter(group => buckets[group].length > 0)
        .map(group => ({ group, items: buckets[group] }));
}
