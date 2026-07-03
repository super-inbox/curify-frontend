// lib/extract_audio.ts
//
// Client-side audio extraction for the audio-only tools (video transcript /
// summarizer / speech translator). The backend only needs the audio track, so
// instead of uploading the whole video we decode its audio in the browser and
// upload a compact 16 kHz mono WAV — ~10-20× smaller, and the exact format
// Scribe/WhisperX transcribe most reliably.
//
// Uses Web Audio (decodeAudioData + OfflineAudioContext) — no ffmpeg.wasm.
// decodeAudioData handles AAC-in-MP4 in Chrome/Edge/Safari; if a browser can't
// decode (some Firefox/AAC builds), the caller falls back to uploading the
// original file.

const TARGET_SAMPLE_RATE = 16000;

function getAudioContextCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || null;
}

/** Downmix + resample an AudioBuffer to 16 kHz mono via an OfflineAudioContext. */
async function toMono16k(buffer: AudioBuffer): Promise<AudioBuffer> {
  const frames = Math.max(1, Math.ceil(buffer.duration * TARGET_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, frames, TARGET_SAMPLE_RATE);
  const src = offline.createBufferSource();
  src.buffer = buffer;
  src.connect(offline.destination); // stereo->mono downmix happens here
  src.start(0);
  return await offline.startRendering();
}

function encodeWavPcm16(buffer: AudioBuffer): Blob {
  const data = buffer.getChannelData(0); // mono Float32
  const sampleRate = buffer.sampleRate;
  const numSamples = data.length;
  const dataSize = numSamples * 2;
  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let off = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return new Blob([out], { type: "audio/wav" });
}

/**
 * Extract a 16 kHz mono WAV File from a video (or audio) File.
 * Throws if the browser can't decode the audio — caller should fall back to
 * uploading the original file.
 */
export async function extractAudioWav(file: File): Promise<File> {
  const Ctor = getAudioContextCtor();
  if (!Ctor) throw new Error("Web Audio API unavailable");

  const arrayBuffer = await file.arrayBuffer();
  const ctx = new Ctor();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(arrayBuffer);
  } finally {
    // best-effort close (some browsers reject double close)
    try { await ctx.close(); } catch { /* noop */ }
  }

  const mono16k = await toMono16k(decoded);
  const wavBlob = encodeWavPcm16(mono16k);
  const base = file.name.replace(/\.[^./\\]+$/, "") || "audio";
  return new File([wavBlob], `${base}.wav`, { type: "audio/wav" });
}
