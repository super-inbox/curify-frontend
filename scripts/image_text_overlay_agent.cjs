const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const OpenAI = require('openai');
const { GoogleGenAI, Modality } = require('@google/genai');

/**
 * Frontend-side prototype script for:
 * 1. loading image configs from public/data/nanobanana.json
 * 2. resolving CDN image URLs
 * 3. using OpenAI to analyze image + propose 3 text overlay ideas
 * 4. using OpenAI to write image-edit prompts for each idea
 * 5. using Gemini to edit the image with text overlay
 * 6. saving edited images to public/image_text_layout/
 *
 * Usage:
 *   node scripts/image_text_overlay_agent.cjs 3945
 *   node scripts/image_text_overlay_agent.cjs 3945 1022 9001
 *   node scripts/image_text_overlay_agent.cjs 3945 --print-only
 */

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'public', 'data', 'nanobanana.json');
const OUTPUT_DIR = path.join(ROOT, 'public', 'image_text_layout');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CDN_BASE = (process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_CDN_BASE || 'https://cdn.curify-ai.com').replace(/\/$/, '');

const OPENAI_MODEL = process.env.OPENAI_IMAGE_ANALYSIS_MODEL || 'gpt-4.1';
const GEMINI_MODEL = process.env.GEMINI_IMAGE_EDIT_MODEL || process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function loadImageConfigs() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`nanobanana.json not found: ${DATA_PATH}`);
  }

  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  if (raw && Array.isArray(raw.prompts)) return raw.prompts;

  const topLevelKeys = raw && typeof raw === 'object' ? Object.keys(raw) : [];
  throw new Error(
    `Expected nanobanana.json to be an array or contain { items: [] } / { prompts: [] }. Found top-level keys: ${topLevelKeys.join(', ')}`
  );
}

function getImageConfigById(items, imageId) {
  const item = items.find((x) => Number(x.id) === Number(imageId));
  if (!item) throw new Error(`Image id ${imageId} not found in nanobanana.json`);
  return item;
}

function resolveImageUrl(item) {
  const raw = item.imageUrl || item.image_url;
  if (!raw) {
    throw new Error(`No imageUrl found for image id ${item.id}`);
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${CDN_BASE}${raw}`;
  return `${CDN_BASE}/${raw}`;
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(downloadBuffer(res.headers.location));
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

function inferMimeType(url) {
  const lower = url.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function toDataUrl(buffer, mimeType) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function slugify(text, maxWords = 6) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/[-\s]+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join('-') || 'text-overlay';
}

async function proposeTextConcepts(item, imageBuffer, mimeType) {
  const systemPrompt = [
    'You are a visual social content strategist.',
    'Analyze one image and propose exactly 3 strong text-overlay concepts that could perform well on social media.',
    'Return only valid JSON as an array with exactly 3 objects.',
    'Each object must contain:',
    '- style: short label such as mysterious, dark-romantic, minimal-power',
    '- sentence: one original overlay sentence, concise and memorable',
    '- why_it_fits: 1-2 sentences',
    '- visual_direction: short paragraph about layout / typography / color / mood',
    '- keyword_slug: 2-6 lowercase hyphenated words suitable for filename use',
    'Requirements:',
    '- Sentence must match image mood',
    '- Aim for viral / shareable / saveable social content',
    '- Keep each sentence under 18 words',
    '- Avoid clichés unless elevated stylistically'
  ].join('\n');

  const userPrompt = `Analyze this image and metadata below.\n\nMetadata:\n${JSON.stringify(
    {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      layoutCategory: item.layoutCategory,
      domainCategory: item.domainCategory,
      topic: item.topic,
      tags: item.tags || [],
      promptText: item.promptText || ''
    },
    null,
    2
  )}`;

  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: systemPrompt }]
      },
      {
        role: 'user',
        content: [
          { type: 'input_text', text: userPrompt },
          { type: 'input_image', image_url: toDataUrl(imageBuffer, mimeType) }
        ]
      }
    ]
  });

  const text = response.output_text.trim();
  let proposals;
  try {
    proposals = JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse OpenAI proposals JSON:\n${text}`);
  }

  if (!Array.isArray(proposals) || proposals.length !== 3) {
    throw new Error(`Expected exactly 3 proposals, got: ${text}`);
  }
  return proposals;
}

