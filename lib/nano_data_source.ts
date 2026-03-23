// lib/nano_data_source.ts

const REMOTE_URL =
  process.env.NANO_DATA_URL ||
  'https://storage.googleapis.com/curify-static/data/nanobanana.json';

export async function loadNanoData(): Promise<any> {
  const res = await fetch(REMOTE_URL, {
    // ✅ 利用 Next.js / Vercel edge cache
    next: { revalidate: 3600 }, // 1 hour
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch nano data: ${res.status}`);
  }

  return res.json();
}