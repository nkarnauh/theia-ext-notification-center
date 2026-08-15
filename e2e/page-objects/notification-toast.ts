import { TheiaPageObject } from '@theia/playwright';
import { expect, Locator } from '@playwright/test';

export class NotificationToast extends TheiaPageObject {
    locator(severity?: string): Locator {
        if (severity) {
            return this.page.locator(`.notification-center-toast[data-severity="${severity}"]`);
        }
        return this.page.locator('.notification-center-toast');
    }

    async waitForVisible(severity?: string): Promise<void> {
        await this.locator(severity).first().waitFor({ state: 'visible' });
    }

    async waitForHidden(severity?: string): Promise<void> {
        await expect(this.locator(severity)).toHaveCount(0, { timeout: 8_000 });
    }

    async isVisible(severity?: string): Promise<boolean> {
        return this.locator(severity).first().isVisible();
    }

    async clickAction(actionId: string, severity?: string): Promise<void> {
        await this.locator(severity).first().locator(`[data-action-id="${actionId}"]`).click();
    }

    async close(severity?: string): Promise<void> {
        await this.locator(severity).first().locator('.notification-center-toast-close').click();
    }

    async dismissAll(): Promise<void> {
        const closeButtons = this.page.locator('.notification-center-toast-close');
        while (await closeButtons.count() > 0) {
            await closeButtons.first().click();
        }
    }
}
