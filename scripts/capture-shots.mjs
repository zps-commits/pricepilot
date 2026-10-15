/**
 * Captures the screenshots used in the README and the social-media pack.
 *
 * Shots are taken against a running server — the production preview, so what
 * is captured is what ships:
 *
 *   npm run build && npm run preview -- --port 5212
 *   SHOT_URL=http://localhost:5212/ npm run shots
 *
 * Every shot is a real screen. Nothing here draws or mocks an interface.
 */
import { chromium } from 'playwright';

const URL = process.env.SHOT_URL ?? 'http://localhost:4173/';
const OUT = process.env.SHOT_DIR ?? 'docs/social-media/assets';

const browser = await chromium.launch();
const taken = [];

async function shot(name, { width, height, fullPage = false, prepare }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  if (prepare) await prepare(page);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  await context.close();
  taken.push(`${OUT}/${name}.png  ${width}x${height}${fullPage ? ' (full page)' : ''}`);
}

const fill = (page, label, value) => page.getByLabel(label).fill(value);

await shot('desktop-full', { width: 1440, height: 900, fullPage: true });

await shot('desktop-result', { width: 1440, height: 900 });

await shot('desktop-discount-loss', {
  width: 1440,
  height: 900,
  async prepare(page) {
    // A discount deep enough to turn the profit negative: the single clearest
    // picture of what the tool is for.
    await page.locator('input[type=range]').fill('45');
  },
});

await shot('desktop-impossible-margin', {
  width: 1440,
  height: 900,
  async prepare(page) {
    await fill(page, 'Payment fee', '60');
    await fill(page, 'Net margin you want', '50');
  },
});

await shot('mobile-form', { width: 390, height: 844 });

await shot('mobile-result', {
  width: 390,
  height: 844,
  async prepare(page) {
    await page.getByText('Result', { exact: true }).scrollIntoViewIfNeeded();
  },
});

await shot('mobile-full', { width: 390, height: 844, fullPage: true });

/*
 * Element captures.
 *
 * A composition that crops a viewport screenshot risks cutting through a
 * label, and a panel that runs below the fold is simply not in the image.
 * Screenshotting the element itself removes both problems: the capture is
 * exactly the panel, so a layout can place it without any crop arithmetic.
 */
async function element(name, selector, { width = 1440, height = 900, prepare } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  if (prepare) await prepare(page);
  await page.waitForTimeout(150);
  await page.locator(selector).first().screenshot({ path: `${OUT}/${name}.png` });
  await context.close();
  taken.push(`${OUT}/${name}.png  element: ${selector}`);
}

await element('panel-result', 'section.panel-deep');

await element('panel-discount', 'section.panel:has(input[type=range])', {
  async prepare(page) {
    await page.locator('input[type=range]').fill('45');
  },
});

await element('panel-scenarios', 'section.panel:has(table)');

await browser.close();
console.log(taken.join('\n'));
