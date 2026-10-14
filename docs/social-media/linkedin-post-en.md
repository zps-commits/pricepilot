# LinkedIn — post in English

> **Before posting:** the deployment is live and verified (https://pricepilot-eta.vercel.app).
> The GitHub repository **has not been created yet** — confirm the real URL
> before posting, or drop that line. Do not publish a link that does not exist.

---

Second project of my 60 solutions in 30 days challenge: **PricePilot**, a
pricing calculator.

**The problem**

Anyone selling through a delivery app, a marketplace or a card machine is
charged two different kinds of thing, and mixing them up is what quietly eats
a margin.

A cost is an amount per unit. Ingredients, materials, the share of the rent
that this one sale has to carry.

A rate is a percentage **of the sale price**. The card fee, the marketplace
commission, a tax on revenue.

A rate cannot be added to the cost before the price is known, because it is a
percentage of the answer. Mark up by a round number instead and you have no
way to tell where the floor is, meaning the price below which you are paying
to make the sale.

**The solution**

One screen. Costs and rates on the left, the price and what is left of it on
the right, recalculated as you type. Below that, a discount slider that says
immediately whether the sale still makes money, and the same cost structure
priced at three different margins.

Everything runs in the browser. No account, no server, no data leaving the
device.

**Technical decisions that changed the result**

Money is an integer number of cents, end to end. No float ever holds an
amount.

Prices round up to the cent, never down. Rounding down returns a price that
delivers less margin than the one that was asked for, and that is the single
direction a pricing tool must not err in.

The engine is pure: input in, result or `null` out. No React inside, no
formatting, no exceptions. An unsolvable input, rates summing to 100% for
instance, is a typed problem with its own explanation rather than a thrown
error or a NaN on screen.

**What was actually hard**

The Vite scaffold shipped with `strict` turned off in the tsconfig. I wrote
and reviewed the whole engine under a compiler that was barely checking
anything. Turning it on afterwards surfaced real errors. It is a checklist
item on any new scaffold now.

Three accessibility defects that only a browser found, with TypeScript, the
linter and 60 unit tests all green: a `<dl>` whose `<dt>` sat two wrappers
deep, the scenario table's horizontal scroll region unreachable by keyboard
at 390px, and a hint failing contrast at 80% opacity.

Two live regions fighting each other. `<output>` carries an implicit `status`
role, so the slider value and the discount result were both announcing on
every drag.

**What I took from it**

Unit tests and types do not replace running the thing in a browser. All three
accessibility defects were sitting there with everything green. So the
verification became a committed script: axe-core at four viewport widths on
every run, not a one-off audit.

**Verified on 14 October 2026**

77 tests passing, TypeScript strict clean, build clean, zero axe-core
violations (WCAG 2.1 A + AA) at 1440, 768, 390 and 320px, no horizontal
overflow and no console errors.

The same figures hold against the live deployment, not only a local build.

Not verified: real iOS and Android hardware, and screen reader software.

Stack: React 19, TypeScript, Vite, Tailwind CSS v4, Vitest, Testing Library,
Playwright + axe-core.

Live: https://pricepilot-eta.vercel.app
Code: [CONFIRM GITHUB URL BEFORE POSTING]

If you price on top of a marketplace and want to compare notes, happy to talk.

#webdevelopment #react #typescript #accessibility
