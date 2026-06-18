// TEA flyer verification — exits 0 only if ALL checks pass.
// Proves: exact render size, no headline overflow, real fonts (no serif fallback),
// the QR still decodes to the live site after rendering+scaling, and copy is clean.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { chromium } from 'playwright';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(ROOT);
const HTML = pathToFileURL(path.join(ROOT, 'admission.html')).href;
const SITE_URL = 'https://tea-landing-psi.vercel.app/';
const PNG_OUT = path.join(REPO, 'public', 'flyers', 'admission-1080x1920.png');
let failures = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const W = 1080, H = 1920;
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.goto(`${HTML}?w=${W}&h=${H}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

// 1. Headlines fit inside the frame's content box (clipping is the bug, not the fix).
{
  const data = await page.evaluate(() => {
    const frame = document.getElementById('frame').getBoundingClientRect();
    const stripe = parseFloat(getComputedStyle(document.getElementById('frame')).borderLeftWidth);
    const pad = parseFloat(getComputedStyle(document.querySelector('.content')).paddingLeft);
    const innerLeft = frame.left + stripe + pad;
    const innerRight = frame.right - pad;
    return [...document.querySelectorAll('.hl')].map(el => {
      const r = document.createRange(); r.selectNodeContents(el);
      const b = r.getBoundingClientRect();
      return { text: el.textContent.trim(), left: b.left, right: b.right, innerLeft, innerRight };
    });
  });
  for (const l of data) {
    check(`headline "${l.text}" fits inside frame`,
      l.left >= l.innerLeft - 0.5 && l.right <= l.innerRight + 0.5,
      `left=${l.left.toFixed(1)} right=${l.right.toFixed(1)} box=[${l.innerLeft.toFixed(1)},${l.innerRight.toFixed(1)}]`);
  }
}

// 2. Real fonts loaded — the rendered display faces must actually be present.
{
  const loaded = await page.evaluate(() => ({
    archivo: document.fonts.check("700 100px 'Archivo Black'"),
    unbounded: document.fonts.check("900 100px 'Unbounded'"),
    syne: document.fonts.check("400 20px 'Syne Mono'"),
    space: document.fonts.check("700 20px 'Space Grotesk'"),
  }));
  check('Archivo Black loaded (no serif fallback)', loaded.archivo);
  check('Unbounded loaded (no serif fallback)', loaded.unbounded);
  check('Syne Mono loaded', loaded.syne);
  check('Space Grotesk loaded', loaded.space);
}

// 3. QR decodes to the live site AFTER rendering + 2x scaling (real scannability).
{
  const buf = await page.locator('.qr img').screenshot();
  const png = PNG.sync.read(buf);
  const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  const decoded = code ? code.data : '(decode failed)';
  check('rendered QR decodes to exact site URL', decoded === SITE_URL, decoded);
}

// 4. Copy hygiene from the verification contract.
{
  const text = await page.evaluate(() => document.querySelector('.content').innerText);
  check('phone is "0816 125 9905"', text.includes('0816 125 9905'));
  check('plural "Educators"', /Highly Qualified Educators/.test(text));
  check('no "TYPE THIS LINK"', !/type this link/i.test(text));
  check('address present', /66 Oke Ogun Street, Owo/.test(text));
  check('no standalone "AI" in copy', (text.match(/\bAI\b/g) || []).length === 0);
}

await page.close();
await browser.close();

// 5. Saved PNG exists at exact 2x pixel size.
{
  const ok = fs.existsSync(PNG_OUT);
  let dims = '(missing)';
  if (ok) { const p = PNG.sync.read(fs.readFileSync(PNG_OUT)); dims = `${p.width}x${p.height}`; }
  check('flyer PNG is exactly 2160x3840 (1080x1920 @2x)', dims === '2160x3840', dims);
}

console.log(failures === 0 ? '\nALL FLYER CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
