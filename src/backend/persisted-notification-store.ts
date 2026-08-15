import { ILogger } from '@theia/core';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables';
import { FileUri } from '@theia/core/lib/common/file-uri';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { inject, injectable } from '@theia/core/shared/inversify';
import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { Notification } from '../shared';
import { NotificationStore } from './notification-store';

@injectable()
export class PersistedNotificationStore extends NotificationStore implements BackendApplicationContribution {
    static readonly DIR_NAME = 'notification-center';
    static readonly FILE_NAME = 'history.json';

    protected filePath: string | undefined;
    protected saving: Promise<void> = Promise.resolve();

    constructor(
        @inject(EnvVariablesServer) protected readonly envVariables: EnvVariablesServer,
        @inject(ILogger) protected readonly logger: ILogger
    ) {
        super();
    }

    async initialize(): Promise<void> {
        const configDir = FileUri.fsPath(await this.envVariables.getConfigDirUri());
        this.filePath = join(configDir, PersistedNotificationStore.DIR_NAME, PersistedNotificationStore.FILE_NAME);
        await this.load();
    }

    override push(notification: Notification): void {
        super.push(notification);
        this.queueSave();
    }

    override clear(): void {
        super.clear();
        this.queueSave();
    }

    async flush(): Promise<void> {
        await this.saving;
    }

    protected queueSave(): void {
        this.saving = this.saving.then(() => this.save()).catch(error => {
            this.logger.error('Failed to persist notification history', error);
        });
    }

    protected async load(): Promise<void> {
        if (!this.filePath) {
            return;
        }
        try {
            const raw = await readFile(this.filePath, 'utf8');
            const parsed: unknown = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                this.logger.error('Notification history file is not an array, ignoring');
                return;
            }
            this.items.length = 0;
            this.items.push(...parsed.filter(isNotification).slice(-NotificationStore.LIMIT));
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                this.logger.error('Failed to load notification history', error);
            }
        }
    }

    protected async save(): Promise<void> {
        if (!this.filePath) {
            return;
        }
        await mkdir(dirname(this.filePath), { recursive: true });
        const tempPath = `${this.filePath}.tmp`;
        await writeFile(tempPath, JSON.stringify(this.getAll()), 'utf8');
        await rename(tempPath, this.filePath);
    }
}

const isNotification = (value: unknown): value is Notification => {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const candidate = value as Notification;
    return typeof candidate.id === 'string'
        && typeof candidate.timestamp === 'number'
        && typeof candidate.title === 'string'
        && typeof candidate.message === 'string'
        && (candidate.severity === 'info' || candidate.severity === 'warning' || candidate.severity === 'error');
};
