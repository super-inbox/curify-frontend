#!/bin/bash
# Build a 5-page A4-portrait PDF portfolio for the tea packaging workflow
# demo, following the visual DNA of raw/brand-design-portfolio/intro-to-merch/
# (Curify brand deck): cream base + navy header blocks + gold accents,
# big Chinese title with English subtitle underneath.
#
# Pages:
#   1. Cover                — 「东方植物草本风」提案工作流
#   2. 提案前置 · Moodboard   — 3 direction moodboards
#   3. 中期控管 · Variable    — 10/20/30% subject scale
#   4. 后期落地 · Print       — paper cup / tote / gift box
#   5. 合作模式 · Partnership — value prop + CTA
#
# Requires: ImageMagick 7 (magick), a system CJK font.

set -e
cd "$(dirname "$0")/../raw/brand-design-portfolio"

W=1240
H=1750
CREAM='#F5EFE3'
NAVY='#1B2757'
GOLD='#C9A24C'
INK='#2C2A25'
MUTED='#7A736A'
CJK_FONT=$(fc-list :lang=zh 2>/dev/null | head -1 | cut -d: -f1)
[ -z "$CJK_FONT" ] && CJK_FONT='/System/Library/Fonts/STHeiti Medium.ttc'
echo "CJK: $CJK_FONT"

