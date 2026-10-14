# PricePilot — case study

A pricing calculator built as a portfolio piece. This document records what
was built, why each decision went the way it did, and what is still missing.

It describes a demonstration tool. **It does not account for any specific tax
regime and does not replace accounting or tax advice.** No client, user,
revenue figure or commercial result appears anywhere in this document,
because there are none.

---

## Context

Built in one session as the second project of a personal challenge — 60
solutions in 30 days — following a written brief. The brief set the stack,
the formulas, the commit sequence and a list of mandatory tests, and
explicitly forbade pushing or deploying without authorisation.

## The problem

Someone selling through a delivery app, a marketplace or a card machine is
charged two different kinds of thing, and conflating them is the mistake that
quietly eats a margin:

- **A cost** is an amount per unit. Ingredients, materials, the share of the
  rent that this one sale has to carry.
- **A rate** is a percentage **of the sale price**. The card fee, the
  marketplace commission, a tax on revenue.

A rate cannot be added to the cost before the price is known, because it is a
percentage of the answer. Adding a 15% commission to a R$ 30 cost and calling
the result a price is wrong, and it is wrong in the direction that loses
money. The usual workaround — marking up by a round number and hoping — has
no way to tell you the price below which you are paying to make the sale.

## The solution

One screen. Costs and rates on the left, the price and what is left of it on
the right, recalculated as you type. Below that, a discount slider that says
whether the sale still makes money, and the same costs priced at three
different margins.

Everything stays in the browser. No account, no server, no analytics.

## Architecture

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

The rule the structure enforces: **no formula lives in a component.** The
engine takes a `PricingInput` and returns a `PricingResult` or `null`. It
imports nothing from React and formats nothing. That is what made the
arithmetic testable without rendering anything, and it is why 46 of the tests
run in microseconds.

## The calculations

With `C` for total cost and `t` for the rates added together, both as
decimals, and `m` for the net margin wanted:

```
suggested price  P   = C / (1 - t - m)
break-even price Peq = C / (1 - t)
rates take           = P × t
left after rates     = P × (1 - t)
net profit           = P × (1 - t) - C
effective margin     = (profit / P) × 100
markup               = (P / C - 1) × 100
```

Two denominators can make the problem unsolvable, and each gets its own
explanation rather than a blank result:

- `1 - t <= 0` — the rates add up to 100% or more, so no price covers them.
- `1 - t - m <= 0` — the rates plus the margin leave nothing for the cost.

## Technical decisions

**Money is an integer number of cents, end to end.** No float ever holds an
amount. `0.1 + 0.2` is the oldest bug in money software and the cheapest one
to design out.

**Prices round up to the cent, never down.** Rounding down returns a price
that delivers slightly less than the margin that was asked for. A pricing
tool may err high; it must not err low. The result panel reports the
effective margin, which rounding can nudge a hair above the target, so the
difference is visible rather than hidden.

**The engine returns `null`, not an exception or a NaN.** An unsolvable input
is an ordinary state of a pricing tool, not an error condition. The problem
list is typed, so the interface renders the explanation the engine gives
rather than inventing its own wording.

**Markup is `number | null`.** At zero cost there is nothing to mark up, and
`Infinity` is not an answer. The type forces every caller to decide what to
show.

**Form state holds raw strings, not numbers.** Numeric state cannot represent
`12,` or `0.` or an empty field, so it rewrites what the user typed
mid-keystroke or refuses the character. Parsing happens on read. Both decimal
separators are accepted, because the same person types `12,50` and `12.50`
without thinking about it.

**History stores only the input.** The result is recomputed on read, so a
saved row can never quote a figure the current engine would not produce.

**Storage is treated as hostile.** Bad JSON, a non-array, items missing
required fields — all parse to an empty history. A browser that refuses to
store (private mode, blocked site data, quota) says so on screen; a write
that throws keeps the entry in memory for the session rather than losing the
click in silence.

**CSV cells beginning with `=`, `+`, `-` or `@` are prefixed with an
apostrophe.** A product name must not be able to become a formula when the
file is opened in a spreadsheet.

**Currency relabels and never converts**, and the interface says so. A
switch that silently left the numbers alone would otherwise read as a
conversion bug.

**State is read with `useSyncExternalStore`, not set from an effect.** React
19 treats `setState` in an effect as a lint error, and the external-store
shape is what makes the cross-tab `storage` sync fall out for free.

## Deviations from the brief

Three, each deliberate:

- **No icon library.** The brief named Lucide. The interface turned out to
  need no icons at all, and shipping a dependency to use none of it is
  weight for nothing. It was installed by the scaffold and removed.
- **Oxlint instead of ESLint.** It is what the Vite scaffold ships with, it
  passes clean, and swapping linters would have been churn with no gain.
- **No decimal library.** The brief allowed one "if necessary". Integer cents
  made it unnecessary.

## Challenges

**The scaffold had `strict` turned off.** The Vite TypeScript template left
`strict` out of `tsconfig.app.json` entirely, so the engine was written and
reviewed under a compiler that was not checking much. Turning it on — along
with `noUncheckedIndexedAccess` — surfaced an unused parameter in
`applyDiscount` and three unchecked index accesses in the tests. Worth
checking on any new scaffold rather than assuming.

**Three accessibility defects that only a browser found.** TypeScript, the
linter and 60 unit tests were all green while the page still had them:

1. A `<dl>` whose `<dt>` sat two `<div>`s deep. A definition list permits one
   wrapper, not two; axe reported a broken list.
2. The scenario table's horizontal scroll box was not reachable by keyboard
   at 390px and 320px — a scrollable region a keyboard cannot reach is
   content a keyboard cannot read.
3. A hint paragraph at 80% opacity failed contrast.

**Two live regions fighting.** `<output>` carries an implicit `status` role.
Placing one next to the discount figures meant the slider value and the
result both announced on every drag. The slider announces its own value, so
the visual echo is now `aria-hidden` and one polite region covers the
figures.

**A save that could fire twice.** The save handler read the form from inside
a `setState` updater. React may run an updater twice, and saving twice is not
a harmless retry. It reads from the closure now.

**A wrong test expectation, twice.** Both times the application was right and
the assertion was wrong — the restore test forgot that two other cost fields
were still filled. Worth stating plainly: a failing test is not automatically
a failing application.

## Results

Measured on 2026-10-14. These are verification results, not commercial ones.

| Check                                                | Result              |
| ---------------------------------------------------- | ------------------- |
| Unit and component tests                             | 77 passing          |
| TypeScript, `strict` + `noUncheckedIndexedAccess`    | passes              |
| Oxlint                                               | passes              |
| Production build                                     | passes              |
| axe-core, WCAG 2.1 A + AA, at 1440 / 768 / 390 / 320 | 0 violations        |
| Horizontal overflow at those widths                  | none                |
| Console errors and warnings                          | none                |
| Save, restore, export, delete, reload, clear         | behave as described |

The browser checks are a committed script, `npm run verify:ui`, not a
one-off: four viewports for overflow, console noise and axe, then the
behaviour only a browser can confirm.

The whole run also passes against the live deployment at
https://pricepilot-eta.vercel.app, not only against a local build.

**Not verified:** real iOS and Android hardware (emulated widths only) and
screen reader software.

## Next steps

Deliberately out of scope for this version, and documented rather than
simulated:

- A Portuguese translation. The strings are already centralised in
  `lib/i18n.ts` for exactly this; it is a second object, not a refactor.
- Batch pricing from a spreadsheet import.
- Named tax presets per marketplace, which needs real, sourced rate data
  rather than numbers made up to look plausible.
- Comparing two saved calculations side by side.
