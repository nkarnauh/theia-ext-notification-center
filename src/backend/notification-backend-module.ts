import { ConnectionHandler, RpcConnectionHandler } from '@theia/core/lib/common/messaging';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { ContainerModule } from '@theia/core/shared/inversify';
import {
    NOTIFICATION_SERVICE_PATH,
    NotificationClient,
    NotificationService
} from '../shared';
import { NotificationServiceImpl } from './service/notification-service';
import { NotificationStore } from './store/notification-store';
import { PersistedNotificationStore } from './store/persisted-notification-store';

export default new ContainerModule(bind => {
    bind(PersistedNotificationStore).toSelf().inSingletonScope();
    bind(NotificationStore).toService(PersistedNotificationStore);
    bind(BackendApplicationContribution).toService(PersistedNotificationStore);

    bind(NotificationServiceImpl).toSelf().inSingletonScope();
    bind(NotificationService).toService(NotificationServiceImpl);

    bind(ConnectionHandler).toDynamicValue(ctx => {
        const service = ctx.container.get(NotificationServiceImpl);
        return new RpcConnectionHandler<NotificationClient>(NOTIFICATION_SERVICE_PATH, client => {
            service.setClient(client);
            client.onDidCloseConnection(() => service.disconnectClient(client));
            return service;
        });
    }).inSingletonScope();
});
