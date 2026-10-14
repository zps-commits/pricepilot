# Visual assets

Every file in `assets/` was captured from the running application — the
production preview, not the dev server, so what is shown is what ships.
Captured on 2026-10-14 at a device scale factor of 2.

The same screens are live at https://pricepilot-eta.vercel.app.

Re-capture them with:

```bash
npm run build && npm run preview -- --port 5212
SHOT_URL=http://localhost:5212/ npm run shots
```

The capture script is `scripts/capture-shots.mjs`. Nothing in this folder is
drawn, mocked or edited.

## What is here

| File | Size | Shows | Good for |
|---|---|---|---|
| `desktop-full.png` | 1440 wide, full page | The whole tool in one image: form, result, discount, scenarios, history | README hero, a wide post |
| `desktop-result.png` | 1440 × 900 | The form and the result panel above the fold | Carousel slide 3, LinkedIn main image |
| `desktop-discount-loss.png` | 1440 × 900 | A 45% discount turning an R$ 18,00 profit into a R$ 3,60 loss | Carousel slide 4 — the clearest single picture of what the tool is for |
| `desktop-impossible-margin.png` | 1440 × 900 | The explanation shown when rates plus margin leave nothing for cost | Showing that unsolvable input is handled, not blanked |
| `mobile-form.png` | 390 × 844 | The form on a phone, with the price bar pinned at the bottom | Proving the mobile layout |
| `mobile-result.png` | 390 × 844 | The result panel on a phone | A second mobile frame |
| `mobile-full.png` | 390 × 844, full page | The entire page at phone width | Showing the whole flow in one tall image |

## Still missing

- **An Open Graph image** (1200 × 630). Needs to be composed, not captured.
- **A square crop** (1080 × 1080) for feeds that prefer it. Crop from
  `desktop-result.png` rather than re-shooting.
- **A short screen recording** of the discount slider moving. Motion shows
  the live recalculation better than any still, and the capture script does
  not record video yet.

## Rules

- Do not retouch a figure in a screenshot. If a number is wrong, fix the
  application and re-capture.
- Do not compose a screenshot of a feature that is not built.
- The screenshots show the default worked example, which is deliberately
  round and obviously illustrative. It is not a real business.
