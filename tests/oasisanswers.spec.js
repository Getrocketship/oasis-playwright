// @ts-check
import { test, expect } from './fixtures';

// Small helper to attach a full-page screenshot to the report
async function shot(page, name) {
  const png = await page.screenshot({ fullPage: true });
  await test.info().attach(name, { body: png, contentType: 'image/png' });
}

// Close common cookie/consent popups if they show up
async function closeConsentIfAny(page) {
  const candidates = [
    page.getByRole('button', { name: /accept|agree|got it|allow|ok|continue|i understand/i }),
    page.locator('[aria-label="Close"]'),
    page.locator('.close, .mfp-close, .cc-dismiss, .cookie-accept, .cookie'),
    page.getByRole('link', { name: /accept|agree/i }),
  ];
  for (const btn of candidates) {
    const el = btn.first();
    if (await el.isVisible().catch(() => false)) {
      await el.click().catch(() => {});
      break;
    }
  }
}

// “Above the fold” (viewport-only) visual regression
async function atfScreenshot(page, slug) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(async () => { try { await document.fonts?.ready; } catch {} });

  await expect(page).toHaveScreenshot(`${slug}-atf.png`, {
    animations: 'disabled',
    caret: 'hide',
    scale: 'css',
    maxDiffPixelRatio: 0.199,
  });
}

// Reusable runner for simple reachability + ATF visual check
async function runPageCheck(page, { url, titleRe, slug }) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await shot(page, `${slug}-before`);

  expect(response?.status(), 'HTTP status should be >= 200').toBeGreaterThanOrEqual(200);
  expect(response?.status(), 'HTTP status should be < 300').toBeLessThan(300);
  await expect(page).toHaveTitle(titleRe);

  await closeConsentIfAny(page);
  await atfScreenshot(page, slug); // ← now correct

  await shot(page, `${slug}-after`);
}

/* ------------------------- tests ------------------------- */

// 1) Home + ATF visual
test('Oasis Answers site is reachable', async ({ page }) => {
  await runPageCheck(page, {
    url: 'https://oasisanswers.com',
    titleRe: /OASIS/i,
    slug: 'home'
  });
});

// 2) Training Blueprint page + ATF visual
test('Training Blueprint for OASIS Accuracy page is reachable', async ({ page }) => {
  await runPageCheck(page, {
    url: 'https://oasisanswers.com/training-blueprint-for-oasis-accuracy/',
    titleRe: /Blueprint for OASIS Accuracy/i,
    slug: 'blueprint'
  });
});

// 3) Add-to-cart flow (functional) — keep as-is, just adds better failure attachment
test('Add to cart flow (with report screenshots)', async ({ page }) => {
  await page.goto('https://oasisanswers.com/shop/instant-oasis-answers-book/2025-instant-oasis-answers-book-preorder/', { waitUntil: 'domcontentloaded' });
  await shot(page, 'cart-before');

  await Promise.all([
    page.waitForResponse(r =>
      r.ok() && (r.url().includes('wc-ajax=add_to_cart') || r.url().includes('admin-ajax.php'))
    ).catch(() => null),
    page.click('.single_add_to_cart_button'),
  ]);

  await page.waitForTimeout(1500);
  await shot(page, 'cart-after-click');

  try {
    await expect(
      page.locator('.woocommerce-mini-cart .cart_item').first()
    ).toBeVisible({ timeout: 20_000 });
    await shot(page, 'cart-after-assert');
  } catch (err) {
    await shot(page, 'cart-failure');
    throw err;
  }
});
