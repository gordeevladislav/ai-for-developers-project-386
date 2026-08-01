const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('http://localhost:5173/bookings/new', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Book an event');

  // Select event type
  await page.click('input[placeholder="Choose an event type"]');
  await page.waitForTimeout(300);
  await page.click('div[role="option"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'v-1-eventtype.png', fullPage: true });

  // Pick a date - click day "3" (definitely within the 14-day window and not in the past)
  await page.locator('button:text-is("3")').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'v-2-date-selected.png', fullPage: true });

  const noTimesVisible = await page.locator('text=No available times for this date').count();
  console.log('No-times message count:', noTimesVisible);

  // Click first time slot button
  const timeButtons = page.locator('button', { hasText: /AM|PM/ });
  const count = await timeButtons.count();
  console.log('Available time buttons:', count);

  if (count > 0) {
    await timeButtons.first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'v-3-modal-open.png', fullPage: true });

    await page.fill('input[placeholder="Jane Doe"]', 'Test Guest');
    await page.fill('input[placeholder="jane@example.com"]', 'test@example.com');
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'v-4-form-filled.png', fullPage: true });

    await page.click('button:has-text("Confirm")');
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'v-5-after-confirm.png', fullPage: true });
  }

  console.log('CONSOLE_ERRORS:', JSON.stringify(errors));

  await browser.close();
})();
