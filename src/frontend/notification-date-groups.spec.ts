import { Notification } from '../shared';
import { groupNotifications, notificationDateGroup } from './notification-date-groups';

function sample(id: string, timestamp: number): Notification {
    return {
        id,
        severity: 'info',
        title: id,
        message: id,
        timestamp
    };
}

describe('notification-date-groups', () => {
    const now = new Date(2026, 7, 15, 14, 30, 0).getTime();
    const todayMorning = new Date(2026, 7, 15, 0, 0, 1).getTime();
    const yesterdayNoon = new Date(2026, 7, 14, 12, 0, 0).getTime();
    const earlierNoon = new Date(2026, 7, 12, 12, 0, 0).getTime();

    it('classifies today, yesterday, and earlier', () => {
        expect(notificationDateGroup(now, now)).toBe('today');
        expect(notificationDateGroup(yesterdayNoon, now)).toBe('yesterday');
        expect(notificationDateGroup(earlierNoon, now)).toBe('earlier');
    });

    it('keeps newest-first order inside groups and omits empty groups', () => {
        const items = [
            sample('t1', now),
            sample('t0', todayMorning),
            sample('y', yesterdayNoon),
            sample('e', earlierNoon)
        ];

        expect(groupNotifications(items, now)).toEqual([
            { group: 'today', items: [items[0], items[1]] },
            { group: 'yesterday', items: [items[2]] },
            { group: 'earlier', items: [items[3]] }
        ]);
    });
});
