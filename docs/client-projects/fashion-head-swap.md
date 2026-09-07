# Fashion head swap — one man's head onto two studio model shots

> 2026-09-07, one session. An **internal capability exercise**, not a client project: two
> e-commerce fashion photographs had to keep their garments, their poses and their lighting
> while their model's head was replaced with a specific real person's. Adjacent to the
> 2026-08-28 fashion-model run (`client-006`), but the inverse problem — that one had to
> **rebuild a garment** on a borrowed body; this one has to **not touch the garment at all**.
>
> **No client.** Nobody commissioned this. Recorded as `internal-003`, `customer_data: false`.
> The material has the shape of client work; shape is not evidence.
>
> 📁 **Structured trajectory record** (§7z corpus, alongside client-005/006/007/008, lead-001
> and internal-001/002):
> `~/agentic-adhoc-inbox/real-projects/projects/2026-09-07-internal-003-fashion-head-swap.json`
> — staged locally, pending the `agentic-adhoc` clone. **Keep the two in sync**: this doc owns
> the *narrative and the how-to-rerun*, the JSON owns the *decision trajectory* (the three
> readings of the brief, the two rejected in silence, the four-round repair chain).
> Update both in the same commit, per §7z-E2's drift rule.
>
> ⚠️ **`raw/fashion-change-09-07/` was gitignored at intake** (`.gitignore:113`). This repo is
> public and `raw/` as a whole is not ignored. The folder holds a third party's identifiable
> face and renders that place that likeness on other people's bodies, with no release on file.

---

## The brief, and what was actually in the files

> I dropped 2 model images and 1 reference head into raw/fashion-change-09-07.
>
> the task is to use the person's head in reference-head and apply to the two model images,
> please make sure it look natural with the right pose, expression, and scale.

`reference-head.jpg` is **not a reference head**. It is a 1280×2781 phone screenshot of a
men's-styling short-video account's search page, holding three partial views of the same man:

| view in the screenshot | usable? |
|---|---|
| the large post image | ❌ he is wearing sunglasses — no face |
| bottom-right video thumbnail | ❌ head turned down and away, covered by a UI pill |
| **bottom-left video thumbnail** | ✅ **the only unobstructed frontal face** — and the screenshot's own bottom edge cuts it off at the mouth |

So the first real decision was a crop, not a render. `reference-head-crop.png` is that
thumbnail at 445×481, Lanczos-upscaled 3× — it carries brows, eyes, nose, hairline, face shape
and hair, and does not carry a chin.

**The file name is a claim, not a description.** Open every input before planning.

---

## The one question worth asking before rendering

"Use the person's head" has three readings that produce visibly different pictures, and
guessing wrong wastes the whole run. All three were put to the operator **before anything was
generated**:

| | option | what it means |
|---|---|---|
| alt-1 | Whole head, no sunglasses | his face and black hair; shades removed so the face shows — a try-on |
| **alt-2** | **Whole head, keep sunglasses** | **his face and black hair; the model's own shades stay on** ← chosen |
| alt-3 | Face only, keep blonde hair | identity swapped, the blonde mullet and shades stay as styled |

