/**
 * Deliverable-type routing — the replacement for "calibrate abstention" (P0-A).
 *
 * Measured on the 100-query benchmark, the matcher's confidence carries almost
 * no coverage information: gap queries average 0.76 against direct's 0.82, a
 * separation of +0.065. No threshold can split them, and forcing the model to
 * abstain harder just rejected good and bad queries alike (direct match-rate
 * 100% -> 63% for no separation gain).
 *
 * The reason is that "gap" does not mean out-of-domain. Of the 23 gap queries:
 *   13  brand / VI systems      ("complete visual identity for a tea brand")
 *    6  photo editing or batch  ("replace the white background", "20 SKUs")
 *    4  cultural-IP merch       ("Dunhuang motif on scarves and totes")
 * Every one is achievable — none is a single-template job. A brand-VI query
 * legitimately has a decent partial match, which is exactly why confidence
 * cannot separate it.
 *
 * So the useful question is not "should I abstain?" but "what KIND of job is
 * this?". A low single-template score becomes signal — "not a one-template
 * job" — instead of a reason to give up.
 */
import { WORKFLOWS_BY_DOMAIN } from "@/lib/topic_workflows";

export type DeliverableType =
  /** one template produces the whole deliverable */
  | "single"
  /** a multi-asset system — expand the matching workflow ladder */
  | "system"
  /** modify an existing image — needs a reference, runs image-to-image */
  | "edit"
  /** N variants of one thing — generate then compose */
  | "batch"
  /** genuinely outside an image-template catalog */
  | "unsupported";

export type DeliverableRoute = {
  type: DeliverableType;
  /** for "system": which ladder to expand */
  domain?: string;
  /** for "batch": how many cells were asked for */
  count?: number;
  /** shown to the user — why the agent chose this shape of plan */
  rationale: string;
};

/** Whole-system asks: several coordinated assets, not one artifact. */
const SYSTEM_RE =
  /\b(vi|visual identity|brand identity|design system|identity system|brand kit|full set|whole set)\b|完整|整套|全套|系统|视觉识别|品牌视觉|品牌形象|系列/i;

/**
 * Edits act on an image the user already has.
 *
 * The 21q eval (spec §7o class A) had 7 cases where the agent "completely
 * ignored the supplied source image and replaced it with an entirely new
 * design". The edit BRANCH was fine — it routes to image-to-image. Detection
 * was the hole: this pattern matched only 3 of 12 edit-shaped queries, so the
 * rest fell through to template text-to-image and got redrawn.
 *
 * The tell is that the two it did match — "香水瓶玻璃质感精修" and
 * "金属五金工具产品细节增强" — are the two whose outputs actually edited the
 * source. Everything it missed was rewritten from scratch.
 *
 * Split in two because they are different asks that share one requirement
 * (consume the source):
 *   MODIFY  — change something about this image (resize, move, recolour, swap)
 *   BOUND   — the output must contain the supplied subject (try-on, "my photo")
 *
 * Both are gated on hasImage below, which is what keeps them from swallowing
 * ordinary generation. Deliberately NOT included: bare "做成"/"make into",
 * which would misfire on "把这个贴纸做成模切刀线的生产文件" (an export, AR-010).
 */
const EDIT_MODIFY_RE =
  /\b(replace|remove|swap|retouch|enhance|upscale|background|relight|bigger|larger|smaller|brighten|recolou?r|reposition|move it|crop)\b|change the (colou?r|background)|换背景|换个?背景|背景色|替换|精修|修图|去背|抠图|增强|质感|细节增强|放大|缩小|调大|调小|移到|挪到|调整/i;

/** The deliverable must contain the person/garment the user supplied. */
const EDIT_BOUND_RE =
  /\btry[\s-]?on\b|\blookbook\b|\bmy photo\b|\bon me\b|试穿|穿上|我的照片|用我的|自拍|前后对比/i;

const EDIT_RE = new RegExp(`${EDIT_MODIFY_RE.source}|${EDIT_BOUND_RE.source}`, "i");

/**
 * Asks to JUDGE supplied candidates, not to change them.
 *
 * These must never be read as edits. "这4款包装，站在消费者角度哪款更有质感？"
 * contains 质感, which is an edit token, and today it only escapes because
 * BATCH_RE ("4款") happens to match first — swap those two checks and the case
 * silently becomes an edit. Depending on rule order for correctness is the kind
 * of thing that breaks a year later, so the exclusion is explicit.
 *
 * This is a GUARD, not the eventual fix. §7o class B (4 cases) needs a real
 * evaluate/rank deliverable type; until then these fall through to the normal
 * path rather than being mis-routed to image-to-image.
 */
