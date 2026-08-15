import { CommandContribution } from '@theia/core';
import {
    bindViewContribution,
    FrontendApplicationContribution,
    WebSocketConnectionProvider,
    WidgetFactory
} from '@theia/core/lib/browser';
import { ContainerModule } from '@theia/core/shared/inversify';
import {
    NOTIFICATION_SERVICE_PATH,
    NotificationClient,
    NotificationService
} from '../shared';
import { NotificationClientImpl } from './client/notification-client';
import { NotificationFrontendContribution } from './commands/notification-frontend-contribution';
import { NotificationPanelContribution } from './panel/notification-panel-contribution';
import { NotificationPanelWidget } from './panel/notification-panel-widget';
import { NotificationToastService } from './toast/notification-toast-service';
import '../../src/frontend/style/index.css';

export default new ContainerModule(bind => {
    bind(NotificationClientImpl).toSelf().inSingletonScope();
    bind(NotificationClient).toService(NotificationClientImpl);

    bind(NotificationService).toDynamicValue(ctx => {
        const client = ctx.container.get(NotificationClientImpl);
        return WebSocketConnectionProvider.createProxy<NotificationService>(
            ctx.container,
            NOTIFICATION_SERVICE_PATH,
            client
        );
    }).inSingletonScope();

    bind(NotificationToastService).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(NotificationToastService);

    bind(NotificationFrontendContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(NotificationFrontendContribution);
    bind(FrontendApplicationContribution).toService(NotificationFrontendContribution);

    bind(NotificationPanelWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: NotificationPanelWidget.ID,
        createWidget: () => ctx.container.get(NotificationPanelWidget)
    })).inSingletonScope();
    bindViewContribution(bind, NotificationPanelContribution);
    bind(FrontendApplicationContribution).toService(NotificationPanelContribution);
});
