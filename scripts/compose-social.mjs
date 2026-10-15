/**
 * Builds the social-media images.
 *
 * The brief for this step names an AI image tool, and its hardest rule is
 * that the content of a real screenshot must survive untouched: no altered
 * text, numbers, features or buttons. No generative model can promise that —
 * it redraws what it is shown. The brief's own fallback is to keep the
 * capture intact and compose around it, which is what this does: real
 * screenshots placed, never regenerated, inside a layout rendered by the
 * browser.
 *
 *   npm run social
 *
 * Output: docs/social-media/composed/*.png at 1080x1350 (4:5).
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = 'docs/social-media/composed';
const SHOTS = '../assets';

/* The application's own tokens. A post that looks like the product is the
   point; a second palette would just be decoration. */
const T = {
  paper: '#f5f5f4',
  surface: '#ffffff',
  line: '#e3e3e0',
  ink: '#17191b',
  muted: '#55595f',
  accent: '#0e564f',
  accentSoft: '#e7efed',
};

const FONT = `
  @font-face {
    font-family: 'Geist';
    src: url('../../../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2') format('woff2');
    font-weight: 100 900;
  }
  @font-face {
    font-family: 'Geist Mono';
    src: url('../../../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2') format('woff2');
    font-weight: 100 900;
  }
`;

const BASE = `
  ${FONT}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px; height: 1350px; overflow: hidden;
    font-family: 'Geist', system-ui, sans-serif;
    background: ${T.paper}; color: ${T.ink};
    -webkit-font-smoothing: antialiased;
  }
  .frame { width: 1080px; height: 1350px; position: relative; display: flex; flex-direction: column; }
  .pad { padding: 84px 84px 0; }
  .eyebrow {
    font-family: 'Geist Mono', monospace; font-size: 20px; letter-spacing: .14em;
    text-transform: uppercase; color: ${T.muted};
  }
  h1 { font-size: 104px; line-height: .96; letter-spacing: -.035em; font-weight: 600; }
  h2 { font-size: 64px; line-height: 1.04; letter-spacing: -.03em; font-weight: 600; }
  .lede { font-size: 34px; line-height: 1.32; color: ${T.muted}; max-width: 17ch; }
  .rule { height: 1px; background: ${T.line}; }
  /* A real capture sits in a plain frame. Never cropped in a way that hides
     what it says, never rotated, never recoloured. */
  .shot { display: block; width: 100%; border: 1px solid ${T.line}; border-radius: 14px; background: ${T.surface}; }
  .shot-wrap { border-radius: 14px; overflow: hidden; box-shadow: 0 30px 70px -40px rgba(23,25,27,.45); }
  .foot {
    margin-top: auto; padding: 0 84px 76px; display: flex; justify-content: space-between;
    align-items: baseline; font-family: 'Geist Mono', monospace; font-size: 20px; color: ${T.muted};
  }
  .accent { color: ${T.accent}; }
`;

/*
 * The five slides the brief lays out: presentation, problem, solution with
 * real screenshots, technology, result.
 *
 * One rule across all of them: the screen appears WHOLE. Nothing bleeds off
 * an edge, nothing is cropped. A giant fragment of interface reads as a
 * mistake; the product shown small and complete reads as the product.
 */
