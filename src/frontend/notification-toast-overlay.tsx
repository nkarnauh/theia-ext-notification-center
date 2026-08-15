import { useEffect, type FC } from '@theia/core/shared/react';
import { Notification } from '../shared';

export const TOAST_AUTO_HIDE_MS = 5_000;

export interface NotificationToastOverlayProps {
    notifications: Notification[];
    onAction: (notificationId: string, actionId: string) => void;
    onClose: (id: string) => void;
}

export const NotificationToastOverlay: FC<NotificationToastOverlayProps> = ({ notifications, onAction, onClose }) => (
    <div className="notification-center-toasts">
        {notifications.map(notification =>
            <NotificationToast
                key={notification.id}
                notification={notification}
                onAction={onAction}
                onClose={onClose}
            />
        )}
    </div>
);

interface NotificationToastProps {
    notification: Notification;
    onAction: (notificationId: string, actionId: string) => void;
    onClose: (id: string) => void;
}

const NotificationToast: FC<NotificationToastProps> = ({ notification, onAction, onClose }) => {
    useEffect(() => {
        if (notification.severity === 'error') {
            return;
        }
        const timer = window.setTimeout(() => onClose(notification.id), TOAST_AUTO_HIDE_MS);
        return () => window.clearTimeout(timer);
    }, [notification.id, notification.severity, onClose]);

    return <div
        className={`notification-center-toast notification-center-toast-${notification.severity}`}
        data-notification-id={notification.id}
        data-severity={notification.severity}
    >
        <div className="notification-center-toast-body">
            <div className="notification-center-toast-title">{notification.title}</div>
            <div className="notification-center-toast-message">{notification.message}</div>
            {notification.actions?.length
                ? <div className="notification-center-toast-actions">
                    {notification.actions.map(action =>
                        <button
                            key={action.id}
                            type="button"
                            className="notification-center-toast-action"
                            data-action-id={action.id}
                            onClick={() => onAction(notification.id, action.id)}
                        >
                            {action.label}
                        </button>
                    )}
                </div>
                : undefined}
        </div>
        <button
            type="button"
            className="notification-center-toast-close"
            aria-label="Close"
            onClick={() => onClose(notification.id)}
        >
            ×
        </button>
    </div>;
};
