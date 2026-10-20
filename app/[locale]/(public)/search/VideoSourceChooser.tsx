'use client';

import { useState } from 'react';
import { useTracking } from '@/services/useTracking';
import { youtubeSource } from '@/lib/searchQuality';

export default function VideoSourceChooser({ sourceUrl, locale }: { sourceUrl: string; locale: string }) {
  const zh = locale === 'zh';
  const { track } = useTracking();
  const [copied, setCopied] = useState(false);
  const youtube = youtubeSource(sourceUrl);
  const choices = [
    ['bilingual-subtitles', zh ? '制作或翻译字幕' : 'Create or translate subtitles'],
    ['video-transcript-generator', zh ? '提取文字稿' : 'Transcribe a video'],
    ['video-dubbing', zh ? '翻译配音' : 'Translate and dub'],
    ['asl-video-translator', zh ? '翻译美国手语视频' : 'Translate American Sign Language'],
  ];
  return <main className="mx-auto max-w-2xl px-6 py-16">
    <h1 className="text-3xl font-semibold">{zh ? '你想如何处理这个视频？' : 'What would you like to do with this video?'}</h1>
    <p className="mt-4 text-gray-500">{youtube
      ? (zh ? '选择工具后，YouTube 链接会保留在导入框中。请先核对，再开始处理。' : 'Your YouTube link will be prefilled in the import form. Review it before starting.')
      : (zh ? '保留此链接供参考。若工具不支持该网站，请上传你有权使用的视频文件。' : 'Keep this link for reference. If the tool does not support this site, upload a video file you have permission to use.')}</p>
    <div className="my-6 rounded-xl border p-4">
      <p className="break-all text-sm">{sourceUrl}</p>
      <button className="mt-3 underline" onClick={async () => { try { await navigator.clipboard.writeText(sourceUrl); setCopied(true); } catch { setCopied(false); } }}>
        {copied ? (zh ? '已复制' : 'Copied') : (zh ? '复制链接' : 'Copy link')}
      </button>
    </div>
    <div className="grid gap-3">{choices.map(([slug, label]) => <a key={slug}
      onClick={() => track({contentId: `video-source-tool:${slug}`, contentType: "tool_card", actionType: "click"})}
      className="rounded-xl border px-5 py-4 hover:bg-gray-100 dark:hover:bg-gray-800"
      href={`/${locale}/tools/${slug}?source_url=${encodeURIComponent(sourceUrl)}`}>
      {label} →
    </a>)}</div>
  </main>;
}