mkdir -p _pdf
rm -f _pdf/*.jpg _pdf/*.png

# ── helpers ───────────────────────────────────────────────────────────
# navy header block — 210px tall, cream text
header_block () {
  local OUT=$1 CN=$2 EN=$3 KICKER=$4
  magick -size ${W}x210 xc:"$NAVY" \
    -font "$CJK_FONT" -pointsize 22 -fill "$GOLD" \
      -gravity northwest -annotate +64+40 "$KICKER" \
    -font "$CJK_FONT" -pointsize 56 -fill "$CREAM" \
      -gravity northwest -annotate +64+70 "$CN" \
    -font "$CJK_FONT" -pointsize 20 -fill "#B5B4C5" \
      -gravity northwest -annotate +64+150 "$EN" \
    -fill "$GOLD" -draw "rectangle 62,142 190,146" \
    "$OUT"
}

# footer stripe — 90px tall, "Curify · <PAGE X of 5>"
footer_block () {
  local OUT=$1 PAGE=$2
  magick -size ${W}x90 xc:"$CREAM" \
    -font "$CJK_FONT" -pointsize 22 -fill "$NAVY" \
      -gravity west -annotate +64+0 "Curify · 敏捷视觉内容引擎" \
    -font "$CJK_FONT" -pointsize 20 -fill "$MUTED" \
      -gravity east -annotate +64+0 "$PAGE / 5" \
    "$OUT"
}

# decorative spacer with pull-quote — fills bottom of content pages
spacer_quote () {
  local OUT=$1 QUOTE_CN=$2 QUOTE_EN=$3
  magick -size ${W}x480 xc:"$CREAM" \
    -fill "$GOLD" -draw "line 480,120 760,120" \
    -font "$CJK_FONT" -pointsize 44 -fill "$NAVY" \
      -gravity center -annotate +0-40 "$QUOTE_CN" \
    -font "$CJK_FONT" -pointsize 22 -fill "$MUTED" \
      -gravity center -annotate +0+30 "$QUOTE_EN" \
    -fill "$GOLD" -draw "line 480,290 760,290" \
    "$OUT"
}

# labeled content tile — image with a small caption strip on top
tile_labeled () {
  local IN=$1 OUT=$2 LABEL=$3
  # inner content 380 wide, image 380x475, caption strip 380x48
  magick -size 380x48 xc:"$CREAM" \
    -font "$CJK_FONT" -pointsize 18 -fill "$INK" \
      -gravity west -annotate +8+0 "$LABEL" \
    _pdf/_cap.jpg
  magick "$IN" -resize 380x475 -background "$CREAM" -gravity center -extent 380x475 _pdf/_img.jpg
  magick _pdf/_cap.jpg _pdf/_img.jpg -append "$OUT"
  rm -f _pdf/_cap.jpg _pdf/_img.jpg
}

# ── PAGE 1 · COVER ────────────────────────────────────────────────────
# Cream background, navy vertical band on left, big centered CN title,
# EN subtitle, hero moodboard image, Curify wordmark.

# Left navy vertical band (120px wide, full height)
magick -size 120x${H} xc:"$NAVY" \
  -font "$CJK_FONT" -pointsize 36 -fill "$GOLD" \
    -gravity center -rotate -90 -annotate +0+0 "案例展示 · 工作流演示 · 2026" \
  -rotate 90 \
  _pdf/p1_band.jpg

# Cover content area (1120px wide, full height)
magick -size $((W-120))x${H} xc:"$CREAM" \
  -font "$CJK_FONT" -pointsize 30 -fill "$GOLD" \
    -gravity north -annotate +0+180 "CASE STUDY · WORKFLOW DEMO" \
  -font "$CJK_FONT" -pointsize 76 -fill "$NAVY" \
    -gravity north -annotate +0+250 "「东方植物草本风」" \
  -font "$CJK_FONT" -pointsize 76 -fill "$NAVY" \
    -gravity north -annotate +0+360 "茶饮包装 · 提案工作流" \
  -fill "$GOLD" -draw "rectangle 460,490 660,494" \
  -font "$CJK_FONT" -pointsize 28 -fill "$MUTED" \
    -gravity north -annotate +0+520 "Oriental Botanical Herbal Tea — End-to-End Brand Design Workflow" \
  _pdf/p1_body.jpg

# Hero image (moodboard zen, cropped)
magick panel1_moodboard_zen.jpg -resize 800x -gravity center -extent 800x900 _pdf/p1_hero.jpg
# Overlay hero on body around y=650
magick _pdf/p1_body.jpg _pdf/p1_hero.jpg -gravity north -geometry +0+620 -composite _pdf/p1_body.jpg

# Curify wordmark at bottom
magick _pdf/p1_body.jpg \
  -font "$CJK_FONT" -pointsize 36 -fill "$NAVY" \
    -gravity south -annotate +0+130 "Curify · 敏捷视觉内容引擎" \
  -font "$CJK_FONT" -pointsize 22 -fill "$MUTED" \
    -gravity south -annotate +0+95 "Agile Visual Content Engine" \
  -fill "$GOLD" -draw "rectangle 500,150 620,154" \
  _pdf/p1_body.jpg

# Combine band + body
magick _pdf/p1_band.jpg _pdf/p1_body.jpg +append _pdf/page1.jpg


# ── PAGE 2 · MOODBOARDS ───────────────────────────────────────────────
header_block _pdf/p2_hdr.jpg "提案前置 · 情绪板探索" "PANEL 1 · INTENT EXPLORATION · MOODBOARDS" "01"

# Intro paragraph strip (~180px)
magick -size ${W}x180 xc:"$CREAM" \
  -font "$CJK_FONT" -pointsize 26 -fill "$INK" \
    -gravity northwest -annotate +64+30 "针对同一需求，同时输出 3 个不同排版与色调的情绪板方向。" \
  -font "$CJK_FONT" -pointsize 26 -fill "$INK" \
    -gravity northwest -annotate +64+72 "不再依赖 Pinterest 拼贴 — 一次生成，直接提案。" \
  -font "$CJK_FONT" -pointsize 20 -fill "$MUTED" \
    -gravity northwest -annotate +64+120 "3 direction options · 1 brief · seconds to generate. No more moodboard scraping." \
  _pdf/p2_intro.jpg

# 3 tiles side by side
tile_labeled panel1_moodboard_zen.jpg        _pdf/p2_t1.jpg "① 禅意留白 · ZEN MINIMALIST"
tile_labeled panel1_moodboard_apothecary.jpg _pdf/p2_t2.jpg "② 本草古方 · APOTHECARY VINTAGE"
tile_labeled panel1_moodboard_modern.jpg     _pdf/p2_t3.jpg "③ 东方摩登 · MODERN ORIENTAL"
magick _pdf/p2_t1.jpg _pdf/p2_t2.jpg _pdf/p2_t3.jpg +append -bordercolor "$CREAM" -border 20x20 -background "$CREAM" -gravity center -extent ${W}x _pdf/p2_row.jpg

# Bottom takeaway block
magick -size ${W}x220 xc:"$CREAM" \
  -fill "$GOLD" -draw "rectangle 64,20 90,24" \
  -font "$CJK_FONT" -pointsize 24 -fill "$NAVY" \
    -gravity northwest -annotate +64+40 "价值传递" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +64+80 "· 客户提案效率 × 3 — 一份 brief，同步 3 个方向。" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +64+118 "· 视觉一致的成套排版 — 主视觉 + 色规 + 材质意向同框。" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +64+156 "· 输出即可直接发给客户定方向，无需二次排版。" \
  _pdf/p2_takeaway.jpg

spacer_quote _pdf/p2_spc.jpg "一份 brief · 三个方向 · 秒级出稿" "One brief. Three directions. Seconds, not days."
footer_block _pdf/p2_ftr.jpg "02"
magick _pdf/p2_hdr.jpg _pdf/p2_intro.jpg _pdf/p2_row.jpg _pdf/p2_takeaway.jpg _pdf/p2_spc.jpg _pdf/p2_ftr.jpg -append -background "$CREAM" -gravity north -extent ${W}x${H} +repage _pdf/page2.jpg


# ── PAGE 3 · VARIABLE TUNING ──────────────────────────────────────────
header_block _pdf/p3_hdr.jpg "中期控管 · 变量微调" "PANEL 2 · PRECISION CONTROL · SUBJECT SCALE" "02"

magick -size ${W}x180 xc:"$CREAM" \
  -font "$CJK_FONT" -pointsize 26 -fill "$INK" \
    -gravity northwest -annotate +64+30 "选定方向后，可精确控制单一变量 — 例如画面主体占比。" \
  -font "$CJK_FONT" -pointsize 26 -fill "$INK" \
    -gravity northwest -annotate +64+72 "不再抽卡式重生成 — 参数即所得。" \
  -font "$CJK_FONT" -pointsize 20 -fill "$MUTED" \
    -gravity northwest -annotate +64+120 "One knob at a time — same asset, three subject-scale ratios. No gacha regeneration." \
  _pdf/p3_intro.jpg

tile_labeled panel2_ratio_10.jpg _pdf/p3_t1.jpg "主体占比 · 10% · SUBJECT 10%"
tile_labeled panel2_ratio_20.jpg _pdf/p3_t2.jpg "主体占比 · 20% · SUBJECT 20%"
tile_labeled panel2_ratio_30.jpg _pdf/p3_t3.jpg "主体占比 · 30% · SUBJECT 30%"
magick _pdf/p3_t1.jpg _pdf/p3_t2.jpg _pdf/p3_t3.jpg +append -bordercolor "$CREAM" -border 20x20 -background "$CREAM" -gravity center -extent ${W}x _pdf/p3_row.jpg

magick -size ${W}x220 xc:"$CREAM" \
  -fill "$GOLD" -draw "rectangle 64,20 90,24" \
  -font "$CJK_FONT" -pointsize 24 -fill "$NAVY" \
    -gravity northwest -annotate +64+40 "价值传递" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +64+80 "· 面对客户 "画面主体再大点/小点" 的要求，可精确响应。" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +64+118 "· 视觉、色调、构图保持一致 — 只有变量在移动。" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +64+156 "· 提案改稿从 "重画" 变成 "调档" — 交付周期 × 2 加速。" \
  _pdf/p3_takeaway.jpg

spacer_quote _pdf/p3_spc.jpg "一次调档 · 同一构图 · 变量所得" "Move one knob. Keep the composition. Get exactly what you asked for."
footer_block _pdf/p3_ftr.jpg "03"
magick _pdf/p3_hdr.jpg _pdf/p3_intro.jpg _pdf/p3_row.jpg _pdf/p3_takeaway.jpg _pdf/p3_spc.jpg _pdf/p3_ftr.jpg -append -background "$CREAM" -gravity north -extent ${W}x${H} +repage _pdf/page3.jpg


# ── PAGE 4 · PRINT MOCKUPS ────────────────────────────────────────────
header_block _pdf/p4_hdr.jpg "后期落地 · 自动化模版延展" "PANEL 3 · PRINT-READY MOCKUPS" "03"

magick -size ${W}x180 xc:"$CREAM" \
  -font "$CJK_FONT" -pointsize 26 -fill "$INK" \
    -gravity northwest -annotate +64+30 "选定的视觉直接套用 Curify 2D 打印模版：" \
  -font "$CJK_FONT" -pointsize 26 -fill "$INK" \
    -gravity northwest -annotate +64+72 "双层纸杯、手提袋、天地盖礼盒 — 全部对接打样标准。" \
  -font "$CJK_FONT" -pointsize 20 -fill "$MUTED" \
    -gravity northwest -annotate +64+120 "Straight to production — paper cup, tote, lid-and-base gift box." \
  _pdf/p4_intro.jpg

tile_labeled panel3_mockup_cup.jpg _pdf/p4_t1.jpg "延展 01 · 双层纸杯 · PAPER CUP"
tile_labeled panel3_mockup_bag.jpg _pdf/p4_t2.jpg "延展 02 · 手提袋 · TOTE BAG"
tile_labeled panel3_mockup_box.jpg _pdf/p4_t3.jpg "延展 03 · 天地盖礼盒 · GIFT BOX"
magick _pdf/p4_t1.jpg _pdf/p4_t2.jpg _pdf/p4_t3.jpg +append -bordercolor "$CREAM" -border 20x20 -background "$CREAM" -gravity center -extent ${W}x _pdf/p4_row.jpg

magick -size ${W}x220 xc:"$CREAM" \
  -fill "$GOLD" -draw "rectangle 64,20 90,24" \
  -font "$CJK_FONT" -pointsize 24 -fill "$NAVY" \
    -gravity northwest -annotate +64+40 "价值传递（最具杀伤力的一招）" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +64+82 "· 生成不再止于效果图 — 直接对接打样标准与线稿。" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +64+120 "· 涵盖新消费高频包材：纸杯 / 手提袋 / 礼盒 / 标签 / 罐贴。" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +64+158 "· 从提案到打样 — 客户签字后当天出稿。" \
  _pdf/p4_takeaway.jpg

spacer_quote _pdf/p4_spc.jpg "从概念到打样 · 一次完成" "From concept to print-ready — one workflow, one afternoon."
footer_block _pdf/p4_ftr.jpg "04"
magick _pdf/p4_hdr.jpg _pdf/p4_intro.jpg _pdf/p4_row.jpg _pdf/p4_takeaway.jpg _pdf/p4_spc.jpg _pdf/p4_ftr.jpg -append -background "$CREAM" -gravity north -extent ${W}x${H} +repage _pdf/page4.jpg


# ── PAGE 5 · PARTNERSHIP CTA ──────────────────────────────────────────
header_block _pdf/p5_hdr.jpg "合作模式 · 共创机制" "PARTNERSHIP · WORK WITH CURIFY" "04"

# Value proposition block (3 tiers, similar to reference page 5)
magick -size ${W}x1200 xc:"$CREAM" \
  \( -size 1080x330 xc:"#F1EAD8" -bordercolor "#E6DFCE" -border 2x2 \) \
    -gravity north -geometry +0+80 -composite \
  \( -size 1080x330 xc:"#F1EAD8" -bordercolor "#E6DFCE" -border 2x2 \) \
    -gravity north -geometry +0+430 -composite \
  \( -size 1080x330 xc:"#F1EAD8" -bordercolor "#E6DFCE" -border 2x2 \) \
    -gravity north -geometry +0+780 -composite \
  -font "$CJK_FONT" -pointsize 76 -fill "$GOLD" \
    -gravity northwest -annotate +100+95 "1." \
  -font "$CJK_FONT" -pointsize 34 -fill "$NAVY" \
    -gravity northwest -annotate +230+120 "敏捷试错包（普通商用授权）" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +230+180 "从现有风格库中按需挑选，按幅普通商用授权。" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +230+220 "适合电商商家批量试款、测款 — 数十元/幅起。" \
  \
  -font "$CJK_FONT" -pointsize 76 -fill "$GOLD" \
    -gravity northwest -annotate +100+445 "2." \
  -font "$CJK_FONT" -pointsize 34 -fill "$NAVY" \
    -gravity northwest -annotate +230+470 "命题风格定制（独家买断授权）" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +230+530 "基于品牌调性定制专属视觉库 — 国潮、治愈、办公桌等。" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +230+570 "全版权买断，打造专属视觉壁垒。" \
  \
  -font "$CJK_FONT" -pointsize 76 -fill "$GOLD" \
    -gravity northwest -annotate +100+795 "3." \
  -font "$CJK_FONT" -pointsize 34 -fill "$NAVY" \
    -gravity northwest -annotate +230+820 "供应链 / SaaS API 深度接入" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +230+880 "为中大型定制化平台提供 API 接口对接服务。" \
  -font "$CJK_FONT" -pointsize 22 -fill "$INK" \
    -gravity northwest -annotate +230+920 "实现图片选版、排版、生成的自动化 — 无缝融入业务流程。" \
  _pdf/p5_body.jpg

footer_block _pdf/p5_ftr.jpg "05"
magick _pdf/p5_hdr.jpg _pdf/p5_body.jpg _pdf/p5_ftr.jpg -append -background "$CREAM" -gravity north -extent ${W}x${H} +repage _pdf/page5.jpg


# ── Verify + assemble PDF ─────────────────────────────────────────────
for f in _pdf/page{1..5}.jpg; do
  identify -format "  %f  %wx%h  %b\n" "$f"
done

magick _pdf/page1.jpg _pdf/page2.jpg _pdf/page3.jpg _pdf/page4.jpg _pdf/page5.jpg \
  -quality 90 -density 150 workflow_demo_portfolio.pdf

ls -la workflow_demo_portfolio.pdf
echo ""
echo "Portfolio → raw/brand-design-portfolio/workflow_demo_portfolio.pdf"
