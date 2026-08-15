import { ILogger } from '@theia/core';
import { NotificationClient, NotificationInput } from '../../shared';
import { NotificationServiceImpl } from './notification-service';
import { NotificationStore } from '../store/notification-store';

const sampleInput: NotificationInput = {
    severity: 'warning',
    title: 'Build',
    message: 'Compilation finished'
};

function createService(): {
    service: NotificationServiceImpl;
    store: NotificationStore;
    logger: Pick<ILogger, 'info'>;
} {
    const store = new NotificationStore();
    const logger = { info: jest.fn().mockResolvedValue(undefined) };
    const service = new NotificationServiceImpl(store, logger as unknown as ILogger);
    return { service, store, logger };
}

describe('NotificationServiceImpl', () => {
    it('push writes to the store and notifies the client', async () => {
        const { service, store } = createService();
        const client: NotificationClient = { onNotification: jest.fn() };
        service.setClient(client);

        const created = await service.push(sampleInput);

        expect(store.getAll()).toEqual([created]);
        expect(client.onNotification).toHaveBeenCalledWith(created);
    });

    it('push assigns id and timestamp', async () => {
        const { service } = createService();
        const before = Date.now();

        const created = await service.push(sampleInput);

        expect(created.id).toEqual(expect.any(String));
        expect(created.id.length).toBeGreaterThan(0);
        expect(created.timestamp).toBeGreaterThanOrEqual(before);
        expect(created.timestamp).toBeLessThanOrEqual(Date.now());
        expect(created).toMatchObject(sampleInput);
    });

    it('push does not throw when no client is connected', async () => {
        const { service, store } = createService();

        const created = await service.push(sampleInput);

        expect(store.getAll()).toEqual([created]);
    });

    it('getHistory delegates to the store', async () => {
        const { service } = createService();
        await service.push({ ...sampleInput, title: 'First' });
        await service.push({ ...sampleInput, title: 'Second' });

        const history = await service.getHistory();

        expect(history.map(item => item.title)).toEqual(['First', 'Second']);
    });

    it('clearHistory empties the store', async () => {
        const { service, store } = createService();
        await service.push(sampleInput);

        await service.clearHistory();

        expect(store.getAll()).toEqual([]);
        expect(await service.getHistory()).toEqual([]);
    });

    it('actionInvoked logs notification and action ids', async () => {
        const { service, logger } = createService();

        await service.actionInvoked('n-1', 'open');

        expect(logger.info).toHaveBeenCalledWith(
            'Notification action invoked: n-1 / open'
        );
    });
});
