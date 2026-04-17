# Template to Video Strategy

## Language Templates (vocabulary, dialogue, expressions)

### Narrative / Educational Series

- Each video covers one concept: a word set, a dialogue scenario, or a grammar pattern
- Format: image reveal → narration → example sentence → next image
- The AI-generated image is the visual anchor; narration explains meaning, usage, cultural context
- **What-if History** works well here: *"What if the Roman Empire never fell — how would Latin have evolved into English?"* — sequential images showing language evolution with scripted narration
- Series structure: e.g. *"50 English Words for Travel"* as 10 × 5-word episodes, each ~60s
- Voiceover: recorded narration or TTS (ElevenLabs) for scale

**Production approach:** Script → generate images per template → sequence with Ken Burns effect → add narration track → captions via Whisper

---

## Character Packs (MBTI, film, sports, gaming, groups)

### Slideshow / Reveal Format

- Random pick of 6–12 images from the pack, set to music
- Works well as *"All 16 MBTI types as [X]"* or *"Every Avenger as a Renaissance portrait"*
- Reveal format: black screen → character name card → image → next (builds anticipation)
- Comparison packs: side-by-side split-screen reveal with dramatic music
- Gaming/sports: energetic music, fast cuts; MBTI: slower, aesthetic-focused

**Production approach:** Pull images from template pack → auto-sequence with ffmpeg → overlay title cards → sync to beat-matched music

---

## Learning Templates (science, history, culture, architecture, finance, AI)

### Narrated Infographic Explainer

- Image is revealed progressively (pan/zoom) while narration walks through the content
- History: timeline format — *"The British Industrial Revolution in 90 seconds"*
- Architecture: virtual tour style, slow pan across the image
- Science/finance: diagram reveal with explanatory voiceover
- AI/trending: opinion-style narration, more casual tone

---

## Lifestyle Templates (travel, food, fashion, nostalgia)

### Aesthetic / Social Format

- Travel: destination showcase, 3–5 images per city, ambient music, minimal text
- Food: recipe reveal — ingredient images → final dish, ASMR-style audio
- Fashion: lookbook cuts, trending audio from TikTok/Reels
- Nostalgia: vintage film grain overlay, lo-fi music, slow dissolves

---

## Production Stack

| Need | Tool |
|---|---|
| Slideshow + Ken Burns | FFmpeg or Remotion (React-based) |
| Narration at scale | ElevenLabs or recorded voice |
| Auto-captions | OpenAI Whisper |
| Beat sync for music | FFmpeg + beat detection, or manual |
| Series scheduling | One template per week, batch-generate per episode |

---

## Prioritization

Given existing content, highest ROI order:

1. **Character slideshows** — zero narration needed, fully automatable, high shareability
2. **Language vocabulary series** — strong SEO value, narration is the differentiator
3. **History / what-if narratives** — highest production effort but most original content
4. **Lifestyle aesthetics** — easy to produce, good for social reach

The character slideshows can be almost fully scripted and automated once a pipeline is in place. The language/history series is where narration adds real value that can't be easily replicated.
