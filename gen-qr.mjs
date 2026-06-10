// Generates qr.png locally (no third-party API) encoding the TEA WhatsApp link.
import QRCode from 'qrcode';

const URL = 'https://wa.me/2348067716916?text=Hi%20TEA%2C%20I%27d%20like%20to%20ask%20about%20JSS%201%20admission';

await QRCode.toFile('qr.png', URL, {
  width: 660,
  margin: 2,
  errorCorrectionLevel: 'M',
  color: { dark: '#0A0A0A', light: '#EEE8D5' },
});

console.log('qr.png written, encodes:', URL);
