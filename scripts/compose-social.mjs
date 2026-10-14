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

const SLIDES = [
  {
    name: '1-cover',
    html: `
      <div class="frame">
        <div class="pad">
          <div class="eyebrow">Pricing tool</div>
          <h1 style="margin-top:28px">PricePilot</h1>
          <p class="lede" style="margin-top:36px">
            What to charge, once the fees have come off the price.
          </p>
        </div>
        <!-- Bleeds off the bottom edge: a crop of the frame, not of the
             content. Everything the screen says stays legible. -->
        <div style="margin-top:72px; padding-left:84px; overflow:hidden; flex:1">
          <div class="shot-wrap" style="width:1200px">
            <img class="shot" src="${SHOTS}/desktop-result.png" alt="">
          </div>
        </div>
      </div>`,
  },
  {
    name: '2-desktop-and-mobile',
    html: `
      <div class="frame">
        <div class="pad">
          <div class="eyebrow">One screen, two widths</div>
          <h2 style="margin-top:24px">Verified at<br>1440 and 390&nbsp;px</h2>
        </div>
        <div style="position:relative; flex:1; margin-top:64px">
          <div class="shot-wrap" style="position:absolute; left:84px; top:0; width:760px">
            <img class="shot" src="${SHOTS}/desktop-result.png" alt="">
          </div>
          <div class="shot-wrap" style="position:absolute; right:60px; top:150px; width:300px">
            <img class="shot" src="${SHOTS}/mobile-form.png" alt="">
          </div>
        </div>
        <div class="foot">
          <span>0 axe-core violations</span><span class="accent">WCAG 2.1 A + AA</span>
        </div>
      </div>`,
  },
  {
    name: '3-features',
    html: `
      <div class="frame">
        <div class="pad">
          <div class="eyebrow">What it answers</div>
          <h2 style="margin-top:24px">Four questions</h2>
          <div style="margin-top:52px; display:grid; gap:0">
            ${[
              ['01', 'What should I charge to end up with the margin I want?'],
              ['02', 'What is the lowest price that does not lose money?'],
              ['03', 'What happens to the profit if I discount it?'],
              ['04', 'What would the same costs look like at another margin?'],
            ]
              .map(
                ([n, text]) => `
              <div style="display:flex; gap:28px; padding:26px 0; border-top:1px solid ${T.line}">
                <span style="font-family:'Geist Mono',monospace; font-size:22px; color:${T.accent}; padding-top:6px">${n}</span>
                <span style="font-size:30px; line-height:1.3">${text}</span>
              </div>`,
              )
              .join('')}
          </div>
        </div>
        <!--
          Cropped along the panel's own edge, never through a label. The
          slice is the result column of the real screenshot at 45% off:
          every figure in it is what the application produced.
        -->
        <div style="flex:1; position:relative; overflow:hidden; margin-top:40px">
          <!-- The panel captured as an element, placed whole. Nothing is
               cropped, so nothing can be cut mid-figure. -->
          <div class="shot-wrap" style="position:absolute; right:84px; bottom:52px; width:430px">
            <img class="shot" src="${SHOTS}/panel-discount.png" alt="">
          </div>
          <div style="position:absolute; left:84px; bottom:52px; width:420px">
            <div class="eyebrow" style="color:${T.accent}">Question 03</div>
            <p style="margin-top:16px; font-size:29px; line-height:1.3; color:${T.ink}">
              At 45% off, an R$&nbsp;18,00 profit becomes an R$&nbsp;3,60 loss.
              The slider says so while you are still deciding.
            </p>
          </div>
        </div>
      </div>`,
  },
  {
    name: '4-the-rule',
    html: `
      <div class="frame" style="background:${T.ink}; color:${T.paper}">
        <div class="pad">
          <div class="eyebrow" style="color:#9aa0a6">The decision that matters</div>
          <h2 style="margin-top:28px; color:${T.paper}; max-width:14ch">
            Prices round <span style="color:#79c8bb">up</span>. Never down.
          </h2>
          <p style="margin-top:40px; font-size:30px; line-height:1.4; color:#b9bec4; max-width:24ch">
            Rounding down returns a price that delivers less margin than the
            one you asked for. That is the single direction a pricing tool
            must not err in.
          </p>
        </div>
        <div style="flex:1; display:flex; align-items:center; flex-direction:column; justify-content:center">
        <!-- Verbatim from src/domain/pricing.ts, only re-wrapped to fit.
             Not a mock-up and not a simplified stand-in. -->
        <div style="margin:0 84px; align-self:stretch; background:#202326; border:1px solid #2d3134; border-radius:14px; padding:40px 44px">
          <pre style="font-family:'Geist Mono',monospace; font-size:23px; line-height:1.66; color:#d7dadd; white-space:pre"><span style="color:#79c8bb">function</span> ceilToCent(value: <span style="color:#79c8bb">number</span>): Cents {
  <span style="color:#79c8bb">if</span> (!Number.isFinite(value) || value &lt;= <span style="color:#c9a227">0</span>) <span style="color:#79c8bb">return</span> <span style="color:#c9a227">0</span>;
  <span style="color:#7e868d">// A float like 2399.9999999997 is 2400 in</span>
  <span style="color:#7e868d">// intent; nudge before ceiling so binary</span>
  <span style="color:#7e868d">// representation does not add a spurious cent.</span>
  <span style="color:#79c8bb">const</span> corrected = Math.round(value * <span style="color:#c9a227">1e6</span>) / <span style="color:#c9a227">1e6</span>;
  <span style="color:#79c8bb">return</span> Math.ceil(corrected);
}</pre>
        </div>
        </div>
        <div class="foot" style="color:#8b9197">
          <span>Money as integer cents</span><span style="color:#79c8bb">pricepilot-eta.vercel.app</span>
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
