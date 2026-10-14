/**
 * Browser verification for the interface.
 *
 * Unit tests cover the arithmetic; this covers what only a real browser can
 * answer: whether the page overflows, whether axe finds a barrier, whether
 * typing actually moves the number. Run it against a server that is already
 * up:
 *
 *   npm run dev -- --port 5211
 *   VERIFY_URL=http://localhost:5211/ npm run verify:ui
 *
 * Exits non-zero on any failure, so it can gate a release.
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const URL = process.env.VERIFY_URL ?? 'http://localhost:5173/';
const SHOTS = process.env.VERIFY_SHOTS ?? null;

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'narrow', width: 320, height: 720 },
];

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const log = [];
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

if (SHOTS) await mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch();

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();

  const noise = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      noise.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => noise.push(`pageerror: ${error.message}`));

  await page.goto(URL, { waitUntil: 'networkidle' });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(overflow <= 0, `${viewport.name}: ${overflow}px of horizontal overflow`);
  check(noise.length === 0, `${viewport.name} console: ${noise.join(' | ')}`);

  const axe = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  for (const violation of axe.violations) {
    failures.push(
      `${viewport.name} axe ${violation.id} (${violation.impact}): ${violation.nodes
        .map((node) => node.target.join(' '))
        .join(', ')}`,
    );
  }

  log.push(
    `${viewport.name.padEnd(8)} ${String(viewport.width).padStart(4)}px  overflow=${overflow}px  console=${noise.length}  axe=${axe.violations.length}`,
  );

  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${viewport.name}.png`, fullPage: true });
  await context.close();
}

/* Behaviour, once, at desktop width. */
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });

const price = () => page.getByTestId('suggested-price').innerText();
const variableCost = page.getByLabel('Variable cost');

const atRest = (await price()).trim();
await variableCost.fill('40.00');
await page.waitForTimeout(100);
const afterChange = (await price()).trim();
check(atRest !== afterChange, 'the price did not react to a change in cost');
log.push(`price ${atRest} -> ${afterChange} after the variable cost doubled`);

/* An unsolvable margin must be explained, not silently blanked. */
await page.getByLabel('Payment fee').fill('60');
await page.getByLabel('Net margin you want').fill('50');
await page.waitForTimeout(100);
const explanation = await page.getByTestId('engine-problem').innerText();
check(/leaves nothing|no price covers/.test(explanation), 'an impossible margin was not explained');
log.push(`impossible margin: "${explanation.slice(0, 60)}..."`);

/* A negative cost is caught per field, before any arithmetic. */
await page.getByLabel('Payment fee').fill('3');
await page.getByLabel('Net margin you want').fill('30');
await variableCost.fill('-5');
await page.waitForTimeout(100);
check(
  (await variableCost.getAttribute('aria-invalid')) === 'true',
  'a negative cost was not flagged',
);

/* Both decimal separators, because the same person types both. */
await variableCost.fill('20,50');
await page.waitForTimeout(100);
check(
  (await variableCost.getAttribute('aria-invalid')) !== 'true',
  'a comma decimal separator was rejected',
);
log.push(`comma separator accepted: ${(await price()).trim()}`);

/* The discount slider moves the final price and reports the outcome. */
await variableCost.fill('20.00');
await page.waitForTimeout(100);
const slider = page.getByRole('slider', { name: 'Discount' });
await slider.fill('40');
await page.waitForTimeout(100);
const outcome = await page.getByTestId('discount-outcome').innerText();
check(/loses money/.test(outcome), `a 40% discount was not reported as a loss, got "${outcome}"`);
await slider.fill('0');
await page.waitForTimeout(100);
log.push(`discount 40%: "${outcome}"`);

/* Three scenarios, each with its own price. */
const prices = await page.locator('table tbody tr td:nth-child(3)').allInnerTexts();
check(prices.length === 3, `expected 3 scenarios, found ${prices.length}`);
check(new Set(prices).size === 3, `scenarios share a price: ${prices.join(', ')}`);
log.push(`scenarios: ${prices.join('  ')}`);

/* Switching currency relabels. It must never change the amount. */
await variableCost.fill('20.00');
await page.waitForTimeout(100);
const inBrl = (await price()).trim();
await page.getByRole('button', { name: '$ USD' }).click();
await page.waitForTimeout(100);
const inUsd = (await price()).trim();
check(
  inBrl.replace(/\D/g, '') === inUsd.replace(/\D/g, ''),
  `switching currency changed the amount: ${inBrl} -> ${inUsd}`,
);
log.push(`currency relabels only: ${inBrl} / ${inUsd}`);

await context.close();

/* The mobile price bar must clear a focused field. */
const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
const phonePage = await phone.newPage();
await phonePage.goto(URL, { waitUntil: 'networkidle' });
const bar = phonePage.locator('.price-bar');
check(await bar.isVisible(), 'the mobile price bar is missing at rest');
await phonePage.getByLabel('Variable cost').focus();
await phonePage.waitForTimeout(80);
check(!(await bar.isVisible()), 'the mobile price bar stayed over a focused field');
log.push('mobile price bar: shown at rest, hidden while a field is focused');
await phone.close();

await browser.close();

console.log(log.join('\n'));
console.log(failures.length ? `\nFAILED\n${failures.join('\n')}` : '\nPASSED');
process.exit(failures.length ? 1 : 0);
