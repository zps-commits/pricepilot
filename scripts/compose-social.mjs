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
 * One rule across every slide: the screen appears WHOLE. Nothing bleeds off
 * an edge, nothing is cropped. A giant fragment of interface reads as a
 * mistake; the product shown small and complete reads as the product.
 */
const SLIDES = [
  {
    name: '1-cover',
    html: `
      <!--
        A desktop capture is wide and short and can never fill a 4:5 frame
        without being cropped. The phone screen is tall, so it fills the
        height on its own and the text sits beside it. No dead zone, and
        nothing cut.
      -->
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
    name: '2-desktop-and-mobile',
    html: `
      <div class="frame">
        <div class="pad">
          <div class="eyebrow">One screen, every width</div>
          <h2 style="margin-top:22px">Verified at 1440,<br>768, 390 and 320&nbsp;px</h2>
        </div>
        <!-- Centred in the space left over, rather than pushed to the
             bottom: pushing collects all the air in one place. -->
        <div style="flex:1; padding:0 84px; display:flex; align-items:center; gap:30px">
          <div class="shot-wrap" style="flex:1 1 auto">
            <img class="shot" src="${SHOTS}/desktop-result.png" alt="">
          </div>
          <div class="shot-wrap" style="flex:0 0 232px">
            <img class="shot" src="${SHOTS}/mobile-form.png" alt="">
          </div>
        </div>
        <div class="foot" style="margin-top:0; padding-top:0">
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
          <h2 style="margin-top:22px">Four questions</h2>
        </div>
        <!-- Two columns, so neither the list nor the panel leaves a hole. -->
        <div style="flex:1; display:flex; gap:48px; padding:40px 84px 84px; align-items:center">
          <div style="flex:1 1 0; min-width:0">
            ${[
              ['01', 'What should I charge to end up with the margin I want?'],
              ['02', 'What is the lowest price that does not lose money?'],
              ['03', 'What happens to the profit if I discount it?'],
              ['04', 'What would the same costs look like at another margin?'],
            ]
              .map(
                ([n, text]) => `
              <div style="display:flex; gap:22px; padding:24px 0; border-bottom:1px solid ${T.line}">
                <span style="font-family:'Geist Mono',monospace; font-size:20px; color:${T.accent}; padding-top:5px">${n}</span>
                <span style="font-size:29px; line-height:1.3">${text}</span>
              </div>`,
              )
              .join('')}
            <p style="margin-top:36px; font-size:25px; line-height:1.44; color:${T.muted}">
              At 45% off, an R$&nbsp;18,00 profit becomes an R$&nbsp;3,60 loss.
              The slider says so while you are still deciding.
            </p>
          </div>
          <div class="shot-wrap" style="flex:0 0 440px">
            <img class="shot" src="${SHOTS}/panel-discount.png" alt="">
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
          <h2 style="margin-top:24px; color:${T.paper}; max-width:14ch">
            Prices round <span style="color:#79c8bb">up</span>. Never down.
          </h2>
          <p style="margin-top:34px; font-size:28px; line-height:1.42; color:#b9bec4; max-width:30ch">
            Rounding down returns a price that delivers less margin than the
            one you asked for. That is the single direction a pricing tool
            must not err in.
          </p>
        </div>
        <div style="margin-top:auto; padding:0 84px">
          <!-- Verbatim from src/domain/pricing.ts, only re-wrapped to fit. -->
          <div style="background:#202326; border:1px solid #2d3134; border-radius:14px; padding:38px 42px">
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
