# TEA Landing — Build & Verification Report

**Live production URL:** https://tea-landing-psi.vercel.app
**GitHub repository:** https://github.com/adedayocornexology-sys/tea-landing

Date: 2026-06-10 · All outputs below are real executed results, not claims.

---

## Goal checklist

### 1. Single self-contained `index.html`
PASS — 12,534 bytes, all CSS inline, no framework, no build step. Total page weight with `qr.png` (4,338 bytes): ~17 KB, well under the 300 KB budget (excluding fonts).

### 2. QR asset generated locally
PASS — `qr.png` written by `gen-qr.mjs` using the npm `qrcode` package (no third-party API). Encodes `https://wa.me/2348067716916?text=Hi%20TEA`.

### 3. Executable QR decode check
PASS — decoded with `jsqr` + `pngjs`:

```
Decoded QR string: https://wa.me/2348067716916?text=Hi%20TEA
PASS  QR decodes to exact wa.me URL — https://wa.me/2348067716916?text=Hi%20TEA
```

### 4. Playwright render check (two viewports)
PASS — chromium, asserting `document.documentElement.scrollWidth <= viewport width`:

```
PASS  mobile (390x844) no horizontal overflow — scrollWidth=390 viewport=390
PASS  desktop (1440x900) no horizontal overflow — scrollWidth=1440 viewport=1440
```

Screenshots saved: `mobile.png`, `desktop.png` (committed to the repo).

### 5. Brand-token check
PASS — all eight tokens asserted present in `index.html`:

```
PASS  brand token present: #0A0A0A
PASS  brand token present: #CAFF00
PASS  brand token present: #1A5C2A
PASS  brand token present: Archivo Black
PASS  brand token present: Unbounded
PASS  brand token present: Syne Mono
PASS  brand token present: Space Grotesk
PASS  brand token present: #TowardsExcellence
```

### 6. Single verify entry point
PASS — `bash verify.sh` runs `verify.mjs` (all checks above) and exits 0:

```
ALL CHECKS PASSED
(exit code 0)
```

### 7. Deployed to GitHub
PASS — new dedicated public repo, pushed to `main`. `gh repo view --json url` output:

```
{"url":"https://github.com/adedayocornexology-sys/tea-landing"}
```

### 8. Deployed to Vercel
PASS — `vercel --prod --yes`, deployment `READY`, target `production`:

```
Production: https://tea-landing-v9o9mlu66-adedayocornexology-sys-projects.vercel.app
Aliased:    https://tea-landing-psi.vercel.app
```

### 9. Live-site curl check
PASS — `curl -s` against the production URL:

```
HTTP status: 200
TOWARDS
#CAFF00
wa.me/2348067716916?text=Hi%20TEA
LIVE-SITE CHECK: PASS
```

`qr.png` also serves live: HTTP 200.

### 10. Independent adversarial verification
See the verifier verdict appended at the bottom of this file — run in a separate fresh context that re-ran `verify.sh` and reviewed both screenshots against the brand system.

---

## Notes / fixes made during build

- Mobile hero map initially over-zoomed (rendered as a green sheet); constrained to `width:min(96%,440px)` at top of hero on mobile so the full Ondo silhouette shows. Desktop keeps the spec layout (96% hero height, offset left of center).
- Headless chromium does not reliably fire IntersectionObserver, which left scroll-reveal sections invisible in screenshots. Page now has a 2.5 s failsafe that reveals all content regardless, and the verify script screenshots the revealed end-state.
