import { CommandRegistry } from '@theia/core';
import { AbstractViewContribution, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { NotificationService } from '../../shared';
import { NotificationClientImpl } from '../client/notification-client';
import { NotificationCenterCommands } from '../commands/notification-frontend-contribution';
import { NotificationPanelWidget } from './notification-panel-widget';

@injectable()
export class NotificationPanelContribution extends AbstractViewContribution<NotificationPanelWidget> implements FrontendApplicationContribution {
    @inject(NotificationService)
    protected readonly notificationService!: NotificationService;

    @inject(NotificationClientImpl)
    protected readonly client!: NotificationClientImpl;

    constructor() {
        super({
            widgetId: NotificationPanelWidget.ID,
            widgetName: NotificationPanelWidget.LABEL,
            defaultWidgetOptions: {
                area: 'right'
            },
            toggleCommandId: NotificationCenterCommands.TOGGLE_PANEL.id
        });
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(NotificationCenterCommands.CLEAR_ALL, {
            execute: () => this.clearAll()
        });
    }

    async initializeLayout(): Promise<void> {
        await this.openView({ reveal: true, activate: false });
    }

    protected async clearAll(): Promise<void> {
        await this.notificationService.clearHistory();
        this.client.clearHistory();
    }
}
