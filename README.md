# PricePilot

A pricing calculator for anyone who sells something and needs to know what to
charge once the payment fee, the marketplace commission and the rest have been
taken off the top.

It answers four questions:

- What should I charge to end up with the margin I want?
- What is the lowest price that does not lose money?
- What happens to the profit if I discount it?
- What would the same costs look like at a higher or lower margin?

## The arithmetic

Costs and rates are not the same kind of number, and conflating them is the
mistake this tool exists to avoid. A cost is an amount per unit. A rate is a
percentage **of the sale price**, so it cannot be added to the cost before the
price is known — a 3% card fee is 3% of whatever you end up charging.

With `C` for total cost and `t` for the rates added together:

```
suggested price  P   = C / (1 - t - m)       m = the net margin you want
break-even price Peq = C / (1 - t)
rates take           = P × t
left after rates     = P × (1 - t)
net profit           = P × (1 - t) - C
markup               = (P / C - 1) × 100
```

A fee charged as a fixed amount per sale is not a rate. It belongs in
**Other costs**, and the field says so.

Two things make the price unsolvable, and each gets its own explanation rather
than a blank result:

- the rates add up to 100% or more, so no price covers them;
- the rates plus the margin leave nothing for the cost.

### Rounding

Money is an integer number of cents from end to end; no float ever holds an
amount. Prices round **up** to the cent. Rounding down would hand back a price
that delivers slightly less than the margin that was asked for, which is the
one direction a pricing tool must not err in. The result panel reports the
effective margin, which rounding can nudge a hair above the target.

## Running it

```bash
npm install
npm run dev
```

| Command             | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Development server               |
| `npm run build`     | Type-check and build             |
| `npm test`          | Unit and component tests         |
| `npm run typecheck` | TypeScript, strict               |
| `npm run lint`      | Oxlint                           |
| `npm run verify:ui` | Browser verification — see below |

`verify:ui` runs against a server that is already up:

```bash
npm run dev -- --port 5211
VERIFY_URL=http://localhost:5211/ npm run verify:ui
```

Add `VERIFY_SHOTS=/some/dir` to save a full-page screenshot per viewport.

## How it is put together

```
src/
  types/pricing.ts     The shapes. Money is Cents, an integer.
  domain/pricing.ts    The engine. Pure functions, no React, no formatting.
  domain/csv.ts        The export. Pure.
  lib/currency.ts      Formatting and parsing, per currency.
  lib/form.ts          Form state and per-field validation.
  lib/historyStore.ts  localStorage, read through useSyncExternalStore.
  lib/i18n.ts          Every visible string, in one object.
  components/          calculator · results · scenarios · history · ui
```

Decisions worth knowing before changing anything:

- **The domain carries no display strings.** The engine returns scenario ids;
  the names live in `lib/i18n.ts` with the rest of the copy. A Portuguese
  version is a second object there, not a hunt through components.
- **Form state holds raw strings, not numbers.** Numeric state cannot hold
  `12,` or `0.` or an empty field, so it would rewrite what the user typed
  mid-keystroke. Parsing happens on read. Both decimal separators are
  accepted, because the same person types both.
- **History stores only the input.** The result is recomputed on read, so a
  saved row can never quote a figure the current engine would not produce.
- **Storage is treated as untrusted.** Bad JSON, a non-array, or items missing
  required fields all parse to an empty history. A browser that refuses to
  store says so on screen rather than dropping saves in silence.
- **CSV cells beginning with `=`, `+`, `-` or `@` are neutralised**, so a
  product name cannot become a formula when the file is opened.

## What is verified

Measured on 2026-10-14, not assumed:

| Check                                                | Result                                             |
| ---------------------------------------------------- | -------------------------------------------------- |
| `npm test`                                           | 73 passing — engine, CSV, store, interface states  |
| `npm run typecheck`                                  | passes, `strict` and `noUncheckedIndexedAccess` on |
| `npm run lint`                                       | passes                                             |
| `npm run build`                                      | passes                                             |
| axe-core, WCAG 2.1 A + AA, at 1440 / 768 / 390 / 320 | 0 violations                                       |
| Horizontal overflow at those four widths             | none                                               |
| Console errors and warnings                          | none                                               |
| Save, restore, export, delete, reload, clear         | all behave as described                            |

Not verified: real iOS and Android hardware (emulated widths only), screen
reader software, and any deployed instance.

## What it does not do

- It does not account for any specific tax regime, in Brazil or anywhere else,
  and it does not replace accounting or tax advice.
- Switching currency relabels the figures. It does not convert between
  currencies, and the interface says so.
- Nothing leaves the browser. There is no account, no server and no analytics;
  saved calculations live in that browser's local storage and nowhere else.

## Licence

Private project. Not published.
