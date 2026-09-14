/**
 * 夏可 — round-3 delivery package: 9 watermarked images in two colour-temperature
 * sets, zipped.
 *
 * WHY THE TEMPERATURE IS GRADED, NOT GENERATED
 * --------------------------------------------
 * The client's complaint was not "this frame is the wrong colour" — it was that
 * the two studio frames DID NOT MATCH EACH OTHER (一张冷色调一张暖色调前面不一致).
 * Re-rolling the generator cannot fix that: two independent renders never land on
 * the same white balance, which is how the mismatch happened in the first place.
 * So both studio frames are rendered on a NEUTRAL seamless and the warm and cool
 * variants are produced by applying the SAME channel transform to each. That
 * makes the match exact by construction rather than by luck, which is the whole
 * point of the request 「这样有两套」.
 *
 * The 外景 frames are untouched and shared by both sets — the client scoped the
 * complaint to 棚拍.
 *
 * Grade first, watermark second: the mark is a low-opacity coloured logo and
 * grading after stamping would tint it differently in each set.
 *
 *   node scripts/oneoff_xiake_package_2026-09-10.cjs
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { applyTiledWatermark } = require("./lib/watermark.cjs");

const REQ = "/Users/qqwjq/curify-gallery/client_VC_portfolio/夏可测试（一套5张）";
const OUT = path.join(REQ, "output");
const PKG_NAME = "夏可_全套重出_2026-09-14";
const PKG = path.join(OUT, PKG_NAME);

// Channel multipliers. Modest — a ~5% R/B swing reads unmistakably as a
// temperature change while keeping skin plausible and leaving the powder-blue
// knit still blue. Applied identically to every frame in a set.
const GRADE = {
  暖色调: "-channel R -evaluate multiply 1.055 -channel G -evaluate multiply 1.006 -channel B -evaluate multiply 0.940 +channel",
  冷色调: "-channel R -evaluate multiply 0.976 -channel G -evaluate multiply 0.995 -channel B -evaluate multiply 1.032 +channel",
};

// source render -> delivered basename, per set
const STUDIO = [
  // 2026-09-14 full rebuild on the corrected fabric + corrected 1.06:1 leg ratio.
  { src: "front-final.png", name: "01-棚拍-正面" },
  { src: "shot-2-studio-01.png", name: "02A-棚拍-背面-版本A" },
  { src: "shot-2-studio-04.png", name: "02B-棚拍-背面-版本B" },
];
const OUTDOOR = [
  { src: "shot-3-outdoor-01.png", name: "03-外景-街角店铺" },
  { src: "shot-4-outdoor-02.png", name: "04-外景-墙边光影" },
  { src: "shot-5-outdoor-02.png", name: "05-外景-林荫人行道" },
];

const WM = { logoPct: 0.2, spacingFactor: 2.1, opacity: 0.13, rotate: -30 };

// Delivered as JPEG q94 with 4:4:4 chroma, not PNG. The nine 4K PNGs come to
// 161 MB, which is impractical to send; q94 gives ~2.6 MB each. Checked at 1:1
// on the broad-rib knit — the hardest thing here for a DCT codec — against the
// PNG: RMSE 0.56%, rib, buttons and placket indistinguishable. 4:4:4 rather than
// the default 4:2:0 because the rib is fine vertical detail. Lossless PNG
// masters stay in output/ if the client ever wants them.
function stamp(src, dest) {
  const wm = dest + ".wm.png";
  try {
    applyTiledWatermark(src, wm, WM);
    execSync(`magick "${wm}" -quality 94 -sampling-factor 1x1 "${dest}"`, { stdio: "pipe" });
  } finally {
    try { fs.unlinkSync(wm); } catch (_) {}
  }
}

function fresh(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

fresh(PKG);
const tmp = path.join(OUT, ".pkg-tmp");
fresh(tmp);

let n = 0;

// 外景 — shared by both sets, no grade
const dirOut = path.join(PKG, "外景（两套共用）");
fs.mkdirSync(dirOut, { recursive: true });
for (const f of OUTDOOR) {
  const src = path.join(OUT, f.src);
  if (!fs.existsSync(src)) throw new Error(`missing ${src}`);
  stamp(src, path.join(dirOut, `${f.name}.jpg`));
  n++;
  process.stdout.write(`外景  ${f.name}\n`);
}

// 棚拍 — one folder per temperature, same transform across the folder
for (const [tone, expr] of Object.entries(GRADE)) {
  const dir = path.join(PKG, `棚拍-${tone}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of STUDIO) {
    const src = path.join(OUT, f.src);
    if (!fs.existsSync(src)) throw new Error(`missing ${src}`);
    const graded = path.join(tmp, `${f.name}-${tone}.png`);
    execSync(`magick "${src}" ${expr} "${graded}"`, { stdio: "pipe" });
    stamp(graded, path.join(dir, `${f.name}-${tone}.jpg`));
    n++;
    process.stdout.write(`棚拍  ${f.name}-${tone}\n`);
  }
}

const readme = `夏可 AI 出图 — 第五轮交付（全套重出）
生成日期：2026-09-14
尺寸：3:4，3584 x 4800（4K），全部带水印

共 9 张 = 外景 3 张 + 棚拍正面 2 张 + 棚拍背面 4 张

【这一轮和前几轮不一样：九张全部重出，不是只改背面】
  前三轮每次都按意见修一个具体细节（补上侧面抽褶 → 改抽褶形状 → 改领型），
  每次都改对了，但贵司每次的回复都还是「细节还是不太还原」。
  第四次收到同样的回复后，我们改为「量」而不是「看」：
  从平铺图和出图上各取同一比例的一块布，统一缩放后测竖条的起伏幅度。
  结果是——**条纹的间距一直是对的，起伏深了约三倍**。
  实物是「平整细腻的平纹地 + 几道细窄的凸起竖线」，
  我们之前一直做成了「带深沟的粗罗纹」。

  这个差异铺满整件衣服、每一张图都有，所以它不会表现为某一处的错，
  只会表现为一句笼统的「不够还原」——这也是它能连着三轮没被发现的原因。
  规格已按实测改正，本轮九张全部按新规格重出，包括三张外景。

【同时一并改正的】
  裤型：之前写成「裤脚约为膝宽的一半」，实测平铺图是约 1.06:1
  （最宽处到裤脚只收约 6%）。桶型靠的是外侧缝的外凸弧线，不是收脚。
  之前的图把裤脚收得过紧，本轮已改为实测比例，裤腿更饱满。

  下摆与裤腰的关系：改为「针织下摆正好落在裤腰上沿，两者相接、不露腰」，
  避免上一版出现的两种偏差（下摆盖住裤腰 / 变成露腰短款）。

【色温：冷暖两套仍然一致】
  两张棚拍图出在同一个中性背景上，冷暖两套由同一组参数统一调色得到，
  因此同一套里正面与背面色温完全一致。外景 3 张两套共用。

【背面仍提供 A / B 两版】
  细节做法一致，差别只在姿态与头发，请选其一。
  两侧抽褶、翻领、下摆起拱均按 SWGQ305139022 第 2 张后片平铺图。

【仍待确认】
  1. 包上的毛球挂饰按「季节搭配」一条去掉了，如需保留请告知。
  2. 鞋 / 包 / 耳环按参考图的款式还原，未复制其上的品牌标识。
  3. 如贵司有该款的尺寸表（衣长 / 胸围 厘米数），我们可以把「还原度」
     从目测改为按数值核对。
`;
fs.writeFileSync(path.join(PKG, "说明.txt"), readme, "utf-8");

fs.rmSync(tmp, { recursive: true, force: true });

const zip = `${PKG}.zip`;
fs.rmSync(zip, { force: true });
// Apple's Info-ZIP 3.0 writes raw UTF-8 bytes WITHOUT setting the general-purpose
// UTF-8 flag and rejects -UN=UTF8, so a Windows client reads every CJK name as
// GBK mojibake. Python's zipfile sets bit 11 for non-ASCII names automatically.
// JSON.stringify()ing the script into `python3 -c` turns every newline into a
// literal backslash-n, which python reads as a line-continuation error. Write it
// to a file and run the file.
const pyFile = path.join(OUT, ".zip_utf8.py");
fs.writeFileSync(pyFile, [
  "import os, zipfile",
  `root = ${JSON.stringify(OUT)}`,
  `name = ${JSON.stringify(PKG_NAME)}`,
  'with zipfile.ZipFile(os.path.join(root, name + ".zip"), "w", zipfile.ZIP_DEFLATED) as z:',
  "    for dirpath, _, files in os.walk(os.path.join(root, name)):",
  "        for f in sorted(files):",
  "            full = os.path.join(dirpath, f)",
  "            z.write(full, os.path.relpath(full, root))",
].join("\n"), "utf-8");
execSync(`python3 "${pyFile}"`, { stdio: "inherit" });
fs.unlinkSync(pyFile);

console.log(`\n${n} watermarked images -> ${PKG}`);
console.log(`zip: ${zip}`);
