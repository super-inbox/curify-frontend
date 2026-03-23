import fs from 'fs';
import path from 'path';

const USE_REMOTE = process.env.NANO_DATA_REMOTE === 'true';

// 👉 未来直接改这个 URL
const REMOTE_URL = 'https://storage.googleapis.com/curify-static/data/nanobanana.json';

export async function loadNanoData(): Promise<any> {
  // 🔥 future: CDN mode
  if (USE_REMOTE) {
    const res = await fetch(REMOTE_URL, {
      // 关键：允许 CDN cache
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to fetch remote nano data');
    return res.json();
  }

  // ✅ current: local file
  const jsonPath = path.join(process.cwd(), 'public', 'data', 'nanobanana.json');
  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(fileContent);
}