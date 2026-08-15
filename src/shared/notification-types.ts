export type NotificationSeverity = 'info' | 'warning' | 'error';

export interface NotificationAction {
    id: string;
    label: string;
}

export interface Notification {
    id: string;
    severity: NotificationSeverity;
    title: string;
    message: string;
    timestamp: number;
    actions?: NotificationAction[];
}

export interface NotificationInput {
    severity: NotificationSeverity;
    title: string;
    message: string;
    actions?: NotificationAction[];
}
