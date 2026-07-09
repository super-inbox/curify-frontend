// lib/resize_bundle.ts
//
// P0-4 "One-Click Resize Bundle" — the first real Completion deliverable.
// Client-side only: fetch the current image, cover-crop it to the three social
// aspect ratios on a canvas, and hand back object URLs. No backend, no credits.
//
// CORS note: the source is one of our own CDN/signed assets. Canvas export
// requires the fetch to succeed under CORS; we fetch as a blob (which needs
// Access-Control-Allow-Origin on the asset) so the canvas is not tainted. If
// the bucket lacks CORS headers the fetch throws and the caller shows a
// friendly message — that's a one-line bucket-config fix, not a code blocker.

export type SocialAspect = { key: string; label: string; w: number; h: number };

export const SOCIAL_ASPECTS: readonly SocialAspect[] = [
  { key: "9x16", label: "Story / Reel 9:16", w: 1080, h: 1920 },
  { key: "1x1", label: "Square 1:1", w: 1080, h: 1080 },
  { key: "16x9", label: "Wide 16:9", w: 1920, h: 1080 },
] as const;

export type ResizedVariant = { key: string; label: string; url: string; filename: string };

async function loadBitmap(imageUrl: string): Promise<ImageBitmap> {
  // Blob-fetch keeps the canvas untainted (vs a crossOrigin <img>, which can
  // still taint if the response lacks CORS headers).
  const res = await fetch(imageUrl, { mode: "cors", cache: "no-store" });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const blob = await res.blob();
  return await createImageBitmap(blob);
}

function coverCrop(
  bmp: ImageBitmap,
  target: SocialAspect,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = target.w;
  canvas.height = target.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  // Scale to COVER the target, then center-crop (no letterboxing).
  const scale = Math.max(target.w / bmp.width, target.h / bmp.height);
  const dw = bmp.width * scale;
  const dh = bmp.height * scale;
  const dx = (target.w - dw) / 2;
  const dy = (target.h - dh) / 2;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, dx, dy, dw, dh);
  return canvas;
}

function canvasToUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("toBlob failed"));
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}

/** Produce the 3 social-size crops as object URLs. Throws on CORS/decode failure. */
export async function resizeToSocialBundle(imageUrl: string): Promise<ResizedVariant[]> {
  const bmp = await loadBitmap(imageUrl);
  try {
    const out: ResizedVariant[] = [];
    for (const aspect of SOCIAL_ASPECTS) {
      const url = await canvasToUrl(coverCrop(bmp, aspect));
      out.push({ key: aspect.key, label: aspect.label, url, filename: `curify-${aspect.key}.png` });
    }
    return out;
  } finally {
    bmp.close();
  }
}

/** Slice a composite grid image into rows×cols separate tiles as object URLs.
 *  Turns the "Instagram 9-grid" single composite into 9 post-ready files instead
 *  of one image the user would have to cut up themselves. Assumes an even,
 *  gutterless grid (the ig-grid prompt renders edge-to-edge tiles for a clean
 *  slice). Throws on CORS/decode failure — the caller falls back to the composite. */
export async function sliceIntoGrid(
  imageUrl: string,
  rows = 3,
  cols = 3,
): Promise<ResizedVariant[]> {
  const bmp = await loadBitmap(imageUrl);
  try {
    const tileW = Math.floor(bmp.width / cols);
    const tileH = Math.floor(bmp.height / rows);
    const out: ResizedVariant[] = [];
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        n += 1;
        const canvas = document.createElement("canvas");
        canvas.width = tileW;
        canvas.height = tileH;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(bmp, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);
        const url = await canvasToUrl(canvas);
        out.push({ key: `tile-${n}`, label: `Tile ${n}`, url, filename: `curify-grid-${n}.png` });
      }
    }
    return out;
  } finally {
    bmp.close();
  }
}

/** Trigger a browser download for a resized variant. */
export function downloadVariant(v: ResizedVariant): void {
  const a = document.createElement("a");
  a.href = v.url;
  a.download = v.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
