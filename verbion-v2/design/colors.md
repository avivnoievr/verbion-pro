# VERBION V2 — Color Reference

## Section Backgrounds

| Page | Hex | Variable | Usage |
|------|-----|----------|-------|
| 1 — Hero | `#1dc2b1` | `--bg-hero` | Teal radial gradient, white oval center for product |
| 2 — Feature | `#d45b15` | `--bg-transition` | Burnt orange, wave element rows, wrap-in transition |
| 3 — Products | `#1f1c1b` | `--bg-products` | Deep warm charcoal, product display section |

## Hero Gradient (Page 1)

Radial gradient from center outward — product sits on the white oval:

```
center → #ffffff (white core)
      → #c8f4ef (mist)
      → #5dd9ce (light teal)
      → #1dc2b1 (brand teal)
      → #0e8a7f (deep edge)
```

## Page Transition (Pages 1 → 2)

Animation: teal collapses inward (clip-path circle shrinks to center),
orange wraps from outside. Light blur during motion — not full, keeps
the "wrap" visible. Duration ~1.4s ease-in-out.

## Wave Elements (Page 2)

Color: `rgba(31, 28, 27, 0.28)` on orange bg — warm dark, organic.
6 horizontal rows, evenly distributed across page height.
mix-blend-mode: multiply so white areas of the PNG disappear.

## Products Divider (Page 3)

Thick organic rule / brush-stroke shape.
Color: warm white `rgba(255, 248, 240, 0.12)` on `#1f1c1b` bg.
Not electrical. Organic, premium.
```