async function buildEditPrompt(item, proposal) {
  const systemPrompt = [
    'You are an expert image editing prompt writer.',
    'Write a single precise prompt for an image editing model.',
    'The prompt must preserve the original composition while adding the text directly onto the image.',
    'Output only the final editing prompt as plain text.',
    'Requirements:',
    '- Preserve subject pose, lighting, composition, and mood',
    '- Add only one text overlay using the exact sentence',
    '- Specify layout, line breaks, typography style, color, opacity, spacing, and readability',
    '- Keep it tasteful and premium',
    '- Do not add new objects or alter the subject',
    '- Make the text feel integrated, not like a sticker'
  ].join('\n');

  const userPrompt = `Image metadata:\n${JSON.stringify(
    {
      title: item.title,
      description: item.description,
      category: item.category,
      domainCategory: item.domainCategory,
      topic: item.topic
    },
    null,
    2
  )}\n\nChosen proposal:\n${JSON.stringify(proposal, null, 2)}`;

  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: systemPrompt }]
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: userPrompt }]
      }
    ]
  });

  return response.output_text.trim();
}

async function editImageWithGemini(imageBuffer, mimeType, prompt) {
  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: imageBuffer.toString('base64') } }
        ]
      }
    ]
  });

  const directParts = response?.parts || [];
  const candidateParts = response?.candidates?.[0]?.content?.parts || [];
  const parts = directParts.length ? directParts : candidateParts;

  for (const part of parts) {
    if (typeof part?.inlineData?.data === 'string' && part.inlineData.data) {
      return Buffer.from(part.inlineData.data, 'base64');
    }

    if (part?.inlineData?.data && Buffer.isBuffer(part.inlineData.data)) {
      return part.inlineData.data;
    }
  }

  const textParts = parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join('\n');

  throw new Error(`Gemini did not return edited image bytes. Response text: ${textParts || '[none]'}`);
}

async function processImageId(item, options = {}) {
  const imageUrl = resolveImageUrl(item);
  const imageBuffer = await downloadBuffer(imageUrl);
  const mimeType = inferMimeType(imageUrl);

  const proposals = await proposeTextConcepts(item, imageBuffer, mimeType);
  const results = [];

  for (let i = 0; i < proposals.length; i += 1) {
    const proposal = proposals[i];
    const editPrompt = await buildEditPrompt(item, proposal);

    if (options.printOnly) {
      results.push({
        image_id: item.id,
        proposal_index: i + 1,
        style: proposal.style,
        sentence: proposal.sentence,
        why_it_fits: proposal.why_it_fits,
        visual_direction: proposal.visual_direction,
        keyword_slug: proposal.keyword_slug,
        edit_prompt: editPrompt
      });
      continue;
    }

    const editedBuffer = await editImageWithGemini(imageBuffer, mimeType, editPrompt);
    const keyword = proposal.keyword_slug || slugify(proposal.sentence);
    const fileName = `${item.id}_${i + 1}_${keyword}.png`;
    const outputPath = path.join(OUTPUT_DIR, fileName);
    fs.writeFileSync(outputPath, editedBuffer);

    results.push({
      image_id: item.id,
      proposal_index: i + 1,
      style: proposal.style,
      sentence: proposal.sentence,
      why_it_fits: proposal.why_it_fits,
      visual_direction: proposal.visual_direction,
      keyword_slug: keyword,
      edit_prompt: editPrompt,
      output_path: outputPath,
      source_url: imageUrl
    });
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const printOnly = args.includes('--print-only');
  const imageIds = args.filter((x) => x !== '--print-only').map((x) => Number(x)).filter(Boolean);

  if (imageIds.length === 0) {
    console.error('Usage: node scripts/image_text_overlay_agent.cjs 3945 [moreIds] [--print-only]');
    process.exit(1);
  }

  const items = loadImageConfigs();
  const output = {};

  for (const imageId of imageIds) {
    try {
      const item = getImageConfigById(items, imageId);
      output[imageId] = await processImageId(item, { printOnly });
    } catch (err) {
      output[imageId] = [{ error: err.message, image_id: imageId }];
    }
  }

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
