# Magnific prompts, prepared but not run

The brief for this step names Magnific. **The account is on the Free plan
with 0 credits available**, checked on 2026-10-14, so nothing was generated
there. Rather than skip the step, the four materials were composed
deterministically in the browser — see `composed/`.

That turned out to be the stronger route for this particular brief anyway.
Its hardest rule is that the content of a real screenshot must survive
untouched: no altered text, numbers, features or buttons. A generative model
redraws what it is shown and cannot promise that. The brief's own fallback
says to keep the capture intact and build the composition around it, which
is exactly what a rendered layout does.

## What would still be worth generating, with credits

Only the fourth material in the brief's list — the "complementary visual with
a technological theme" — is a legitimate candidate, because it contains no
interface to preserve. The other three must show real screens.

### Prompt: abstract background texture

```
An abstract editorial background for a software case study. Fine horizontal
rule lines on a warm near-white ground, like a ledger or an accounting sheet,
irregular spacing, one deep teal line among the grey ones. Flat, no gradient,
no glow, no perspective, no 3D. Generous empty space in the upper two thirds
for type to sit over. Printed-paper feel, not screen-glow.
Aspect ratio 4:5.
```

### Prompt: the two kinds of number

```
A minimal editorial diagram, flat vector, on a warm near-white ground. Two
columns of small horizontal bars of differing lengths, the left column in
graphite, the right column in deep teal, with a clear gap between them. No
text, no labels, no numbers, no icons. Swiss typographic poster sensibility.
No gradients, no glow, no drop shadows, no 3D.
Aspect ratio 4:5.
```

## Rules for whoever runs these

- Never send a screenshot of the interface to an image model for restyling.
  It will rewrite the figures, and a pricing tool showing an invented number
  is worse than no image at all.
- A generated image may sit behind or beside a capture, never underneath it
  in a way that tints or distorts it.
- If a generated result looks like generic AI output — purple gradient, neon
  glow, dark mesh — discard it. It does not match the product.
