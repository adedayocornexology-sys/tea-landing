// Knocks out the TEA crest's white background and recolors it to the site palette.
// Input : flyer/src/crest-source.jpg  (official navy/orange crest on white)
// Output: flyer/assets/crest.png      (transparent bg, ivory linework + lime sun)
//
// Why a duotone and not the raw JPG: the brand law is "never drop the navy/orange JPG
// onto the black background." We map by luminance (white -> transparent, with an
// anti-aliased ramp so edges stay crisp) and by warmth (orange sun -> lime accent,
// everything else -> ivory).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
// Inline as a data URL: file:// images taint the canvas (toDataURL throws) and may
// be blocked from loading in the page context. A data: URL is same-origin-clean.
const SRC = 'data:image/jpeg;base64,' +
  fs.readFileSync(path.join(ROOT, 'src', 'crest-source.jpg')).toString('base64');
const OUT = path.join(ROOT, 'assets', 'crest.png');

// brand tokens (from index.html :root)
const IVORY = [245, 245, 240]; // --offwhite #F5F5F0
const LIME  = [202, 255, 0];   // --lime    #CAFF00

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();

const dataUrl = await page.evaluate(async ({ SRC, IVORY, LIME }) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = SRC; });

  const w = img.naturalWidth, h = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const im = ctx.getImageData(0, 0, w, h);
  const d = im.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Alpha from a luminance ramp: white bg (lum~250) -> 0, ink (lum<185) -> 1.
    // The ramp band gives anti-aliased edges instead of a jagged 1-bit cutout.
    let a = (232 - lum) / 60;
    a = a < 0 ? 0 : a > 1 ? 1 : a;

    // Warm pixels (the sun) -> lime accent; everything else (navy ring/book/text) -> ivory.
    const warm = (r - b) > 55 && r >= g && g >= b;
    const [cr, cg, cb] = warm ? LIME : IVORY;

    d[i] = cr; d[i + 1] = cg; d[i + 2] = cb;
    d[i + 3] = Math.round(a * 255);
  }
  ctx.putImageData(im, 0, 0);
  return c.toDataURL('image/png');
}, { SRC, IVORY, LIME });

const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, buf);
console.log('crest.png written:', OUT, `(${buf.length} bytes)`);

await browser.close();
