// TEA landing page verification suite — exits 0 only if ALL checks pass.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { chromium } from 'playwright';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const EXPECTED_URL = 'https://wa.me/2348067716916?text=Hi%20TEA%2C%20I%27d%20like%20to%20ask%20about%20JSS%201%20admission';
let failures = 0;

function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
}

// ---- 1. QR decode check ----
{
  const png = PNG.sync.read(fs.readFileSync(path.join(ROOT, 'qr.png')));
  const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  const decoded = code ? code.data : '(decode failed)';
  console.log('Decoded QR string:', decoded);
  check('QR decodes to exact wa.me URL', decoded === EXPECTED_URL, decoded);
}

// ---- 2. Playwright render checks (mobile + desktop) ----
{
  const browser = await chromium.launch();
  const pageUrl = pathToFileURL(path.join(ROOT, 'index.html')).href;
  const viewports = [
    { name: 'mobile', width: 390, height: 844, shot: 'mobile.png' },
    { name: 'desktop', width: 1440, height: 900, shot: 'desktop.png' },
  ];
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(pageUrl, { waitUntil: 'networkidle' });
    // Headless chromium doesn't reliably fire IntersectionObserver; screenshot the
    // revealed end-state (what every real user sees) rather than the animation.
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    });
    await page.waitForTimeout(900);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    check(
      `${vp.name} (${vp.width}x${vp.height}) no horizontal overflow`,
      scrollWidth <= vp.width,
      `scrollWidth=${scrollWidth} viewport=${vp.width}`
    );
    await page.screenshot({ path: path.join(ROOT, vp.shot), fullPage: true });
    console.log(`Saved ${vp.shot}`);
    await page.close();
  }

  // Element-level headline fit check at four widths. Page scrollWidth misses clipped
  // text (clipping is the bug, not the fix) — measure the rendered glyphs via Range rects.
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(pageUrl, { waitUntil: 'networkidle' });
    const lines = await page.evaluate(() => {
      return [...document.querySelectorAll('.hl')].map(el => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        return { text: el.textContent.trim(), left: r.left, right: r.right };
      });
    });
    for (const l of lines) {
      check(
        `headline "${l.text}" fits at ${width}px`,
        l.left >= 0 && l.right <= width,
        `left=${l.left.toFixed(1)} right=${l.right.toFixed(1)} viewport=${width}`
      );
    }
    await page.close();
  }

  // Public copy must not name the engine: \bAI\b in visible text = 0.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(pageUrl, { waitUntil: 'networkidle' });
    const aiHits = await page.evaluate(() => (document.body.innerText.match(/\bAI\b/g) || []).length);
    check('no standalone "AI" in public copy', aiHits === 0, `matches=${aiHits}`);
    await page.close();
  }
  await browser.close();
}

// ---- 3. Brand-token check ----
{
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const tokens = ['#0A0A0A', '#CAFF00', '#1A5C2A', 'Archivo Black', 'Unbounded', 'Syne Mono', 'Space Grotesk', '#TowardsExcellence'];
  for (const t of tokens) {
    check(`brand token present: ${t}`, html.includes(t));
  }
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
