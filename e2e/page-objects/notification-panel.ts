import { TheiaApp, TheiaView } from '@theia/playwright';
import { Locator } from '@playwright/test';

export class NotificationPanel extends TheiaView {
    constructor(app: TheiaApp) {
        super({
            tabSelector: '#shell-tab-notification-center-panel',
            viewSelector: '#notification-center-panel',
            viewName: 'Notifications'
        }, app);
    }

    items(): Locator {
        return this.page.locator('#notification-center-panel .notification-center-panel-item');
    }

    item(severity: string): Locator {
        return this.page.locator(`#notification-center-panel .notification-center-panel-item[data-severity="${severity}"]`);
    }

    async itemCount(): Promise<number> {
        await this.activate();
        return this.items().count();
    }

    async waitForItem(severity: string): Promise<void> {
        await this.activate();
        await this.item(severity).first().waitFor({ state: 'visible' });
    }

    async setFilter(severity: string, checked: boolean): Promise<void> {
        await this.activate();
        const checkbox = this.page.locator(
            `#notification-center-panel .notification-center-panel-filter input[data-severity="${severity}"]`
        );
        if (await checkbox.isChecked() !== checked) {
            await checkbox.click();
        }
    }

    async clearAll(): Promise<void> {
        await this.activate();
        await this.page.locator('#notification-center-panel .notification-center-panel-clear').click();
    }

    async expandItem(severity: string): Promise<void> {
        await this.activate();
        await this.item(severity).first().click();
    }

    async clickAction(severity: string, actionId: string): Promise<void> {
        await this.expandItem(severity);
        await this.item(severity).first().locator(`[data-action-id="${actionId}"]`).click();
    }
}
