import { expect, test } from '@playwright/test';
import { TheiaApp, TheiaAppLoader } from '@theia/playwright';
import { NotificationPanel } from './page-objects/notification-panel';
import { NotificationToast } from './page-objects/notification-toast';

let app: TheiaApp;
let toast: NotificationToast;
let panel: NotificationPanel;

const openPalette = async (): Promise<void> => {
    const paletteRoot = app.page.locator(app.quickCommandPalette.selector);
    if (await paletteRoot.isVisible()) {
        return;
    }
    await app.page.locator('#theia-main-content-panel').click({ position: { x: 120, y: 120 } });
    await app.page.keyboard.press('F1');
    try {
        await paletteRoot.waitFor({ state: 'visible', timeout: 3_000 });
        return;
    } catch {
        // F1 did not open the palette; open it from the View menu instead.
    }
    const viewMenu = await app.menuBar.openMenu('View');
    await viewMenu.clickMenuItem('Command Palette...');
    await paletteRoot.waitFor({ state: 'visible' });
};

const runCommand = async (text: string): Promise<void> => {
    const palette = app.quickCommandPalette;
    const paletteRoot = app.page.locator(palette.selector);
    if (await paletteRoot.isVisible()) {
        await palette.hide();
    }
    await openPalette();
    await palette.type(text, true);
    await paletteRoot.waitFor({ state: 'hidden' });
};

const acceptWorkspaceTrust = async (): Promise<void> => {
    const dialog = app.page.locator('.workspace-trust-dialog');
    try {
        await dialog.waitFor({ state: 'visible', timeout: 1_000 });
    } catch {
        return;
    }
    await app.page.getByRole('button', { name: 'Yes, I trust the authors' }).click();
    await dialog.waitFor({ state: 'hidden' });
};

test.beforeAll(async ({ playwright, browser }) => {
    app = await TheiaAppLoader.load({ playwright, browser });
    await acceptWorkspaceTrust();
    toast = new NotificationToast(app);
    panel = await app.openView(NotificationPanel);
});

test.afterAll(async () => {
    await app.page.close();
});

test.beforeEach(async () => {
    await toast.dismissAll();
    await panel.clearAll();
    await panel.setFilter('info', true);
    await panel.setFilter('warning', true);
    await panel.setFilter('error', true);
    await expect(panel.items()).toHaveCount(0);
});

test.describe('Notification Center', () => {
    test('info toast hides after 5s and stays in the panel', async () => {
        await runCommand('Push Sample Notification');
        await toast.waitForVisible('info');
        await panel.waitForItem('info');
        await toast.waitForHidden('info');
        await expect(panel.item('info').first()).toBeVisible();
    });

    test('error toast stays until closed', async () => {
        await runCommand('Push Sample Error Notification');
        await toast.waitForVisible('error');
        await app.page.waitForTimeout(5_500);
        expect(await toast.isVisible('error')).toBe(true);
        await toast.close('error');
        await toast.waitForHidden('error');
        await expect(panel.item('error').first()).toBeVisible();
    });

    test('clicking an action closes the toast', async () => {
        await runCommand('Push Sample Notification');
        await toast.waitForVisible('info');
        await toast.clickAction('ack', 'info');
        await toast.waitForHidden('info');
        await expect(panel.item('info').first()).toBeVisible();
    });

    test('severity filter hides info rows', async () => {
        await runCommand('Push Sample Notification');
        await runCommand('Push Sample Error Notification');
        await panel.waitForItem('info');
        await panel.waitForItem('error');
        await panel.setFilter('info', false);
        await expect(panel.item('info')).toHaveCount(0);
        await expect(panel.item('error').first()).toBeVisible();
    });

    test('clear all empties the panel', async () => {
        await runCommand('Push Sample Notification');
        await panel.waitForItem('info');
        await panel.clearAll();
        await expect(panel.items()).toHaveCount(0);
    });
});
