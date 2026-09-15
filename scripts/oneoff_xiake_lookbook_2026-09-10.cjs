/**
 * 夏可 SA·SANQUA — 一套5张 on-model lookbook (SWGQ305139022 上身 + SWGQ110019014 下身).
 *
 * Successor to curify-studio/dev/jayw/design-agent-v0/tools/model-swap/model_swap.py.
 * Same core discipline — the flatlay owns the clothing, nothing else does — with two
 * changes the 夏可 brief forces:
 *
 *   1. The model is FIXED (their own AI model sheet, headshots only), so body
 *      proportions have to come from the prompt rather than from a pose photo.
 *      Their 问题规避 deck names the three failures: 头大 / 显胖 / 身材55分.
 *   2. The deliverable is a SET of five that must read as one shoot — same face,
 *      same outfit — while every background and pose differs. Five independent
 *      generations do not hold that, so this runs in two stages:
 *
 *        anchor  headshot + flatlays + accessories  ->  studio front full body
 *        scene   anchor + relevant flatlays          ->  the other four
 *
 *      The anchor carries identity and outfit; the flatlays go back in every time
 *      so garment detail is re-asserted rather than drifting through a copy chain.
 *
 * Do NOT feed 模特形象/参考对标图（不可直接用）.jpg — it is a real photograph the
 * client explicitly marked unusable, and it carries a real person's likeness.
 *
 *   node scripts/oneoff_xiake_lookbook_2026-09-10.cjs prompt --shot 1
 *   node scripts/oneoff_xiake_lookbook_2026-09-10.cjs anchor --n 3
 *   node scripts/oneoff_xiake_lookbook_2026-09-10.cjs scene --anchor <png> --shots 2,3,4,5
 */
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

