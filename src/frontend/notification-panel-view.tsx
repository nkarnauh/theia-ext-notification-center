import { useEffect, useState, type FC } from '@theia/core/shared/react';
import { Notification, NotificationService, NotificationSeverity } from '../shared';
import { NotificationClientImpl } from './notification-client';

export const NOTIFICATION_SEVERITIES: NotificationSeverity[] = ['info', 'warning', 'error'];

export interface NotificationPanelViewProps {
    client: NotificationClientImpl;
    notificationService: NotificationService;
}

export const NotificationPanelView: FC<NotificationPanelViewProps> = ({ client, notificationService }) => {
    const [items, setItems] = useState<Notification[]>(() => client.getHistory());
    const [visibleSeverities, setVisibleSeverities] = useState<ReadonlySet<NotificationSeverity>>(
        () => new Set(NOTIFICATION_SEVERITIES)
    );
    const [expandedId, setExpandedId] = useState<string | undefined>();

    useEffect(() => {
        const toDispose = client.onDidChangeHistory(history => {
            setItems(history);
            setExpandedId(current => current && history.some(item => item.id === current) ? current : undefined);
        });
        return () => toDispose.dispose();
    }, [client]);

    const visibleItems = items.filter(item => visibleSeverities.has(item.severity)).slice().reverse();

    const toggleSeverity = (severity: NotificationSeverity): void => {
        const next = new Set(visibleSeverities);
        if (next.has(severity)) {
            next.delete(severity);
        } else {
            next.add(severity);
        }
        setVisibleSeverities(next);
    };

    const clearAll = (): void => {
        void notificationService.clearHistory().then(() => client.clearHistory());
    };

    return <div className="notification-center-panel-view">
        <div className="notification-center-panel-toolbar">
            {NOTIFICATION_SEVERITIES.map(severity =>
                <label key={severity} className="notification-center-panel-filter">
                    <input
                        type="checkbox"
                        checked={visibleSeverities.has(severity)}
                        data-severity={severity}
                        onChange={() => toggleSeverity(severity)}
                    />
                    {severity}
                </label>
            )}
            <button
                type="button"
                className="notification-center-panel-clear"
                onClick={clearAll}
            >
                Очистить все
            </button>
        </div>
        <div className="notification-center-panel-list">
            {visibleItems.length === 0
                ? <div className="notification-center-panel-empty">No notifications</div>
                : visibleItems.map(item =>
                    <NotificationPanelItem
                        key={item.id}
                        notification={item}
                        expanded={expandedId === item.id}
                        onToggleExpand={id => setExpandedId(current => current === id ? undefined : id)}
                        onAction={(notificationId, actionId) => {
                            void notificationService.actionInvoked(notificationId, actionId);
                        }}
                    />
                )}
        </div>
    </div>;
};

interface NotificationPanelItemProps {
    notification: Notification;
    expanded: boolean;
    onToggleExpand: (id: string) => void;
    onAction: (notificationId: string, actionId: string) => void;
}

const NotificationPanelItem: FC<NotificationPanelItemProps> = ({ notification, expanded, onToggleExpand, onAction }) => {
    const hasActions = Boolean(notification.actions?.length);

    return <div
        className={`notification-center-panel-item${expanded ? ' notification-center-panel-item-expanded' : ''}${hasActions ? ' notification-center-panel-item-clickable' : ''}`}
        data-notification-id={notification.id}
        data-severity={notification.severity}
        onClick={hasActions ? () => onToggleExpand(notification.id) : undefined}
    >
        <span
            className={`codicon ${severityIcon(notification.severity)} notification-center-panel-icon`}
            aria-label={notification.severity}
        />
        <div className="notification-center-panel-item-body">
            <div className="notification-center-panel-item-header">
                <span className="notification-center-panel-item-title">{notification.title}</span>
                <span className="notification-center-panel-item-time">{formatTime(notification.timestamp)}</span>
            </div>
            <div className="notification-center-panel-item-message">{notification.message}</div>
            {expanded && notification.actions?.length
                ? <div className="notification-center-panel-item-actions">
                    {notification.actions.map(action =>
                        <button
                            key={action.id}
                            type="button"
                            className="notification-center-panel-action"
                            data-action-id={action.id}
                            onClick={event => {
                                event.stopPropagation();
                                onAction(notification.id, action.id);
                            }}
                        >
                            {action.label}
                        </button>
                    )}
                </div>
                : undefined}
        </div>
    </div>;
};

const severityIcon = (severity: NotificationSeverity): string => {
    if (severity === 'warning') {
        return 'codicon-warning';
    }
    if (severity === 'error') {
        return 'codicon-error';
    }
    return 'codicon-info';
};

const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return [
        String(date.getHours()).padStart(2, '0'),
        String(date.getMinutes()).padStart(2, '0'),
        String(date.getSeconds()).padStart(2, '0')
    ].join(':');
};
