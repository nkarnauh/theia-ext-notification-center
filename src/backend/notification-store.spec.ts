import { Notification } from '../shared';
import { NotificationStore } from './notification-store';

function sample(id: string): Notification {
    return {
        id,
        severity: 'info',
        title: `Title ${id}`,
        message: `Message ${id}`,
        timestamp: Number(id)
    };
}

describe('NotificationStore', () => {
    let store: NotificationStore;

    beforeEach(() => {
        store = new NotificationStore();
    });

    it('returns pushed notifications in chronological order', () => {
        store.push(sample('1'));
        store.push(sample('2'));
        store.push(sample('3'));

        expect(store.getAll().map(item => item.id)).toEqual(['1', '2', '3']);
    });

    it('returns a copy so callers cannot mutate internal history', () => {
        store.push(sample('1'));
        store.getAll().pop();

        expect(store.getAll()).toHaveLength(1);
    });

    it(`evicts the oldest record when history exceeds ${NotificationStore.LIMIT}`, () => {
        for (let i = 0; i < NotificationStore.LIMIT + 1; i++) {
            store.push(sample(String(i)));
        }

        const history = store.getAll();
        expect(history).toHaveLength(NotificationStore.LIMIT);
        expect(history[0].id).toBe('1');
        expect(history[history.length - 1].id).toBe(String(NotificationStore.LIMIT));
    });

    it('clears all records', () => {
        store.push(sample('1'));
        store.push(sample('2'));
        store.clear();

        expect(store.getAll()).toEqual([]);
    });
});
