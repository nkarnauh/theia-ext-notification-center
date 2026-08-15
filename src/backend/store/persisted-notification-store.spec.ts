import { ILogger } from '@theia/core';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables';
import { FileUri } from '@theia/core/lib/common/file-uri';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Notification } from '../../shared';
import { PersistedNotificationStore } from './persisted-notification-store';

function sample(id: string, timestamp = Number(id)): Notification {
    return {
        id,
        severity: 'info',
        title: `Title ${id}`,
        message: `Message ${id}`,
        timestamp
    };
}

describe('PersistedNotificationStore', () => {
    let configDir: string;
    let store: PersistedNotificationStore;
    let logger: Pick<ILogger, 'error'>;

    beforeEach(async () => {
        configDir = await mkdtemp(join(tmpdir(), 'nc-store-'));
        logger = { error: jest.fn().mockResolvedValue(undefined) };
        store = createStore(configDir, logger);
        await store.initialize();
    });

    afterEach(async () => {
        await rm(configDir, { recursive: true, force: true });
    });

    it('writes history to the config dir and reloads it', async () => {
        store.push(sample('1'));
        store.push(sample('2'));
        await store.flush();

        const raw = await readFile(historyPath(configDir), 'utf8');
        expect(JSON.parse(raw).map((item: Notification) => item.id)).toEqual(['1', '2']);

        const reloaded = createStore(configDir, logger);
        await reloaded.initialize();
        expect(reloaded.getAll().map(item => item.id)).toEqual(['1', '2']);
    });

    it('persists clear as an empty file', async () => {
        store.push(sample('1'));
        await store.flush();
        store.clear();
        await store.flush();

        const reloaded = createStore(configDir, logger);
        await reloaded.initialize();
        expect(reloaded.getAll()).toEqual([]);
    });

    it('starts empty when the history file is missing', async () => {
        expect(store.getAll()).toEqual([]);
    });

    it('ignores a corrupt history file and logs an error', async () => {
        await mkdir(join(configDir, PersistedNotificationStore.DIR_NAME), { recursive: true });
        await writeFile(historyPath(configDir), '{not-json', 'utf8');

        const reloaded = createStore(configDir, logger);
        await reloaded.initialize();

        expect(reloaded.getAll()).toEqual([]);
        expect(logger.error).toHaveBeenCalled();
    });
});

function createStore(configDir: string, logger: Pick<ILogger, 'error'>): PersistedNotificationStore {
    const envVariables = {
        getConfigDirUri: async () => FileUri.create(configDir).toString()
    } as EnvVariablesServer;
    return new PersistedNotificationStore(envVariables, logger as ILogger);
}

function historyPath(configDir: string): string {
    return join(configDir, PersistedNotificationStore.DIR_NAME, PersistedNotificationStore.FILE_NAME);
}
