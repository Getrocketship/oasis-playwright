// tests/oasisanswers.spec.js
import { test, expect } from '@playwright/test';

// Small helper to attach a full-page screenshot to the report
async function shot(page, name) {
  const png = await page.screenshot({ fullPage: true });
  await test.info().attach(name, { body: png, contentType: 'image/png' });
}

// ------------------ Test 1 ------------------
test('Oasis Answers site is reachable', async ({ page }) => {
  const response = await page.goto('https://oasisanswers.com', { waitUntil: 'domcontentloaded' });
  await shot(page, 'before');

  expect(response.status(), 'Page should return a successful status').toBeGreaterThanOrEqual(200);
  expect(response.status(), 'Page should return a successful status').toBeLessThan(300);
  await expect(page).toHaveTitle(/OASIS/i);

  await shot(page, 'after');
});

// ------------------ Test 2 ------------------
test('Training Blueprint for OASIS Accuracy page is reachable', async ({ page }) => {
  const response = await page.goto('https://oasisanswers.com/training-blueprint-for-oasis-accuracy/', { waitUntil: 'domcontentloaded' });
  await shot(page, 'before');

  expect(response.status(), 'Training Blueprint page should return a successful status').toBeGreaterThanOrEqual(200);
  expect(response.status(), 'Training Blueprint page should return a successful status').toBeLessThan(300);
  await expect(page.locator('h1')).toContainText(/Blueprint for OASIS Accuracy/i);

  await shot(page, 'after');
});

// ------------------ Test 3 ------------------
test('Add to cart flow (with report screenshots)', async ({ page }) => {
  await page.goto('https://oasisanswers.com/shop/instant-oasis-answers-book/2025-instant-oasis-answers-book-preorder/', { waitUntil: 'domcontentloaded' });
  await shot(page, 'before');

  await Promise.all([
    page.waitForResponse(r => r.ok() && (r.url().includes('wc-ajax=add_to_cart') || r.url().includes('admin-ajax.php'))).catch(() => null),
    page.click('.single_add_to_cart_button'),
  ]);

  await page.waitForTimeout(1500);
  await shot(page, 'after click');

  // If the drawer isn't auto-open, click a Cart link (best-effort)
  /*await page.getByRole('link', { name: /Cart/i }).first().click().catch(() => {});
  await page.waitForTimeout(800);
  await shot(page, 'after cart open');*/

  try {
    // At least one visible item in the (now-open) mini-cart
    await expect(page.locator('.woocommerce-mini-cart .cart_item').first()).toBeVisible({ timeout: 20000 });
    await shot(page, 'after (assertion passed)');
  } catch (err) {
    // Attach one more screenshot right at failure time
    await shot(page, 'failure (assertion failed)');
    throw err;
  }
});
