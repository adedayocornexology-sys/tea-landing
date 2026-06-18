// Renders the TEA admission flyer to PNG at exact pixel size (deviceScaleFactor 2).
// Parametric: each preset drives the ?w=&h= query, so the same flyer.html emits the
// story flyer now and the campaign banners later without a rewrite.
//
//   node flyer/render.mjs            # renders all presets below
//   node flyer/render.mjs 1080 1920  # render one ad-hoc size
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(ROOT);
const HTML = pathToFileURL(path.join(ROOT, 'admission.html')).href;
const OUTDIR = path.join(REPO, 'public', 'flyers');

const presets = [
  { name: 'admission', w: 1080, h: 1920 }, // 9:16 story / status / reels (primary)
];
const argW = parseInt(process.argv[2], 10);
const argH = parseInt(process.argv[3], 10);
const jobs = (argW && argH)
  ? [{ name: `admission-${argW}x${argH}`, w: argW, h: argH }]
  : presets;

fs.mkdirSync(OUTDIR, { recursive: true });
const browser = await chromium.launch({ args: ['--no-sandbox'] });

for (const j of jobs) {
  const page = await browser.newPage({
    viewport: { width: j.w, height: j.h },
    deviceScaleFactor: 2,
  });
  await page.goto(`${HTML}?w=${j.w}&h=${j.h}`, { waitUntil: 'networkidle' });
  // Block on real font load — a silent serif fallback would break brand fidelity.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const file = `${j.name}-${j.w}x${j.h}.png`;
  const out = path.join(OUTDIR, file);
  const frame = await page.$('#frame');
  await frame.screenshot({ path: out });
  console.log(`rendered ${file}  ->  ${path.relative(REPO, out)}`);
  await page.close();
}

await browser.close();
