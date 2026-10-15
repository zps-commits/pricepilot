# Canva build spec — PricePilot carousel

There is no Canva connection in this environment, so the carousel was
rendered directly (`npm run social` → `composed/`). Those five PNGs are
postable as they are.

This file is what Canva needs to rebuild them as an **editable** file, which
is what the brief asks for. Everything below is measured from the running
application, not invented.

## Document

- Five pages, **1080 × 1350 px** (4:5).
- Page margin: **84 px** on every side.

## Colours

Taken from `src/index.css`. Every pair was checked against WCAG 2.1 AA
before use; the worst is 5.08 against a 4.5 requirement.

| Role | Hex | Used for |
|---|---|---|
| Paper | `#eceff0` | Page background on slides 1, 2, 3, 5 |
| Surface | `#ffffff` | Cards inside slide 2 |
| Ink | `#15201f` | Headings, body, and the background of slide 4 |
| Muted | `#4d5a58` | Secondary paragraphs |
| Line | `#dde3e2` | Hairlines |
| Accent | `#0b5349` | Eyebrows, figures, links — the one accent |
| Accent bright | `#8ee0cd` | The figure on a deep field |

**One accent, in weights.** Do not add a second hue. Slide 4 is the inverse
of the others, not a different palette.

## Type

- Everything: **Geist** (400/500/600).
- Eyebrows, figures, links, code: **Geist Mono**.

| Element | Size | Line height |
|---|---|---|
| Eyebrow | 20 px, 500, uppercase, letter-spacing 0.14em | — |
| h1 (slide 1) | 86 px, 600 | 0.96 |
| h2 (slides 2–5) | 64 px, 600 | 1.04 |
| Lede | 34 px | 1.32 |
| Body | 26–30 px | 1.3–1.44 |
| Footer | 20 px mono | — |

## Pages

### 1 — Presentation
Two columns, vertically centred. Left: eyebrow "PRICING TOOL", h1
"PricePilot", lede "What to charge, once the fees have come off the price.",
then `pricepilot-eta.vercel.app` in accent mono.
Right: `assets/mobile-form.png` at 392 px wide, 14 px radius, 1 px border.

### 2 — Problem
h2 "Two numbers that are not the same kind". Two stacked white cards, 14 px
radius:
- "A COST" — an amount per unit…
- "A RATE" — a percentage **of the sale price**…

Closing paragraph in muted: a rate cannot be added to the cost before the
price is known, because it is a percentage of the answer.

### 3 — Solution
h2 "Four questions, answered as you type". Two columns: a numbered list
01–04 on the left with hairline dividers, and `assets/panel-discount.png`
at 440 px on the right, placed **whole**. Caption under the list quotes the
figures visible in that capture.

### 4 — Technology
Ink background. h2 "React 19 · TypeScript / Vite · Tailwind v4", two
paragraphs, and a code block at the foot (`#202326` fill, `#2d3134` rule).
The challenge named is the real one: the scaffold shipped with TypeScript
strict turned off.

### 5 — Result
h2 "Built, verified, and live", then a four-row table:

| 77 passing · clean · 0 violations · 1440 · 768 · 390 · 320 |

Then the honesty paragraph, then the links.

## Rules for whoever rebuilds this

- Place the screenshots **whole**. Do not crop one so a label is cut, and do
  not scale one past the frame so it bleeds — both were tried and both read
  as a mistake.
- Do not retouch a figure in a capture. If a number is wrong, fix the
  application and re-run `npm run shots`.
- No gradients, no glow, no futurism, no generic template look.
- The GitHub line on slide 5 is a placeholder until the repository exists.
  Do not publish a link that 404s.