const EVALUATE_RE =
  /\bvote\b|\brank\b|which (one )?is better|\bcritique\b|投票|评审|打分|哪款|哪个更|选出|排序|优劣/i;

/** Batch asks name a count or a variant axis. */
const BATCH_RE = /(\d{1,3})\s*(?:个|张|款|种|色|sku|skus|variants?|colou?rways?|items?|cells?)/i;

/** Things an image-template catalog genuinely cannot produce. */
const UNSUPPORTED_RE =
  /\b(cad|step file|stl|parametric|engineering drawing|3d model|animation|video edit|source code|web ?app)\b|参数化建模|工程图|源代码/i;

/** Distinct named design assets. Two or more = a system, not one artifact. */
const ASSET_NOUNS: RegExp[] = [
  /\blogos?\b|标志|徽标/i,
  /\b(typeface|font|typography)\b|字体/i,
  /\b(colou?r|palette|swatch)\b|配色|色板|色彩规范/i,
  /\b(packaging|box)\b|包装|礼盒/i,
  /\b(business card|stationery|letterhead)\b|名片|信纸|文具/i,
  /\b(poster|banner)\b|海报|banner/i,
  /\b(sticker|badge|tote|mug|phone case)\b|贴纸|徽章|帆布包|马克杯|手机壳/i,
  /\b(signage|wayfinding)\b|导视|门头/i,
];

const DOMAIN_RE: Array<[string, RegExp]> = [
  ["brand", /\b(brand|logo|vi|identity|typeface|palette)\b|品牌|logo|标志|字体|配色|视觉识别/i],
  ["packaging", /\b(packaging|box|label|dieline|carton)\b|包装|礼盒|标签|刀版/i],
  ["merch", /\b(merch|sticker|tote|mug|keychain|badge|goods)\b|周边|贴纸|徽章|帆布包|文创|谷子/i],
  ["education", /\b(worksheet|flashcard|lesson|vocabulary|quiz)\b|教学|单词|识字|练习|课件/i],
  ["product", /\b(product|listing|e-?commerce|detail page|sku)\b|商品|详情页|电商|主图/i],
];

function pickDomain(query: string): string {
  for (const [domain, re] of DOMAIN_RE) {
    if (re.test(query) && WORKFLOWS_BY_DOMAIN[domain]) return domain;
  }
  return "merch";
}

/**
 * Classify a request by the SHAPE of deliverable it needs.
 *
 * Deterministic on purpose: these signals are lexically explicit (a count, the
 * word "complete", "replace the background"), and a rules pass is auditable and
 * free. `topConfidence` is used only as a tie-breaker — a strong single-template
 * match beats a weak system signal.
 */
export function classifyDeliverable(
  query: string,
  opts: { hasImage?: boolean; topConfidence?: number } = {},
): DeliverableRoute {
  const { hasImage = false, topConfidence = 0 } = opts;

  if (UNSUPPORTED_RE.test(query)) {
    return {
      type: "unsupported",
      rationale:
        "This asks for an artifact an image-template catalog can't produce (CAD/3D/code/video).",
    };
  }

  const batch = query.match(BATCH_RE);
  const count = batch ? Number(batch[1]) : 0;
  if (count >= 3 && count <= 200) {
    return {
      type: "batch",
      count,
      rationale: `Asks for ${count} items — generate the cells separately, then compose. One generation can't emit an exact count.`,
    };
  }

  // An edit needs something to edit. Without a reference image it is really a
  // "make me one of these" request, so fall through to the normal path.
  if (EDIT_RE.test(query) && hasImage && !EVALUATE_RE.test(query)) {
    return {
      type: "edit",
      rationale: EDIT_BOUND_RE.test(query)
        ? "Has to use the photo you supplied — runs image-to-image so the subject survives."
        : "Modifies an existing image — runs image-to-image from your reference.",
    };
  }

  // Enumerating several named asset types is a system request even without the
  // word "complete" — "logo, 字体和配色" is three deliverables, not one.
  const enumerated = ASSET_NOUNS.filter((re) => re.test(query)).length;

  // An EXPLICIT system request ("complete visual identity system") wins outright:
  // the user told us the shape, and no single-template score should override a
  // stated requirement. The enumeration heuristic is a weaker inference, so it
  // defers to a very strong single match. (Getting this backwards made TIQ-003
  // flip to "single" whenever the matcher's confidence drifted over 0.9.)
  if (SYSTEM_RE.test(query) || (enumerated >= 2 && topConfidence < 0.9)) {
    const domain = pickDomain(query);
    return {
      type: "system",
      domain,
      rationale: `Asks for a coordinated set, not one artifact — expanding the ${WORKFLOWS_BY_DOMAIN[domain].heading.toLowerCase()}.`,
    };
  }

  return { type: "single", rationale: "A single template produces this deliverable." };
}
