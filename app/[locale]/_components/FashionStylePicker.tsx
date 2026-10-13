"use client";

import { useState } from "react";
import { trackEvent } from "@/services/useTracking";

const STYLES = [
  { name: "Minimalist", zh: "极简风", palette: "Ivory · charcoal · taupe", paletteZh: "象牙白 · 炭灰 · 灰褐", outfit: "A relaxed shirt, straight trousers and simple loafers", outfitZh: "宽松衬衫、直筒裤与简洁乐福鞋" },
  { name: "Streetwear", zh: "街头风", palette: "Black · white · cobalt", paletteZh: "黑 · 白 · 钴蓝", outfit: "An oversized tee, cargo trousers and sneakers", outfitZh: "宽大 T 恤、工装裤与运动鞋" },
  { name: "Cottagecore", zh: "田园风", palette: "Cream · sage · dusty rose", paletteZh: "奶油色 · 鼠尾草绿 · 灰粉", outfit: "A linen blouse, flowing skirt and ankle boots", outfitZh: "亚麻上衣、飘逸半裙与短靴" },
  { name: "Dark academia", zh: "暗黑学院风", palette: "Espresso · burgundy · cream", paletteZh: "咖啡棕 · 酒红 · 奶油色", outfit: "A knit vest over a shirt, tailored trousers and brogues", outfitZh: "衬衫叠穿针织背心、剪裁长裤与布洛克鞋" },
  { name: "Coastal casual", zh: "海岸休闲风", palette: "Sand · navy · white", paletteZh: "沙色 · 海军蓝 · 白", outfit: "A striped top, linen trousers and canvas shoes", outfitZh: "条纹上衣、亚麻长裤与帆布鞋" },
  { name: "Retro sport", zh: "复古运动风", palette: "Forest green · cream · rust", paletteZh: "森林绿 · 奶油色 · 铁锈红", outfit: "A track jacket, relaxed jeans and retro trainers", outfitZh: "运动夹克、宽松牛仔裤与复古跑鞋" },
];

export default function FashionStylePicker({ locale, onChoose }: {
  locale: string;
  onChoose: (params: Record<string, string>) => void;
}) {
  // Stable initial result is available in server-rendered HTML; randomize only on click.
  const [index, setIndex] = useState(0);
  const zh = locale === "zh";
  const style = STYLES[index];
  const track = (action: string) => trackEvent({ contentId: `fashion-style:${action}`, contentType: "menu_link", actionType: "click" });
  return (
    <section className="mb-8 rounded-2xl border border-purple-200 bg-purple-50 p-6" aria-labelledby="fashion-picker-title">
      <h2 id="fashion-picker-title" className="text-2xl font-bold text-neutral-900">{zh ? "随机穿搭风格生成器" : "Fashion genre generator"}</h2>
      <p className="mt-2 text-neutral-700">{zh ? "免费选一个风格、配色和单品组合，无需登录。喜欢这个方向？将它带入下方照片穿搭工具。" : "Pick a free outfit style, palette and clothing combination—no sign-in needed. Like the direction? Use it in the photo outfit tool below."}</p>
      <div className="my-5 rounded-xl bg-white p-5" aria-live="polite" aria-atomic="true">
        <h3 className="text-xl font-semibold">{zh ? style.zh : style.name}</h3>
        <p className="mt-2">{zh ? style.paletteZh : style.palette}</p>
        <p className="mt-2">{zh ? style.outfitZh : style.outfit}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="rounded-lg bg-purple-700 px-4 py-3 font-semibold text-white" onClick={() => {
          setIndex((current) => (current + 1 + Math.floor(Math.random() * (STYLES.length - 1))) % STYLES.length);
          track("pick");
        }}>{zh ? "换一个风格" : "Pick another style"}</button>
        <button type="button" className="rounded-lg border border-purple-700 bg-white px-4 py-3 font-semibold text-purple-800" onClick={() => {
          onChoose({ styles: `${style.name} (${style.palette}; ${style.outfit})` });
          track("use");
          document.getElementById("reproduce")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}>{zh ? "用这个风格试穿" : "Use this style on my photo"}</button>
      </div>
      <p className="mt-3 text-sm text-neutral-600">{zh ? "照片生成需要上传人物照片，并按工具显示的积分规则收费；选风格本身免费。" : "Photo generation requires a reference photo and follows the tool’s displayed credit pricing. Picking a style is free."}</p>
    </section>
  );
}
