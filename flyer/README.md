# TEA Admission Flyer

A 2026/2027 admission flyer that **inherits the website's design framework** — same
brand tokens, fonts, and the Ondo-map signature — so web and print read as one brand.
Built parametric: the same `admission.html` emits the story flyer now and the campaign
banners later, driven only by `?w=&h=`.

## Output
`public/flyers/admission-1080x1920.png` — portrait 9:16, rendered at 2160×3840 (deviceScaleFactor 2).

## Build
```bash
bash flyer/build.sh        # crest → qr → render → verify
# or individually:
node flyer/gen-crest.mjs   # knock out + recolor the official crest  → flyer/assets/crest.png
node flyer/gen-qr.mjs      # site-URL QR on a cream chip             → flyer/assets/qr-site.png
node flyer/render.mjs      # render the flyer PNG (add `1080 1920` to render an ad-hoc size)
node flyer/verify.mjs      # verification contract (exits 0 only if all pass)
```

## Design Tokens Extracted (from `index.html`)
- **Colors** — bg `#0A0A0A` · primary green `#1A5C2A` · lime accent `#CAFF00` ·
  off-white `#F5F5F0` · cream `#EEE8D5` · muted `#7A8C7E` · map fill `rgba(26,92,42,0.35)` ·
  hairline `rgba(202,255,0,0.15)`.
- **Fonts** — Archivo Black (display), Unbounded 900 (the lime headline line),
  Syne Mono (all labels/coordinates/pills), Space Grotesk (body/UI). Committed locally
  under `flyer/fonts/` and loaded via `fonts.css` — **never** `fonts.googleapis.com`,
  which is blocked in cloud renders and silently falls back to serif.
- **Motifs reused** — glowing Ondo State SVG boundary + Owo pin + sparse cartographic
  grid, noise + scanline overlays, lime/ghost pills, lime dot, mono coordinate labels,
  hairline info cells, and the two-face headline stack (Archivo Black + Unbounded lime).

## Taste laws (carried over from the site)
1. **Lime is sparing** — pill, OPEN, dots, accents, coordinate labels only.
2. **The Ondo map must glow** — it is texture here (density dialed down so the message
   reads instantly) but the boundary and Owo pin still glow.
3. **Monospace (Syne Mono) for every label, coordinate, and tag.**

The hero is the **message** (`ADMISSIONS OPEN`), not the repeated school name.

## Crest treatment
The official crest is a navy/orange JPG on white. `gen-crest.mjs` knocks out the white
background (luminance ramp → anti-aliased edges) and recolors to a brand duotone —
**ivory linework, lime sun** on transparent — so the raw JPG never lands on the black
brand background.

## Adding the campaign banners (no rewrite)
`admission.html` scales every dimension off `--s = min(w/1080, h/1920)`. Render other
sizes with `node flyer/render.mjs <w> <h>`, or add presets to the `presets` array in
`render.mjs`. (Layout was tuned for 9:16; wide banners will want a few spacing tweaks.)
