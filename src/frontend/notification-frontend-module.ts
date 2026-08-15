import { CommandContribution } from '@theia/core';
import { FrontendApplicationContribution, WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { ContainerModule } from '@theia/core/shared/inversify';
import {
    NOTIFICATION_SERVICE_PATH,
    NotificationClient,
    NotificationService
} from '../shared';
import { NotificationClientImpl } from './notification-client';
import { NotificationFrontendContribution } from './notification-frontend-contribution';
import { NotificationToastService } from './notification-toast-service';
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
});