// ── key ───────────────────────────────────────────────────────────────────────
// Offline client GTM work runs on the separate try-on/retouching key so it does
// not draw on the production image quota.
const BG_ENV = "/Users/qqwjq/curify-studio/curify_background/.env";
function readKey() {
  const m = fs.readFileSync(BG_ENV, "utf-8").match(/^GEMINI_API_KEY_TRYON_RETOUCHING=(.+)$/m);
  if (!m) throw new Error(`GEMINI_API_KEY_TRYON_RETOUCHING not in ${BG_ENV}`);
  // the value is quoted in .env; an unstripped quote reads back as a 400
  // API_KEY_INVALID, which looks like a dead key rather than a parse bug
  return m[1].trim().replace(/^["']|["']$/g, "");
}
const MODEL = process.env.MODEL || "gemini-3-pro-image-preview";

// ── inputs ────────────────────────────────────────────────────────────────────
const REQ = "/Users/qqwjq/curify-gallery/client_VC_portfolio/夏可测试（一套5张）";
const SKU = path.join(REQ, "SWGQ305139022+SWGQ110019014");
const REF = {
  faceFront: path.join(REQ, "模特形象/正.jpg"),
  faceLeft: path.join(REQ, "模特形象/左.jpg"),
  faceRight: path.join(REQ, "模特形象/右.jpg"),
  faceClose: path.join(REQ, "模特形象/模特形象.png"),
  topFront: path.join(SKU, "SWGQ305139022/SWGQ305139022 (1).jpg"),
  topBack: path.join(SKU, "SWGQ305139022/SWGQ305139022 (2).jpg"),
  topBackExact: path.join(SKU, "SWGQ305139022/SWGQ305139022 (2).jpg"),
  topCollar: path.join(SKU, "SWGQ305139022/SWGQ305139022 (3).jpg"),
  // The supplier's own close-up of the two side cinches. Fed directly on any
  // shot where a side seam is visible — the detail is ~200px in a 4161px-wide
  // flatlay and does not survive the model's downsampling of the full frame.
  topSideDetail: path.join(SKU, "SWGQ305139022/SWGQ305139022 (7).jpg"),
  // A magnified swatch of the real knit, cut from the flat centre of the back
  // flatlay. Feeding a close-up of the stubborn detail is what finally fixed the
  // side cinches; the fabric's relief resisted four rounds of prose, so it gets
  // the same treatment.
  fabricSwatch: path.join(REQ, "fabric-swatch.png"),
  botFront: path.join(SKU, "SWGQ110019014/SWGQ110019014 (1).jpg"),
  botBack: path.join(SKU, "SWGQ110019014/SWGQ110019014 (2).jpg"),
  shoes: path.join(SKU, "鞋子参考（1） (7).png"),
  bag: path.join(SKU, "包参考.png"),
  earrings: path.join(SKU, "耳环参考12.png"),
};
const OUT = path.join(REQ, "output");
const SPECS = ["spec-top.json", "spec-bottom.json"].map((f) => path.join(OUT, f));

// ── the garment spec, read off the flatlays ───────────────────────────────────
// model-swap's most expensive lesson: every early take reproduced the hem exactly
// as specified, and the spec was wrong. These two blocks are the deliverable.

const TOP = `THE TOP — style SWGQ305139022, a knitted long-sleeve polo:
  - colour: a single flat pale powder blue / ice blue. One colour only, edge to
    edge. No contrast trim, no stripe, no pattern, no logo, no print.
  - fabric — THE RIB DEPTH HAS BEEN WRONG IN EVERY IMAGE SO FAR, AND IT IS THE
    LARGEST ERROR IN THE SET BECAUSE IT COVERS THE WHOLE GARMENT. The ground is a
    FINE, FLAT, SMOOTH jersey in which the individual knit stitches are only just
    visible. Running down it are NARROW SINGLE RAISED LINES, like pinstripes,
    evenly spaced about a centimetre apart — roughly thirteen of them across a
    quarter of the back's width — on the body and on both sleeves.
    BETWEEN THE LINES THE FABRIC IS FLAT. No channel, no groove, no rounded
    column, no dark trough, no corrugation.
    THE RELIEF IS SUBTLE, AND THIS IS MEASURED: against the real garment the
    rendered rib has been coming out at three times the correct depth — 58 grey
    levels of peak-to-trough shading where the reference has 19. Render it as a
    fine pinstripe TEXTURE on a flat, light, drapey knit catching only a whisper
    of shading. It is NOT a chunky rib, NOT a deeply grooved or corrugated knit,
    NOT a ribbed sock or cuff, NOT a cable, and NOT a pleated surface.
  - collar: a turn-down POLO collar knitted in smooth flat plain knit, NOT
    ribbed, with two pointed collar points that lie flat on the chest.
  - placket: a short flat-knit centre-front placket ending at mid-chest, with
    EXACTLY THREE small flat tonal pale-blue four-hole buttons, evenly spaced.
    Three. Not two, not four, not five. All three are fastened. The placket is a
    NARROW clean strip, not a wide panel, and it finishes with a neat horizontal
    bar at its lower end.
  - BUTTONS MUST SURVIVE BEING ZOOMED INTO. They are small in the frame, and the
    client's test is to enlarge the chest and see whether they fall apart. Each
    button is a HARD LITTLE OBJECT: a crisp circular edge, a slightly raised rim
    catching the light, a shallow dished centre, and its FOUR HOLES reading as
    four distinct dots. Render them with the same definition a real camera gives
    a real button. They must NOT dissolve into soft featureless blobs, smudges,
    or vague pale dots, and their edges must not blur into the knit around them.
  - sleeves: long set-in sleeves to the wrist, finished with a narrow band of
    smooth flat knit at each cuff.
  - SIDES (两侧抽褶) — THE SIGNATURE DETAIL OF THIS TOP. Get its SHAPE right, not
    just its presence:
      · WHERE: hard against the side seam, sitting DIRECTLY ON TOP OF the flat
        hem band. It starts at the hem band and stops about six to eight
        centimetres up. That is the whole of it.
      · WHAT: the seam itself is drawn up and cinched tight over that short run,
        so the rib bunches into a tight knot right at the seam edge.
      · DIRECTION: the little pleats fan INWARD from the seam into the body
        panel, running roughly HORIZONTALLY — across the ribs, not along them —
        and they fade out within a few centimetres. They do not stack up the seam.
      · RESULT: the fabric just inboard of the cinch puffs out into a soft
        rounded bubble, and because the seam has been shortened there, the flat
        hem band is pulled UPWARD at that point and swings away.
      · SIZE — this keeps coming out too big: it is a SMALL, TIGHT, COMPACT KNOT
        of gathered rib, roughly the width of two fingers, confined to the seam
        itself. It is not a large soft drapey ruche, it does not spread across
        the back or the front panel, and it does not scrunch the whole lower half
        of the garment. Everything more than a few centimetres from the seam is
        SMOOTH, evenly ribbed knit with no bunching, no folds and no rucking.
      · COUNT: BOTH side seams, left and right, symmetrical, and identical on the
        front and the back of the garment. 两侧, not one.
    WHAT IT IS NOT, and this is the exact error to avoid: it is NOT a long
    vertical ruched or shirred column running up the side of the body. It is NOT
    a drawstring-gathered side seam of the kind seen on a bodycon dress. Nothing
    is gathered anywhere near the waist, the ribcage or the underarm — the
    gathering lives in the bottom few centimetres of the garment only.
  - hem: a WIDE band of smooth flat knit at the bottom — a deep, substantial
    band, not a thin edge binding. Because the side cinches shorten the seam, the
    hemline is STRONGLY ARCHED: it hangs lowest at centre front and centre back
    and sweeps up markedly at both side seams, so the two ends of the band sit
    clearly higher than its middle. This arc is pronounced and is one of the
    things the client checks; a nearly horizontal hem is wrong. The arc is the
    CONSEQUENCE of the cinches, so wherever the hem rises, the cinch causing it
    must be visible at that seam.
  - fit and length: slim and close to the body without being tight; it ends at
    the natural waist.
  - HOW IT IS WORN: loose, not tucked in. The flat hem band ends right AT the top
    edge of the trouser waistband — it just meets it, so the waistband reads in
    full below the knit while NO SKIN SHOWS BETWEEN THEM. Both failure directions
    have happened and both are wrong: do NOT let the top drop over the waistband
    and hide it, and do NOT ride it up into a crop top with a gap of bare midriff
    above the trousers. They meet, edge to edge.
  - AND THE WAISTBAND MUST STILL READ. Below that meeting point the trouser
    waistband, its belt loops, its centre-front button and the top of the fly
    are all visible and in focus. These are named product details; losing them to
    get the knit right is not a trade worth making — render both.`;

const BOTTOM = `THE TROUSERS — style SWGQ110019014, 夏可 休闲裤:
  - colour: ecru / cream off-white. Matte, slightly crisp cotton twill. No wash,
    no fading, no whiskering, no denim character, no sheen.
  - waist: HIGH waist sitting at the natural waist. The waistband is a straight
    flat band about four centimetres deep, topstitched along both edges, with
    narrow belt loops standing on it — one at each side of the centre front, one
    at each hip, one at the centre back. At the centre front, ONE tonal
    four-hole button sits on the waistband above a zip fly with a visible fly
    seam curving down. No belt is worn. THIS WAISTBAND IS PART OF THE PRODUCT
    AND MUST BE VISIBLE AND LEGIBLE — band, loops, button and fly.
  - front: below the waistband a CURVED YOKE SEAM sweeps across each side of the
    front, running from the side seam down and inward toward the centre front,
    and the slant pocket opening is set into that seam. This seam is clearly
    stitched and must show.
  - THE SIGNATURE OF THIS TROUSER IS THE BARREL LEG, and it is a CONTOUR, not a
    width change — an earlier description said the ankle was about half the width
    of the knee, which is simply wrong and over-tapered the trousers in every
    image it produced. MEASURED off the flatlay: each leg is at its widest around
    60-73% of the way down and only about 6% narrower at the hem (a ratio near
    1.06:1). So the leg stays generously full all the way down, and what makes it
    a barrel is that the OUTER SEAM BOWS OUTWARD in a smooth convex curve through
    the hip, thigh and knee and then eases back in toward the ankle. Seen from the
    front, each leg reads as a soft rounded column with a curved outer edge, and
    the gap between the legs is a narrow lens that closes gently toward the hem.
    It is NOT a straight leg, NOT a palazzo or wide-leg that keeps its width to
    the floor, NOT a tapered cigarette trouser, NOT a peg or carrot shape pulled
    tight at the ankle, and NOT a skinny or slim trouser.
  - length: full length, the plain clean hem ending right at the ankle bone. No
    turn-up, no cuff, no raw edge.
  - back: two patch pockets with a pointed pentagon bottom, and a curved back
    yoke seam above them.`;

const STYLING = `STYLING — exactly these pieces and nothing else:
  - shoes: low-profile retro suede trainers in cream / off-white with a navy
    blue side flash, flat cream laces and a gum sole, worn with short white
    ribbed crew socks that show above the shoe.
  - bag: a small white pebbled-leather dome bag with two short rolled top
    handles and a thin detachable long shoulder strap. Plain — no brand name,
    no monogram, no metal logo plaque, and no fur charm or pom-pom of any kind.
  - earrings: small chunky gold twisted / interlocking hoops, one in each ear.
  - nothing else at all: no hat, no cap, no sunglasses, no belt, no watch, no
    necklace, no bracelet, no rings, no scarf, no jacket, no cardigan, no
    outer layer.
  - no camisole, tank, bra, lace or any inner garment is visible at the collar,
    in the placket or below the hem. The polo is the only thing on her torso.`;

const PERSON = `THE MODEL — the young woman in the reference headshot, and she must be
recognisably the same person in every frame:
  - East Asian, early-to-mid twenties, oval face with a soft jawline, softly
    arched dark brows, dark brown eyes, a straight slim nose, natural medium-full
    lips.
  - hair: shoulder-length dark brown, parted a little off centre, with body at
    the crown and a soft inward curl at the ends. Matte, with individual flyaway
    strands catching the light. NOT wet-looking, NOT greasy, NOT flat, NOT
    lacquered.
  - make-up: clean and natural — soft brown brow, skin-toned lid, subtle blush,
    a muted rose lip. No heavy contour, no glitter, no strong eyeliner.

BODY PROPORTION — the client rejects three specific faults by name, so build the
figure deliberately:
  - tall and slender, about eight and a half heads tall, with a SMALL head
    relative to the body. Not 头大 / not a large head.
  - a high waistline and long legs: from the waist down is clearly MORE than
    half of her total height. Not 身材55分 / not a half-and-half body split.
  - slim through the shoulders, waist and thigh, with a natural bust. Not 显胖 /
    not heavy, and equally not emaciated. Her own frame is slim — do not slim
    her further by warping the picture, and do not stretch her legs.

SKIN — 去AI感 is an explicit acceptance criterion:
  - even warm-neutral fair skin with the SAME tone on the face, neck, chest,
    hands and legs. No patches, no blotches, no colour blocking on the cheeks.
  - real photographic skin texture with visible fine pores and faint natural
    variation. No airbrushing, no plastic smoothing, no waxy sheen.
  - the face and hair must read MATTE. No oily highlight on the forehead, nose,
    cheekbones or chin, no greasy hair. 头发和脸不油.`;

const QUALITY = `THE PICTURE:
  - a real photograph from a commercial fashion lookbook shoot, made on a
    full-frame camera with a short telephoto lens. Sharp, true colour, natural
    depth of field.
  - VERTICAL 3:4. FULL BODY: the top of her head and the soles of her shoes are
    both inside the frame, with clear space above her head and floor visible
    below her shoes. Nothing is cropped at the ankle, wrist or crown.
  - her pose is relaxed and natural. Her arms and legs must NOT both hang
    straight and symmetrical at her sides with her feet planted parallel, and her
    expression must not be blank or frozen — the client rejects that posture
    outright (问题规避-姿势呆板).
  - white balance and skin tone are consistent with the rest of the set; a
    studio frame and an outdoor frame of the same look must not drift apart in
    colour.

DO NOT:
  - do not change the colour, the fit, the length or any detail of either
    garment; do not add or remove a single button
  - the knit is smooth and settled everywhere EXCEPT the designed side gathers.
    No fan of diagonal drag creases radiating from the underarm, no bunching or
    rucking across the back or the waist, no pull lines. The only gathered
    fabric anywhere on this top is the shirring at the two side seams.
  - no text, no caption, no watermark, no logo, no brand mark, no graphic
    element, no border, no collage, no split frame
  - no added smoke, mist, haze, glow, lens flare, bokeh balls or floating props
  - no illustration, no 3D render, no painterly look`;

// ── the five shots ────────────────────────────────────────────────────────────
// 3 外景 + 2 棚拍 (1 正面 1 背面). Every background different, every pose different
// — 问题规避-图片过于相似 is a named rejection reason.
const SHOTS = [
  {
    id: 1,
    kind: "studio",
    name: "棚拍-正面",
    refs: ["fabricSwatch", "topFront", "botFront", "shoes", "bag", "earrings"],
    scene: `SETTING — 棚拍, studio. A seamless cyclorama in a VERY LIGHT, almost
white, neutral cool grey — bright and airy, the value of fresh paper, not beige
and not brown. It falls off only very slightly toward the top corners. Big soft
frontal key light with a gentle fill, and a soft contact shadow pooling under and
just behind her shoes so she is standing on a floor rather than floating.`,
    pose: `POSE — facing the camera, but relaxed: her weight is on her left leg with
the right knee softly bent and that foot a little forward and turned out. Her
torso is turned about ten degrees off the lens. Her right hand is slipped
loosely into the front pocket of the trousers, thumb outside; her left hand
holds the white bag by both top handles, hanging naturally at her side. Her
chin is turned very slightly away from the lens and her eyes come back to it.
A soft, closed-lip, unforced smile.`,
  },
  {
    id: 2,
    kind: "studio",
    name: "棚拍-背面",
    refs: ["fabricSwatch", "topBackExact", "topSideDetail", "botBack", "shoes", "bag"],
    // Three named errors from the client's 09-14 review of the delivered back
    // view. All three are visible in the back flatlay they pointed at; none was
    // caught by looking at the render on its own.
    garmentNote: `THE BACK OF THIS TOP — check your image against IMAGE 2 point by point.
The delivered version was rejected on three specific things, so build them first:

  1. THE COLLAR IS A TURN-DOWN POLO COLLAR, SEEN FROM BEHIND. It is FOLDED OVER
     and LIES FLAT AND LOW against the upper back, spreading WIDE across the
     shoulders, with its folded edge running almost straight across. The previous
     attempt rendered a STAND-UP band hugging the neck like a mock neck or a
     mandarin collar. That is the wrong collar entirely. Nothing stands up around
     her neck; the collar lies down on her back.
  2. THE HEMLINE IS STRONGLY ARCHED. The wide flat hem band hangs lowest at
     centre back and rises markedly at both side seams. The previous attempt
     rendered it almost horizontal.
  3. THE SIDE CINCHES ARE SMALL AND TIGHT. A compact knot of gathered rib at each
     side seam, just above the hem band. The previous attempt spread soft ruching
     over the whole lower half of the back. Everything away from the two seams is
     smooth, evenly ribbed knit.

Otherwise the back is plain: one continuous panel of the broad vertical rib, no
opening, no buttons, no seam down the centre, no label or tag showing.

NOTHING IS THREADED THROUGH THE CINCHES. They are knitted and stitched into the
side seams. There is NO drawstring, NO cord, NO tie, NO bow, NO ribbon, NO tab,
NO belt, NO waist band and NO loop anywhere on this garment, and nothing hangs
down from the hem or the sides. Previous attempts invented ties dangling at both
hips and a belt strapped across the hem; both are wrong. The gathering is in the
knit itself and has no hardware.`,
    scene: `SETTING — 棚拍, studio. A seamless cyclorama in a NEUTRAL light grey,
the same value and the same white balance as the front studio shot — this pair
has to read as one session, so the two frames must not drift apart in colour.
Clean even frontal light with a soft fill, a gentle falloff behind her, and a
soft contact shadow under her shoes. The floor line sits a little lower in the
frame than in the front shot, which is what differentiates the two backgrounds;
the COLOUR is deliberately not what differentiates them.

THIS IS A STUDIO PHOTOGRAPH AND SHE IS STANDING. Recent attempts drifted: three
of five put her in a cafe or on a street and two sat her on a chair, a bench or a
stool. There is NO cafe, NO street, NO shopfront, NO window, NO doorway, NO
interior room, NO furniture, NO chair, NO stool, NO bench, NO table, NO plant, NO
person other than her. Nothing but seamless studio backdrop and studio floor
behind and beneath her, and she is standing on both feet.`,
    pose: `POSE — this is the garment's back-detail frame, so BOTH SIDE SEAMS MUST
BE VISIBLE AND UNOBSTRUCTED, and the pose is built around that:
  - She stands with her BACK SQUARE TO THE CAMERA, shoulders level and parallel
    to the frame, so the left and right side seams both fall on the silhouette
    edge and the 两侧 cinches can both be seen. Weight rests on her right leg
    with the left knee softly released so the stance is easy rather than rigid.
  - Her right arm hangs down and slightly AWAY from her body, holding the white
    bag by its top handles clear of her hip, so neither the bag nor her forearm
    crosses the right side seam or the hem band.
  - Her left hand is lifted to sweep her hair FORWARD over her right shoulder,
    which lifts that elbow out and away and leaves the left side seam completely
    clear.
  - HER HAIR IS OFF THE COLLAR. It falls forward over both shoulders and in front
    of her shoulders, so the nape of her neck and the ENTIRE back collar are
    exposed and unobstructed. No hair lies across the collar or the upper back —
    the back collar is the detail this photograph exists to show.
  - Her head turns a little to the camera's right, just enough that the line of
    her cheek and one earring read; she is not looking into the lens.
Nothing may cover the bottom third of the top: not hair, not the bag, not a
sleeve. The back of the trousers and both patch pockets stay visible.`,
  },
  {
    id: 3,
    kind: "outdoor",
    name: "外景-街角店铺",
    refs: ["fabricSwatch", "topFront", "botFront", "shoes", "bag"],
    scene: `SETTING — 外景, late morning. A quiet corner of an old shopping street:
a warm sand-coloured plaster wall, a dark wooden shopfront door with a slim
brass handle beside her, a low stone step, and small cobblestones underfoot. Soft
directional sunlight comes from the camera's left, throwing a gentle diagonal
shadow of the doorframe onto the wall behind her; the far end of the street
falls softly out of focus. The whole scene is warm, calm and unbusy — no people,
no traffic, no readable shop sign or lettering anywhere.`,
    pose: `POSE — she is walking slowly toward the camera and slightly across it,
caught mid-stride with her left foot forward and her weight rolling onto it, so
the barrel leg of the trousers is in natural motion. Her right hand is lifted to
tuck a strand of hair behind her ear; her left hand carries the white bag by its
top handles, swinging a little away from her hip. She is looking off to the
camera's right, not into the lens, with a light unposed expression as if
something has just caught her eye.`,
  },
  {
    id: 4,
    kind: "outdoor",
    name: "外景-墙边光影",
    refs: ["fabricSwatch", "topFront", "botFront", "shoes", "bag"],
    scene: `SETTING — 外景, mid afternoon, and a completely different place from the
other two outdoor frames: a quiet lane beside a pale limewashed textured wall,
with a strip of pale gravel and a clipped green shrub at the base of the wall.
Sun comes through the leaves of a tree out of frame, laying soft dappled light
and leaf shadow across the wall and across the trousers. Warm, high-contrast but
not harsh; the light is soft enough that her face is evenly lit with no hard
shadow across it.`,
    pose: `POSE — she stands with her back and shoulders resting lightly against the
wall, one shoulder taking the weight. Her right knee is bent and the sole of
that shoe is set flat back against the wall behind her, which lets the barrel
shape of the trouser leg show clearly. Both hands are relaxed: her left hand
hangs, her right holds the bag's long strap where it crosses her chest, the bag
resting at her hip. Her head is tipped a little back and turned toward the sun,
eyes lowered, a quiet half-smile.`,
  },
  {
    id: 5,
    kind: "outdoor",
    name: "外景-林荫人行道",
    refs: ["fabricSwatch", "topFront", "botFront", "shoes", "bag", "earrings"],
    scene: `SETTING — 外景, late afternoon under a soft overcast sky that has just
started to break. A wide clean pavement along a tree-lined street: plane trees
with mottled bark receding behind her, a low clipped hedge and a pale modern
building facade far out of focus in the background. The light is soft, even and
slightly cool-neutral, with no hard shadow — but grade the skin tone to match the
warmer frames so the set holds together.`,
    pose: `POSE — she stands in a relaxed three-quarter turn to the camera's left,
weight on her back leg, the front foot crossed loosely in front of the other at
the ankle. The bag hangs from her right shoulder on its long strap. Her left
hand is tucked into the front trouser pocket; her right arm hangs loose with the
fingers relaxed and slightly curled. She is looking away down the street past
the camera, her chin lifted slightly, lips softly parted — an easy, unguarded,
mid-thought expression.`,
  },
  {
    id: 6,
    kind: "studio",
    name: "棚拍-正面-重出",
    refs: ["topCollar", "topFront", "botFront", "shoes", "bag", "earrings"],
    garmentNote: `THIS IS A RE-RENDER OF IMAGE 1 FOR ONE REASON: THE BUTTONS.
IMAGE 2 is the supplier's close-up of the collar and the buttons. In IMAGE 1 the
three buttons are soft, blurred blobs with no readable holes, and the client
rejected exactly that — their test is to enlarge the chest and see whether the
detail survives. Reproduce them as IMAGE 2 shows them: crisp circular edges, a
raised rim, four distinct holes each, sitting on a narrow clean flat placket.
Everything else about IMAGE 1 — her face, hair, pose, hands, the garments, the
bag, the shoes, the background, the lighting and the framing — stays exactly as
it is. This is a sharpening of one detail, not a new photograph.`,
    scene: `SETTING — identical to IMAGE 1: the same bright, near-white neutral
grey seamless, the same soft frontal key and fill, the same soft contact shadow
under her shoes, the same floor line. Do not restage or relight anything.`,
    pose: `POSE — identical to IMAGE 1, pose for pose: weight on her left leg,
right knee softly bent and that foot a little forward, torso turned about ten
degrees off the lens, right hand in the front trouser pocket, left hand holding
the white bag by its handles at her side, chin turned slightly away with her eyes
back to the lens, soft closed-lip smile. Same camera distance, same crop, same
head position in the frame.`,
  },
];

// ── prompt assembly ───────────────────────────────────────────────────────────
function inputLegend(names, withAnchor) {
  const label = {
    faceFront: "a headshot of THE MODEL",
    faceLeft: "a three-quarter headshot of THE MODEL",
    faceRight: "a three-quarter headshot of THE MODEL",
    faceClose: "a close portrait of THE MODEL",
    topFront: "the FLATLAY of THE TOP, front",
    topBack: "the FLATLAY of THE TOP, back",
    topBackExact: "THE BACK FLATLAY OF THE TOP — the client has named this the EXACT reference for this photograph. The back of the garment in your image must match it: collar, hemline shape, side seams, rib. Where anything else disagrees with it, it wins",
    topCollar: "a close-up of THE TOP's collar and buttons",
    fabricSwatch: "THE FABRIC ITSELF, MAGNIFIED — a swatch of the real knit. This is the surface to reproduce over the whole garment: a flat fine ground with narrow, LOW, widely-spaced raised lines and no deep grooves between them. Match its flatness, not just its stripe spacing. If the knit you render has rounded columns and dark shadow channels, it is wrong",
    topSideDetail: "THE SUPPLIER'S CLOSE-UP OF THE TWO SIDE CINCHES — the exact reference for 两侧抽褶. Both cinches are visible in it. Match its shape, extent and direction literally",
    botFront: "the FLATLAY of THE TROUSERS, front",
    botBack: "the FLATLAY of THE TROUSERS, back",
    shoes: "a reference photo of THE SHOES",
    bag: "a reference photo of THE BAG",
    earrings: "a reference photo of THE EARRINGS",
  };
  const rows = [];
  let i = 1;
  if (withAnchor) rows.push(`  IMAGE ${i++} — THE LOOK: the same model in the same outfit, already approved.`);
  for (const n of names) rows.push(`  IMAGE ${i++} — ${label[n]}.`);
  return rows.join("\n");
}

function anchorPrompt(shot, refs) {
  return `Produce ONE e-commerce lookbook photograph of a fashion model wearing the
outfit described below.

THE INPUT IMAGES:
${inputLegend(refs, false)}

The headshot gives you HER FACE, HER HAIR and nothing else — it is a head-and-
shoulders portrait against a plain background, so her body, her pose, her
clothing and the setting are all yours to build from the description. The white
vest top she wears in that portrait is NOT part of this outfit.

The flatlays give you THE CLOTHES, and they are the deliverable: a sourcing team
is checking the render against them detail by detail and asking for 95% fidelity.
Read them literally.

${TOP}

${BOTTOM}

${STYLING}

${PERSON}

${shot.scene}

${shot.pose}

${QUALITY}${CHECKLIST}`;
}

function scenePrompt(shot, refs) {
  return `IMAGE 1 is an approved lookbook photograph. Produce ONE NEW photograph of
THE SAME WOMAN in THE SAME OUTFIT, in a different place and a different pose.

THE INPUT IMAGES:
${inputLegend(refs, true)}

CARRY OVER FROM IMAGE 1, unchanged:
  - her face and her identity — same woman, same features, same age; a viewer
    must see the two pictures as one shoot with one model
  - her hair: same colour, same length, same cut, same parting
  - her skin tone and its evenness, and her body proportions
  - every garment and accessory, in the same colours
  - the same natural matte skin and hair, the same clean natural make-up

The flatlays are here because garment detail drifts when a picture is made from
another picture. Re-check the render against them; where IMAGE 1 and a flatlay
disagree, THE FLATLAY WINS.

${TOP}
${shot.garmentNote ? "\n" + shot.garmentNote + "\n" : ""}
${BOTTOM}

${STYLING}

${shot.scene}

${shot.pose}

${QUALITY}${CHECKLIST}`;
}

// ── the reasoning step, fed back in ───────────────────────────────────────────
// scripts/garment_feature_extract.cjs reads the flatlays and ranks the details
// a buyer would call 货不对版 on. Appending that ranking to the prompt closes the
// loop: the thing the extractor says matters most is the thing the generator is
// told last, which is where it sticks. `_corrections` are human overrides
// recorded after checking the extractor against high-magnification crops — they
// win over the extractor's own text, so they are printed as corrections.
function checklistBlock(specPaths) {
  const lines = [];
  for (const p of specPaths) {
    if (!fs.existsSync(p)) continue;
    const s = JSON.parse(fs.readFileSync(p, "utf-8"));
    const what = s._meta?.kind === "bottom" ? "THE TROUSERS" : "THE TOP";
    for (const d of s.signature_details || []) lines.push(`  - ${what}: ${d}`);
    // A correction marked next-batch is true but deliberately not applied yet,
    // because changing it mid-set would make a regenerated frame inconsistent
    // with the frames the client already accepted. Emitting it here would also
    // put it in direct contradiction with the prose block above.
    for (const c of s._corrections || [])
      if (c.applies !== "next-batch")
        lines.push(`  - ${what} — ${c.field} is NOT "${c.was}". It is: ${c.now}`);
  }
  if (!lines.length) return "";
  return `

VERIFIED DETAIL CHECKLIST — read this last and check the finished image against
it. These are the details a buyer inspects first, ranked; getting one wrong is
what 货不对版 means:
${lines.join("\n")}`;
}

const CHECKLIST = checklistBlock(SPECS);

// The anchor stage prepends the headshot, so its legend has to as well — keep
// this in step with the `anchor` branch of main() or the legend lies about which
// IMAGE N is which, and the model wires the wrong reference to the wrong role.
const ANCHOR_REFS = ["faceFront", ...SHOTS[0].refs];

function promptFor(shot, mode) {
  return mode === "anchor"
    ? anchorPrompt(shot, ANCHOR_REFS)
    : scenePrompt(shot, shot.refs);
}

// ── generation ────────────────────────────────────────────────────────────────
function part(p) {
  const ext = path.extname(p).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return { inlineData: { mimeType: mime, data: fs.readFileSync(p).toString("base64") } };
}

async function generate(ai, parts, prompt, outFile) {
  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [...parts, { text: prompt }] }],
    config: {
      responseModalities: ["IMAGE", "TEXT"],
      imageConfig: { aspectRatio: "3:4", imageSize: "4K" },
    },
  });
  for (const cand of resp.candidates || []) {
    for (const p of cand.content?.parts || []) {
      if (p.inlineData?.data) {
        fs.writeFileSync(outFile, Buffer.from(p.inlineData.data, "base64"));
        return { ok: true, usage: resp.usageMetadata || null };
      }
    }
  }
  const why = (resp.candidates || [])
    .map((c) => c.finishReason || (c.content?.parts || []).map((p) => p.text).filter(Boolean).join(" "))
    .join(" | ");
  return { ok: false, why: why || "no image part returned" };
}

