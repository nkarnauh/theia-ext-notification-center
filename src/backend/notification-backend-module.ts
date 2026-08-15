import { ConnectionHandler, RpcConnectionHandler } from '@theia/core/lib/common/messaging';
import { ContainerModule } from '@theia/core/shared/inversify';
import {
    NOTIFICATION_SERVICE_PATH,
    NotificationClient,
    NotificationService
} from '../shared';
import { NotificationServiceImpl } from './notification-service';
import { NotificationStore } from './notification-store';

export default new ContainerModule(bind => {
    bind(NotificationStore).toSelf().inSingletonScope();
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
