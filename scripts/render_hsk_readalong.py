"""Animate approved HSK watercolor posters with existing female narration.

Cards are generated with the built-in image tool using the approved reference.
This renderer uses full-card upward movement and a Curify closing card, matching
our established reading-video format. It never adds generated text to the card.
"""
import os, subprocess, json
from pathlib import Path
import argparse, concurrent.futures
class Renderer:
    _RV_W, _RV_H, _RV_FPS, _RV_CTA_SECS = 960, 1280, 30, 3.0
    _RV_LOGO = os.environ.get("CURIFY_LOGO_PATH", os.path.expanduser("~/curify-frontend/public/curify_logo_1024.png"))
    _RV_FONT_BOLD = os.environ.get("CURIFY_FONT_BOLD", "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
    _RV_FONT_REG = os.environ.get("CURIFY_FONT_REG", "/System/Library/Fonts/Supplemental/Arial.ttf")
    _RV_FONT_CJK = os.environ.get("CURIFY_FONT_CJK", "/System/Library/Fonts/Hiragino Sans GB.ttc")
    @staticmethod
    def _audio_duration(path: Path) -> float:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
            capture_output=True, text=True).stdout.strip()
        return float(out)
    def _reading_cta(self, tmp: Path) -> str:
        from PIL import Image, ImageDraw, ImageFont
        W, H = self._RV_W, self._RV_H
        c = Image.new("RGB", (W, H), (22, 14, 40)); px = c.load()
        for y in range(H):
            t = y / H; row = (int(70 * (1 - t) + 22 * t), int(40 * (1 - t) + 14 * t), int(120 * (1 - t) + 40 * t))
            for x in range(W):
                px[x, y] = row
        d = ImageDraw.Draw(c)
        lg = Image.open(self._RV_LOGO).convert("RGBA").resize((200, 200)); c.paste(lg, ((W - 200) // 2, 360), lg)
        def ctr(txt, y, s, f, fill=(255, 255, 255)):
            ft = ImageFont.truetype(f, s); d.text(((W - d.textlength(txt, font=ft)) / 2, y), txt, font=ft, fill=fill)
        ctr("Curify", 600, 86, self._RV_FONT_BOLD)
        ctr("Read & learn Chinese", 730, 46, self._RV_FONT_REG, (226, 214, 250))
        ctr("读故事 · 学中文", 800, 44, self._RV_FONT_CJK, (226, 214, 250))
        d.rounded_rectangle([(W - 460) // 2, 940, (W + 460) // 2, 1040], radius=50, fill=(139, 92, 246))
        ctr("Start reading  ›", 968, 44, self._RV_FONT_BOLD)
        ctr("curify-ai.com", 1150, 32, self._RV_FONT_REG, (200, 190, 230))
        out = tmp / "cta.jpg"; c.save(out); return str(out)
    def _build_reading_video(self, image_path: Path, wav: Path, out: Path) -> None:
        """ffmpeg: card slowly scrolls UP (or a gentle zoom for short cards) with
        cross-fading to a Curify CTA card; narration is the audio."""
        import tempfile
        from PIL import Image
        W, H, FPS, CTA = self._RV_W, self._RV_H, self._RV_FPS, self._RV_CTA_SECS
        D = self._audio_duration(wav); total = D + CTA
        w, h = Image.open(image_path).size
        sh = round(W * h / w); sh -= sh % 2
        # The closing card goes to a temporary directory so the output
        # folder only ever receives the finished .mp4.
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            cta = self._reading_cta(tmp)
            if sh > H + 8:  # tall card -> slow upward scroll (reading focus)
                motion = f"[0:v]scale={W}:{sh},crop={W}:{H}:0:'min((ih-{H})*t/{D:.3f}, ih-{H})',format=yuv420p[rd]"
            else:  # short card -> gentle centered zoom fallback
                motion = (
                    f"[0:v]scale={W * 2}:{H * 2}:force_original_aspect_ratio=increase,crop={W * 2}:{H * 2},"
                    f"zoompan=z='min(zoom+0.0003,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
                    f"d={int(D * FPS) + FPS}:s={W}x{H}:fps={FPS},format=yuv420p[rd]")
            fc = (
                f"{motion};[rd]null[read];"
                f"[2:v]scale={W}:{H},format=yuv420p[cta];"
                f"[read][cta]xfade=transition=fade:duration=0.5:offset={D - 0.5:.3f}[v]")
            subprocess.run(
                ["ffmpeg", "-y", "-filter_complex_threads", "1", "-loop", "1", "-framerate", str(FPS), "-t", f"{D:.3f}", "-i", str(image_path),
                 "-i", str(wav), "-loop", "1", "-framerate", str(FPS), "-t", f"{CTA}", "-i", cta,
                 "-filter_complex", fc, "-map", "[v]", "-map", "1:a", "-t", f"{total:.3f}",
                 "-c:v", "libx264", "-threads", "2", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                 "-c:a", "aac", "-b:a", "192k", str(out)],
                check=True, capture_output=True, text=True)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config',type=Path,required=True)
    parser.add_argument('--cards',type=Path,required=True)
    parser.add_argument('--narration',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--only',nargs='*')
    parser.add_argument('--jobs',type=int,default=2)
    parser.add_argument('--overwrite',action='store_true')
    args=parser.parse_args()
    cards=json.loads(args.config.read_text())
    args.output.mkdir(parents=True,exist_ok=True)
    def render(c):
        rid=c['id']; image=args.cards/f'{rid}.png'; wav=args.narration/f'{rid}.wav'; out=args.output/f'{rid}.mp4'
        if args.only and rid not in args.only:return
        if out.exists() and not args.overwrite:return
        if not image.exists():raise FileNotFoundError(image)
        if not wav.exists():raise FileNotFoundError(wav)
        Renderer()._build_reading_video(image,wav,out)
        print(f'Rendered {rid}',flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        list(pool.map(render,cards))
if __name__=='__main__':main()
