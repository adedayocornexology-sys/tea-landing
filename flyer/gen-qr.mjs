// Generates the flyer QR locally (no third-party API) encoding the live site URL.
// Site palette (ink #0A0A0A on cream #EEE8D5) but high error-correction + quiet zone
// so it still scans reliably off a printed/screened flyer.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const URL = 'https://tea-landing-psi.vercel.app/';

await QRCode.toFile(path.join(ROOT, 'assets', 'qr-site.png'), URL, {
  width: 720,
  margin: 2,
  errorCorrectionLevel: 'H',
  color: { dark: '#0A0A0A', light: '#EEE8D5' },
});

console.log('qr-site.png written, encodes:', URL);
