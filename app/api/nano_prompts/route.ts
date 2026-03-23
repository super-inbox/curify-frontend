import { NextResponse } from 'next/server';
import { loadNanoData } from '@/lib/nano_data_source';

export async function GET() {
  try {
    const data = await loadNanoData();

    return NextResponse.json(
      { prompts: data.prompts },
      {
        headers: {
          // 🔥 关键：CDN / Vercel cache
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error('[nano_prompts API error]', error);

    return NextResponse.json(
      { error: 'Failed to load nano prompts' },
      { status: 500 }
    );
  }
}