function recordManifest(entries) {
  const mf = path.join(OUT, "manifest.json");
  const prev = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, "utf-8")) : [];
  fs.writeFileSync(mf, JSON.stringify(prev.concat(entries), null, 2), "utf-8");
}

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const flag = (n, d) => {
    const i = argv.indexOf(`--${n}`);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
  };

  if (cmd === "prompt") {
    const s = SHOTS.find((x) => x.id === Number(flag("shot", "1")));
    console.log(promptFor(s, s.id === 1 ? "anchor" : "scene"));
    return;
  }

  fs.mkdirSync(OUT, { recursive: true });
  for (const [k, p] of Object.entries(REF)) {
    if (!fs.existsSync(p)) throw new Error(`missing input ${k}: ${p}`);
  }
  const ai = new GoogleGenAI({ apiKey: readKey() });
  const entries = [];

  if (cmd === "anchor") {
    const n = Number(flag("n", "3"));
    const shot = SHOTS[0];
    const parts = ANCHOR_REFS.map((r) => part(REF[r]));
    const prompt = promptFor(shot, "anchor");
    fs.writeFileSync(path.join(OUT, "prompt-shot-1.txt"), prompt, "utf-8");
    for (let i = 1; i <= n; i++) {
      const f = path.join(OUT, `anchor-${String(i).padStart(2, "0")}.png`);
      process.stdout.write(`anchor ${i}/${n} ... `);
      const r = await generate(ai, parts, prompt, f);
      console.log(r.ok ? path.basename(f) : `FAILED: ${r.why}`);
      if (r.ok) entries.push({ output: path.basename(f), stage: "anchor", shot: 1, model: MODEL });
    }
  } else if (cmd === "scene") {
    const anchor = flag("anchor", path.join(OUT, "anchor-01.png"));
    if (!fs.existsSync(anchor)) throw new Error(`anchor not found: ${anchor}`);
    const ids = flag("shots", "2,3,4,5").split(",").map(Number);
    for (const id of ids) {
      const shot = SHOTS.find((s) => s.id === id);
      if (!shot) throw new Error(`no shot ${id}`);
      const prompt = scenePrompt(shot, shot.refs);
      fs.writeFileSync(path.join(OUT, `prompt-shot-${id}.txt`), prompt, "utf-8");
      const parts = [part(anchor), ...shot.refs.map((r) => part(REF[r]))];
      const n = Number(flag("n", "1"));
      const start = Number(flag("start-index", "1"));
      for (let i = 0; i < n; i++) {
        const idx = start + i;
        const f = path.join(OUT, `shot-${id}-${shot.kind}-${String(idx).padStart(2, "0")}.png`);
        // Never clobber a take that already exists — a selected frame is not
        // reproducible, and re-running with the same index used to destroy one
        // silently. Refuse instead, and say which flag fixes it.
        if (fs.existsSync(f)) {
          throw new Error(
            `${path.basename(f)} already exists. Re-running would overwrite a take that ` +
            `cannot be regenerated. Pass --start-index ${idx + n} (or move the old takes aside).`
          );
        }
        process.stdout.write(`shot ${id} (${shot.name}) take ${idx} ... `);
        const r = await generate(ai, parts, prompt, f);
        console.log(r.ok ? path.basename(f) : `FAILED: ${r.why}`);
        if (r.ok)
          entries.push({
            output: path.basename(f),
            stage: "scene",
            shot: id,
            name: shot.name,
            kind: shot.kind,
            anchor: path.basename(anchor),
            model: MODEL,
          });
      }
    }
  } else {
    console.error("usage: prompt --shot N | anchor [--n 3] | scene --anchor <png> [--shots 2,3,4,5] [--n 1]");
    process.exit(1);
  }

  if (entries.length) recordManifest(entries);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
