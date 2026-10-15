# PricePilot — project summary

## In one line

A pricing calculator that works out what to charge once payment fees,
marketplace commission and other charges have come off the price.

## The commercial pitch

Anyone selling through a delivery app, a marketplace or a card machine is
charged two different kinds of thing, and mixing them up is what quietly
eats a margin:

- **Costs** are amounts per unit — ingredients, materials, the share of rent
  this sale has to carry.
- **Rates** are percentages **of the sale price** — the card fee, the
  marketplace commission, a tax on revenue.

A rate cannot be added to the cost before the price is known, because it is a
percentage of the answer. Mark up by a round number instead and you have no
way to tell where the floor is. PricePilot gives the price that delivers the
margin asked for, the price below which the sale loses money, and what a
discount does to both.

Everything runs in the browser. No account, no server, no data leaving the
device.

## The technical pitch

A small React application with the arithmetic kept completely out of the
components.

- **Money is an integer number of cents, end to end.** No float ever holds an
  amount.
- **Prices round up to the cent, never down.** Rounding down returns a price
  that delivers less margin than the one that was asked for, which is the one
  direction a pricing tool must not err in.
- **The engine is pure.** `PricingInput` in, `PricingResult | null` out. No
  React, no formatting, no exceptions — an unsolvable input is a typed
  problem with its own explanation, not a thrown error or a NaN.
- **Accessibility is measured, not assumed.** A committed script runs
  axe-core at four viewport widths on every check.

## Features

- Suggested price, break-even price, total cost, what the rates take, revenue
  after rates, net profit, effective margin and markup
- Discount simulation with an explicit profit / break-even / loss verdict
- Three margin scenarios priced off the same costs
- Local history: save, restore, delete, clear with confirmation
- CSV export, protected against formula injection
- BRL and USD labelling — relabels, never converts, and says so

## Stack

React 19 · TypeScript (strict) · Vite 8 · Tailwind CSS v4 · Vitest ·
Testing Library · Playwright + axe-core

No backend, no database, no paid service.

## Verified

Measured on 2026-10-14, not assumed:

- 77 unit and component tests passing
- TypeScript strict and `noUncheckedIndexedAccess` clean
- Lint and production build clean
- **0 axe-core violations**, WCAG 2.1 A + AA, at 1440 / 768 / 390 / 320px
- No horizontal overflow and no console errors at those widths

The same checks pass against the live deployment, not only a local build.

Not verified: real iOS and Android hardware, and screen reader software.

## Status

Live at **https://pricepilot-eta.vercel.app**, deployed 2026-10-14.
Source at **https://github.com/zps-commits/pricepilot**, public, 15 commits.

## Honesty notes for anyone reusing this summary

- There are no users, no clients, no revenue and no commercial results. Do
  not write any.
- The only numbers that may be quoted are the verification results above.
- It is a demonstration tool. It does not model any specific tax regime and
  does not replace accounting or tax advice.
