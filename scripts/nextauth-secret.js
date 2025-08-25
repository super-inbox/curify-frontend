import fs from 'fs';
import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('base64');
const envPath = `.env.local`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, '');
}

if (!fs.readFileSync(envPath, 'utf-8').includes('NEXTAUTH_SECRET')) {
  fs.appendFileSync(envPath, `NEXTAUTH_SECRET=${secret}\n`);
  console.log('NEXTAUTH_SECRET has been writen in .env.local');
}