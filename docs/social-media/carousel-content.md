# Carousel — five slides

> **Before publishing:** the deployment is live at https://pricepilot-eta.vercel.app.
> The GitHub URL on slide 5 is still a placeholder — the repository has not
> been created yet.

The finished slides are in `composed/`, rendered by `npm run social` at
1080 × 1350 (4:5). To rebuild them as an editable Canva file, see
`canva-spec.md`.

The five pages follow the brief: presentation, problem, solution with real
screenshots, technology, result. Light background, one accent, figures in a
mono face, matching the application. No stock photography and no screenshot
of an interface that does not exist.

---

## Slide 1 — the hook

**Headline**
Your price is not your cost plus the fee.

**Body**
A marketplace commission is a percentage of the price, not of the cost. You
cannot add it before you know the answer.

**Visual**
Plain type on the light ground. No image.

---

## Slide 2 — the problem

**Headline**
Two things that are not the same

**Body**
**Cost** — an amount per unit. Ingredients, materials, the share of rent this
sale carries.

**Rate** — a percentage of the sale price. Card fee, commission, tax on
revenue.

Mark up by a round number and you never learn where the floor is.

**Visual**
Two stacked blocks, one per definition.

---

## Slide 3 — the solution

**Headline**
One screen, recalculating as you type

**Body**
The price that delivers the margin you asked for. The price below which you
are paying to make the sale. What is left after the rates take their share.

**Visual**
`assets/desktop-result.png`

---

## Slide 4 — the discount

**Headline**
"Can I take 45% off?"

**Body**
Not on these numbers. At 45% off, a R$ 18,00 profit becomes a R$ 3,60 loss.
The slider says so while you are still deciding.

**Visual**
`assets/desktop-discount-loss.png`

> The figures above are read off that screenshot. If the defaults change,
> re-read them rather than keeping these numbers.

---

## Slide 5 — the build and the close

**Headline**
Built and verified

**Body**
React 19 · TypeScript strict · Vite · Tailwind CSS v4
Money as integer cents. Prices round up, never down.
77 tests. Zero axe-core violations at four screen widths.

Try it: https://pricepilot-eta.vercel.app
Code: https://github.com/zps-commits/pricepilot

**Visual**
Plain type. No logo wall, no badge row.

---

## Rules for whoever builds this

- Every figure on these slides comes from the committed screenshots or the
  verification run. Do not add one that does not.
- No users, no clients, no revenue, no commercial results. There are none.
- No screenshot that was not captured from the running application.
- Keep the accent colour of the app rather than introducing a second one.
