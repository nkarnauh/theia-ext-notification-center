import { Message, ReactWidget } from '@theia/core/lib/browser';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { type ReactNode } from '@theia/core/shared/react';
import { NotificationService } from '../../shared';
import { NotificationClientImpl } from '../client/notification-client';
import { NotificationPanelView } from './notification-panel-view';

@injectable()
export class NotificationPanelWidget extends ReactWidget {
    static readonly ID = 'notification-center-panel';
    static readonly LABEL = 'Notifications';

    @inject(NotificationClientImpl)
    protected readonly client!: NotificationClientImpl;

    @inject(NotificationService)
    protected readonly notificationService!: NotificationService;

    @postConstruct()
    protected init(): void {
        this.id = NotificationPanelWidget.ID;
        this.title.label = NotificationPanelWidget.LABEL;
        this.title.caption = NotificationPanelWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'codicon codicon-bell';
        this.addClass('notification-center-panel');
        this.node.tabIndex = 0;
        this.update();
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.node.focus();
    }

    protected render(): ReactNode {
        return <NotificationPanelView
            client={this.client}
            notificationService={this.notificationService}
        />;
    }
}