const SLIDES = [
  {
    name: '1-presentation',
    html: `
      <div class="frame" style="flex-direction:row; align-items:center; gap:56px; padding:0 84px">
        <div style="flex:1 1 0; min-width:0">
          <div class="eyebrow">Pricing tool</div>
          <h1 style="margin-top:22px; font-size:86px">PricePilot</h1>
          <p class="lede" style="margin-top:28px; max-width:16ch">
            What to charge, once the fees have come off the price.
          </p>
          <div style="margin-top:40px; font-family:'Geist Mono',monospace; font-size:20px; color:${T.accent}">
            pricepilot-eta.vercel.app
          </div>
        </div>
        <div class="shot-wrap" style="flex:0 0 392px">
          <img class="shot" src="${SHOTS}/mobile-form.png" alt="">
        </div>
      </div>`,
  },
  {
    name: '2-problem',
    html: `
      <div class="frame" style="justify-content:center; padding:0 84px">
        <div class="eyebrow">The problem</div>
        <h2 style="margin-top:22px; max-width:15ch">Two numbers that are not the same kind</h2>

        <div style="margin-top:52px; display:grid; gap:24px">
          <div style="background:${T.surface}; border:1px solid ${T.line}; border-radius:14px; padding:34px 38px">
            <div class="eyebrow" style="color:${T.accent}">A cost</div>
            <p style="margin-top:12px; font-size:30px; line-height:1.34">
              An amount per unit. Ingredients, materials, the share of the
              rent this sale has to carry.
            </p>
          </div>
          <div style="background:${T.surface}; border:1px solid ${T.line}; border-radius:14px; padding:34px 38px">
            <div class="eyebrow" style="color:${T.accent}">A rate</div>
            <p style="margin-top:12px; font-size:30px; line-height:1.34">
              A percentage <strong>of the sale price</strong>. The card fee,
              the marketplace commission, a tax on revenue.
            </p>
          </div>
        </div>

        <p style="margin-top:44px; font-size:28px; line-height:1.4; color:${T.muted}; max-width:34ch">
          A rate cannot be added to the cost before the price is known,
          because it is a percentage of the answer.
        </p>
      </div>`,
  },
  {
    name: '3-solution',
    html: `
      <div class="frame">
        <div class="pad">
          <div class="eyebrow">The solution</div>
          <h2 style="margin-top:22px">Four questions,<br>answered as you type</h2>
        </div>
        <div style="flex:1; display:flex; gap:44px; padding:40px 84px 84px; align-items:center">
          <div style="flex:1 1 0; min-width:0">
            ${[
              ['01', 'The price that delivers the margin you want'],
              ['02', 'The price below which you are paying to sell'],
              ['03', 'What a discount does to the profit'],
              ['04', 'The same costs at three different margins'],
            ]
              .map(
                ([n, text]) => `
              <div style="display:flex; gap:22px; padding:28px 0; border-bottom:1px solid ${T.line}">
                <span style="font-family:'Geist Mono',monospace; font-size:20px; color:${T.accent}; padding-top:5px">${n}</span>
                <span style="font-size:29px; line-height:1.3">${text}</span>
              </div>`,
              )
              .join('')}
            <p style="margin-top:34px; font-size:24px; line-height:1.44; color:${T.muted}">
              At 45% off, an R$&nbsp;18,00 profit becomes an R$&nbsp;3,60 loss.
            </p>
          </div>
          <div class="shot-wrap" style="flex:0 0 440px">
            <img class="shot" src="${SHOTS}/panel-discount.png" alt="">
          </div>
        </div>
      </div>`,
  },
  {
    name: '4-technology',
    html: `
      <div class="frame" style="background:${T.ink}; color:${T.paper}">
        <div class="pad">
          <div class="eyebrow" style="color:#9aa0a6">The build</div>
          <h2 style="margin-top:22px; color:${T.paper}">React 19 · TypeScript<br>Vite · Tailwind v4</h2>
          <p style="margin-top:30px; font-size:26px; line-height:1.44; color:#b9bec4; max-width:34ch">
            Money as integer cents, end to end. The engine is pure: input in,
            result or <span style="font-family:'Geist Mono',monospace">null</span> out.
            No React inside it, no formatting, no exceptions.
          </p>
          <p style="margin-top:26px; font-size:26px; line-height:1.44; color:#b9bec4; max-width:34ch">
            <strong style="color:${T.paper}">The challenge actually faced:</strong>
            the scaffold shipped with TypeScript strict turned off. The whole
            engine was written under a compiler that was barely checking.
            Turning it on surfaced real errors.
          </p>
        </div>
        <div style="margin-top:auto; padding:0 84px">
          <div style="background:#202326; border:1px solid #2d3134; border-radius:14px; padding:34px 40px">
            <pre style="font-family:'Geist Mono',monospace; font-size:22px; line-height:1.66; color:#d7dadd; white-space:pre"><span style="color:#7e868d">// Prices round up. Rounding down returns a price</span>
<span style="color:#7e868d">// that delivers less margin than the one asked for.</span>
suggestedPrice: ceilToCent(C / (<span style="color:#c9a227">1</span> - t - m))</pre>
          </div>
        </div>
        <div class="foot" style="color:#8b9197">
          <span>Business rules outside the components</span>
        </div>
      </div>`,
  },
  {
    name: '5-result',
    html: `
      <div class="frame">
        <div class="pad">
          <div class="eyebrow">The result</div>
          <h2 style="margin-top:22px">Built, verified,<br>and live</h2>
        </div>
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding:0 84px">
          <dl style="border-top:1px solid ${T.line}">
            ${[
              ['Unit and component tests', '77 passing'],
              ['TypeScript strict, lint, build', 'clean'],
              ['axe-core, WCAG 2.1 A + AA', '0 violations'],
              ['Widths checked', '1440 · 768 · 390 · 320'],
            ]
              .map(
                ([k, v]) => `
              <div style="display:flex; justify-content:space-between; gap:24px; padding:26px 0; border-bottom:1px solid ${T.line}">
                <dt style="font-size:27px; color:${T.muted}">${k}</dt>
                <dd style="font-family:'Geist Mono',monospace; font-size:27px; color:${T.accent}">${v}</dd>
              </div>`,
              )
              .join('')}
          </dl>
          <p style="margin-top:34px; font-size:23px; line-height:1.45; color:${T.muted}; max-width:40ch">
            A demonstration tool. It does not model any specific tax regime
            and does not replace accounting advice. No users, no clients, no
            revenue — the figures above are verification results.
          </p>
        </div>
        <div class="foot">
          <span class="accent" style="font-family:'Geist Mono',monospace">pricepilot-eta.vercel.app</span>
          <span style="font-family:'Geist Mono',monospace">[GitHub URL pending]</span>
        </div>
      </div>`,
  },
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
const made = [];

for (const slide of SLIDES) {
  const file = `${OUT}/${slide.name}.html`;
  await writeFile(file, `<meta charset="utf-8"><style>${BASE}</style>${slide.html}`);
  await page.goto(`file://${process.cwd()}/${file}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${OUT}/${slide.name}.png` });
  await rm(file);
  made.push(`${OUT}/${slide.name}.png`);
}

await browser.close();
console.log(made.join('\n'));