alt-2 was selected. **No reason was given, and none is recorded** — the JSON carries
`rationale_given: false` on both losing options. The tempting sentence ("preferred the editorial
look") is nowhere in either file because nobody said it.

Worth noting for its own sake: a pre-production option menu produced a project with **zero
rework**, and therefore zero `feedback[]`. Cheap for the project; expensive for the corpus,
whose most valuable field is revision wording.

---

## Files

### Inputs

| Thing | Path | What it is |
|---|---|---|
| Model photo 1 | `raw/fashion-change-09-07/model-1.jpg` | 4000×5328. Full-length; blonde curly mullet, **chin tucked, face angled down**, black shield sunglasses, denim braid-trim jacket, black bag, wide black trousers |
| Model photo 2 | `raw/fashion-change-09-07/model-2.jpg` | 4000×5328. Three-quarter; same model, **square-on and level**, narrow black wraparound shades, tan jacket, chain necklace |
| Reference screenshot | `raw/fashion-change-09-07/reference-head.jpg` | 1280×2781 app screenshot — see above |
| **Identity source used** | `raw/fashion-change-09-07/headswap/reference-head-crop.png` | 1335×1443 — the bottom-left thumbnail, cropped and upscaled |
| Sunglasses references | derived in-session, `sg1.png` / `sg2.png` (scratch) | close-ups of the *real* pair cut from each model photo, upscaled 2× |
| Likeness release | **NOT PROVIDED** | no permission, and no stated use for the output |

### Outputs

| Thing | Path |
|---|---|
| **Shipped pair** | `raw/fashion-change-09-07/headswap/model-1-headswap.jpg`, `model-2-headswap.jpg` — both 4000×5328 |
| 12 alternates | `raw/fashion-change-09-07/headswap/alternates/` |
| Local file inventory | `raw/fashion-change-09-07/headswap/README.md` |
| Generator | `scripts/oneoff_fashion_head_swap_2026-09-07.cjs` (committed) |
| Aligner + compositor | `scripts/oneoff_fashion_head_swap_composite_2026-09-07.py` (committed) |

Variant tags: `-v*` first generation, `-s*` short-prompt test, `-w*` with the sunglasses
reference. **`model-1-w1` and `model-2-w1` shipped**, on head scale, angle fidelity and the
least oversized shades. That pick is the executor's — the operator saw none of the 14 before
delivery, so it is not a taste signal.

---

## How to re-run

```bash
# 1. cut the 1600x1600 head crops and the reference crop (see the JSON `inputs` for geometry)
# 2. generate 3 variants per photo — needs GEMINI_API_KEY in .env.local
node scripts/oneoff_fashion_head_swap_2026-09-07.cjs 3
# 3. register each render against the original and composite the head back in
python3 scripts/oneoff_fashion_head_swap_composite_2026-09-07.py model-1 <render.png> <out.jpg>
```

Model: `gemini-3-pro-image-preview`, 1:1 at `imageSize: 2K` for the crop stage.

---

## Why it is a compositing job, not a generation job

**Asked to reproduce a whole photograph with one thing changed, the model re-renders the
photograph.** The first pass came back with the denim jacket's braid trim simplified, the
collar redrawn, the shoe shape changed and the framing pulled back. It looked fine. On a
fashion shot that is disqualifying, because the garment is the product.

So the swap runs on a **1600×1600 head crop** cut from the 4000×5328 original, and only the
head region is blended back. The untouched region is then the original *by construction*.

**And it is measurable.** Outside the head crop, the delivered files differ from the originals
by at most **10/255** and **11/255**, on 0.2% of pixels — JPEG re-encode noise. "The garment was
not touched" is a number here, not a claim.

---

## The four things that broke, and why

| # | Symptom | Mechanism | Fix |
|---|---|---|---|
| 1 | Garment redrawn, framing pulled back | the model re-renders what it is asked to reproduce | generate on a crop; composite back |
| 2 | Aligner returned scale 1.0 / offset (0,0) for **every** render, including ones that had visibly re-framed | mean-subtracting a band-limited signal turns the zeroed region into a large constant field; the correlation peak reports *that field's overlap*, so it can only ever return identity | NCC template matching on two garment landmarks across a scale sweep, with the landmarks required to agree |
| 3 | Flat skin-coloured patch at the base of the neck; pink-tipped curls surviving on the collar | the generated neck is longer than the model's, so the mask edge blended skin over the black tee at ~50% | polygon mask that drops low over jacket and background but **lifts to mid-neck** in the centre — the seam has to land where both images are the same material |
| 4 | The guard protected dark *hair* and the jaw shadow; its own box edge showed as a rectangle | a guessed brightness ramp (105/45) treated everything below ~150 as "tee" | measured it — tee **26**, darkest hair **112**, jaw shadow **112** — and tightened the ramp to 42/33; feathered the box as `guard = 1 - box·(1-bright)` |

Defect 2 is the one worth remembering: it returned a **plausible, confident, wrong answer**
for four renders before anyone checked. It was caught by feeding the matcher a synthetically
transformed image with a known answer (true 0.80 → recovered 0.79). *A registration step needs
a control.*

---

## Known limitation — not fixed

**Every render draws the sunglasses larger and rounder than the real pair.** Three strategies:

1. long, heavily constrained prompt — oversized
2. short surgical prompt — oversized, *and re-framed more than the long one*, and 1 of 4 requests failed outright
3. close-up of the actual sunglasses as a third reference image, with explicit frame-to-face proportions — **narrowed, not fixed**

`-w1` is the closest of the 14. Pasting the real pair back is blocked: the generated frame is
~1.7× wider, so the original would sit inside it and the generated frame would protrude.

Second finding from strategy 2, worth carrying: **a shorter prompt is not automatically a more
obedient prompt.**

---

## Open

- **Likeness.** Reproducing a specific identifiable person is a different risk from using a real
  photo as a pose or style reference — the 2026-08-28 problem, one level worse, because here the
  likeness *is* the deliverable. Fine on this machine; not fine in a deck, a portfolio, or a
  public repo. Ask at intake, next to the gitignore line.
- Whether the architecture survives a background that is not plain seamless white. Every
  mechanism above leans on it.
- The chin the screenshot cut off. The renders invented one; nobody has compared it.
