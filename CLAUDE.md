# TEA Landing — CLAUDE.md

## Project

Single-page landing site for **Towards Excellence Academy (TEA)**, a new STEM school in Owo, Ondo State, Nigeria, resuming September 2026. Audience: parents in Owo/Ondo State who want world-class education for their children without leaving home. The page's one job: signal that admissions are opening soon and route interested parents to the school's WhatsApp virtual assistant — via QR code for desktop visitors and a tap-to-chat button for mobile visitors. The prefill pre-qualifies the bot conversation: `https://wa.me/2348067716916?text=Hi%20TEA%2C%20I%27d%20like%20to%20ask%20about%20JSS%201%20admission`.

## Brand tokens (condensed)

```
Background #0A0A0A · Primary Green #1A5C2A (uniform color) · Lime Accent #CAFF00
Off-White #F5F5F0 (headlines) · Cream #EEE8D5 (secondary / QR card) · Muted #7A8C7E
Map glow fill rgba(26,92,42,0.35)
```

Fonts: **Archivo Black** (display headlines TOWARDS/ACADEMY) · **Unbounded 900** (the EXCELLENCE line) · **Syne Mono** (every label, coordinate, tag, pill) · **Space Grotesk** (body/UI).

Three taste laws:
1. **Lime is sparing** — stripe, pills, CTA, dots, coordinate labels only. If everything is lime, nothing is.
2. **The Ondo map must glow** — it is the visual signature, never faint.
3. **Monospace (Syne Mono) for all labels**, coordinates, and tags.

The FULL brand system lives in the original build prompt and in the design of `index.html` itself.

## Commands

```bash
bash verify.sh          # full check suite: QR decode + Playwright renders + brand tokens
vercel --prod --yes     # deploy to production
node -e "const{PNG}=require('pngjs');const j=require('jsqr');const p=PNG.sync.read(require('fs').readFileSync('qr.png'));console.log(j(new Uint8ClampedArray(p.data),p.width,p.height).data)"   # QR decode one-liner
```

## Hard rules

- Single-file site: `index.html` with inline CSS, vanilla JS only. No frameworks, no build step.
- QR generated locally (`node gen-qr.mjs`), never via a third-party API URL.
- Every change must pass `verify.sh` (exit 0) BEFORE commit.
- Never claim "verified" without executed output.

## Error Ledger

Every time Cornelius corrects a mistake in this project, append a one-line lesson here. This file is the project's memory.

- 2026-06-10 — Headline overflow slipped past verify.sh: page scrollWidth passes when text is *clipped*, not scrolling; verify now measures each headline line's Range rect at 320/390/768/1440. Clipping is the bug, not the fix.
- 2026-06-10 — "AI" removed from all public copy (verify asserts `\bAI\b` = 0 in visible text): the AI is the secret engine, never the billboard — competitors copy slogans, not systems.
- 2026-06-10 — QR prefill must arrive pre-qualified ("Hi TEA, I'd like to ask about JSS 1 admission"); JSS 1-only intake is selective positioning, not small capacity.
