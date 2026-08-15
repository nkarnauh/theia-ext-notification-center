import { Disposable, DisposableCollection } from '@theia/core';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { createRoot, Root } from '@theia/core/shared/react-dom/client';
import { inject, injectable } from '@theia/core/shared/inversify';
import { Notification, NotificationService } from '../shared';
import { NotificationClientImpl } from './notification-client';
import { NotificationToastOverlay } from './notification-toast-overlay';

@injectable()
export class NotificationToastService implements FrontendApplicationContribution, Disposable {
    @inject(NotificationClientImpl)
    protected readonly client!: NotificationClientImpl;

    @inject(NotificationService)
    protected readonly notificationService!: NotificationService;

    protected readonly toDispose = new DisposableCollection();
    protected host: HTMLElement | undefined;
    protected root: Root | undefined;
    protected toasts: Notification[] = [];

    onStart(): void {
        this.host = document.createElement('div');
        document.body.appendChild(this.host);
        this.root = createRoot(this.host);
        this.render();
        this.toDispose.push(this.client.onDidReceiveNotification(notification => this.show(notification)));
        this.toDispose.push(Disposable.create(() => {
            this.root?.unmount();
            this.root = undefined;
            this.host?.remove();
            this.host = undefined;
            this.toasts = [];
        }));
    }

    onStop(): void {
        this.dispose();
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    protected show(notification: Notification): void {
        this.toasts = [...this.toasts.filter(item => item.id !== notification.id), notification];
        this.render();
    }

    protected hide = (id: string): void => {
        this.toasts = this.toasts.filter(item => item.id !== id);
        this.render();
    };

    protected handleAction = (notificationId: string, actionId: string): void => {
        void this.notificationService.actionInvoked(notificationId, actionId);
        this.hide(notificationId);
    };

    protected render(): void {
        this.root?.render(
            <NotificationToastOverlay
                notifications={this.toasts}
                onAction={this.handleAction}
                onClose={this.hide}
            />
        );
    }
}
