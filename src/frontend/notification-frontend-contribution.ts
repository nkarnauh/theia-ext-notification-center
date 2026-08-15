import { Command, CommandContribution, CommandRegistry, ILogger } from '@theia/core';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { NotificationService } from '../shared';
import { NotificationClientImpl } from './notification-client';

export const NOTIFICATION_CENTER_CATEGORY = 'Notifications';

export const NotificationCenterCommands = {
    PUSH_SAMPLE: {
        id: 'notification-center.pushSample',
        label: 'Push Sample Notification',
        category: NOTIFICATION_CENTER_CATEGORY
    } as Command,
    PUSH_SAMPLE_ERROR: {
        id: 'notification-center.pushSampleError',
        label: 'Push Sample Error Notification',
        category: NOTIFICATION_CENTER_CATEGORY
    } as Command,
    TOGGLE_PANEL: {
        id: 'notification-center.togglePanel'
    } as Command,
    CLEAR_ALL: {
        id: 'notification-center.clearAll',
        label: 'Clear All Notifications',
        category: NOTIFICATION_CENTER_CATEGORY
    } as Command
};

@injectable()
export class NotificationFrontendContribution implements CommandContribution, FrontendApplicationContribution {
    @inject(NotificationService)
    protected readonly notificationService!: NotificationService;

    @inject(NotificationClientImpl)
    protected readonly client!: NotificationClientImpl;

    @inject(ILogger)
    protected readonly logger!: ILogger;

    async onStart(): Promise<void> {
        try {
            this.client.replaceHistory(await this.notificationService.getHistory());
        } catch (error) {
            this.logger.error('Failed to load notification history', error);
        }
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(NotificationCenterCommands.PUSH_SAMPLE, {
            execute: () => this.notificationService.push({
                severity: 'info',
                title: 'Sample notification',
                message: 'This is a sample info notification.',
                actions: [{ id: 'ack', label: 'Acknowledge' }]
            })
        });
        commands.registerCommand(NotificationCenterCommands.PUSH_SAMPLE_ERROR, {
            execute: () => this.notificationService.push({
                severity: 'error',
                title: 'Sample error',
                message: 'This error stays until closed.',
                actions: [{ id: 'ack', label: 'Acknowledge' }]
            })
        });
    }
}
