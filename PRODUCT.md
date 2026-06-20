# MICRORITM

A cinematic, immersive product-launch experience for **MICRORITM** — a (fictional) intelligence
engine. The site is the product: a visitor's first impression IS the deliverable. Users should feel
they are exploring a futuristic world, not browsing a webpage.

## Register
Brand. Design IS the product. Marketing / launch surface, single long-scroll journey.

## Brand voice (three physical words)
Suspended · molten · precise. A polished obsidian object floating in warm volumetric light —
weighty, expensive, alive.

## Aesthetic lane (named reference)
"Apple keynote stage × luxury-beverage cinematography × a planetarium at dusk." Deliberately NOT
the saturated futuristic-startup lane (blue-black space, neon cyberpunk, Space Grotesk, gradient
text). Warmth carries the future, not neon.

## Color strategy — Committed, dark
Warm obsidian void lit by a single amber/champagne key light with a cool, desaturated counter-light.
- `--void` deep warm obsidian (base, ~60-70% of surface)
- `--ember` molten amber/champagne — the key light and primary accent
- `--halo` cool desaturated teal — counter / rim light, used sparingly
- `--ink` warm off-white text
All OKLCH. Body text hits the ink end for ≥4.5:1 on the void.

## Type
- Display: **Bricolage Grotesque** (700–800) — monumental, architectural, intentional.
- Body / UI: **Geist** — neutral geometric grotesque.
- HUD labels: **Geist Mono** — sci-fi instrument readouts, used sparingly (the register literally is
  a HUD, so mono is not costume here).

## Motion
3D centerpiece via the existing Spline scene. Atmosphere via custom Canvas2D particle/fog field +
CSS volumetric light. Scroll-driven storytelling and cursor parallax via Framer Motion. No new deps
(R3F/GSAP/Lenis are not installed; we ship 60fps with what's here). Every animation has a
`prefers-reduced-motion` fallback.

## Bans honored
No gradient text, no identical card grids, no per-section uppercase eyebrows, no side-stripe borders.
Glass is used intentionally (holographic HUD), not as a default.
