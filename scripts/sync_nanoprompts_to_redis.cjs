const fs = require("fs");
const path = require("path");
const { createCluster } = require("redis");

const SOURCE_PATH = path.join(process.cwd(), "public", "data", "nanobanana.json");

function safeString(v) {
  return typeof v === "string" ? v : "";
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalizeTag(tag) {
  return safeString(tag).trim().toLowerCase();
}

function toSummary(prompt) {
  return {
    id: prompt.id,
    title: safeString(prompt.title),
    description: safeString(prompt.description),
    prompt: safeString(prompt.promptText),
    imageURL: safeString(prompt.imageUrl),
    tags: safeArray(prompt.tags),
  };
}

function scorePrompt(prompt) {
  const likes = Number(prompt.likes || 0);
  const retweets = Number(prompt.retweets || 0);
  return likes + retweets;
}

function validatePrompt(prompt) {
  if (prompt == null || typeof prompt !== "object") return false;
  if (prompt.id == null) return false;
  if (!safeString(prompt.title)) return false;
  if (!safeString(prompt.promptText)) return false;
  return true;
}

function hasTagOverlap(aTags, bTags) {
  const setA = new Set(safeArray(aTags).map(normalizeTag).filter(Boolean));
  const arrB = safeArray(bTags).map(normalizeTag).filter(Boolean);

  if (setA.size === 0 || arrB.length === 0) return false;
  return arrB.some((tag) => setA.has(tag));
}

function buildRelatedPrompts(currentPrompt, allPrompts, limit = 4) {
  return allPrompts
    .filter((p) => p.id !== currentPrompt.id)
    .filter((p) => hasTagOverlap(currentPrompt.tags, p.tags))
    .sort((a, b) => scorePrompt(b) - scorePrompt(a))
    .slice(0, limit)
    .map(toSummary);
}

async function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`Source file not found: ${SOURCE_PATH}`);
  }

  const raw = fs.readFileSync(SOURCE_PATH, "utf-8");
  const parsed = JSON.parse(raw);

  const prompts = Array.isArray(parsed.prompts) ? parsed.prompts : [];
  const validPrompts = prompts.filter(validatePrompt);

  console.log(`Loaded ${prompts.length} prompts, ${validPrompts.length} valid.`);

  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT || "10000";
  const redisUsername = process.env.REDIS_USERNAME || "default";
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisTls = (process.env.REDIS_TLS || "true").toLowerCase() === "true";

  if (!redisHost || !redisPassword) {
    throw new Error("Missing Redis config: REDIS_HOST or REDIS_PASSWORD");
  }

  const protocol = redisTls ? "rediss" : "redis";
  const rootUrl = `${protocol}://${encodeURIComponent(redisUsername)}:${encodeURIComponent(redisPassword)}@${redisHost}:${redisPort}`;

  const client = createCluster({
    rootNodes: [{ url: rootUrl }],
    defaults: {
      socket: {
        tls: redisTls,
      },
      username: redisUsername,
      password: redisPassword,
    },
  });

  client.on("error", (err) => {
    console.error("Redis Cluster Error:", err);
  });

  await client.connect();
  console.log("Connected to Redis cluster.");

  const pipeline = client.multi();

  for (const prompt of validPrompts) {
    const fullPrompt = {
      id: prompt.id,
      title: safeString(prompt.title),
      description: safeString(prompt.description),
      prompt: safeString(prompt.promptText),
      imageURL: safeString(prompt.imageUrl),
      tags: safeArray(prompt.tags),
      sourceUrl: safeString(prompt.sourceUrl),
      sourceType: safeString(prompt.sourceType),
      category: safeString(prompt.category),
      likes: Number(prompt.likes || 0),
      retweets: Number(prompt.retweets || 0),
      related: buildRelatedPrompts(prompt, validPrompts, 4),
    };

    pipeline.set(`nano_prompt:${prompt.id}`, JSON.stringify(fullPrompt));
  }

  const mostPopular = [...validPrompts]
    .sort((a, b) => scorePrompt(b) - scorePrompt(a))
    .slice(0, 100)
    .map(toSummary);

  pipeline.set("nano_prompts:most_popular", JSON.stringify(mostPopular));

  const tagMap = new Map();

  for (const prompt of validPrompts) {
    const tags = safeArray(prompt.tags);

    for (const rawTag of tags) {
      const tag = normalizeTag(rawTag);
      if (!tag) continue;

      if (!tagMap.has(tag)) tagMap.set(tag, []);
      tagMap.get(tag).push(prompt);
    }
  }

  for (const [tag, items] of tagMap.entries()) {
    const summaries = items
      .sort((a, b) => scorePrompt(b) - scorePrompt(a))
      .map(toSummary);

    pipeline.set(`nano_prompts:tag:${tag}`, JSON.stringify(summaries));
  }

  const metadata = {
    totalPrompts: validPrompts.length,
    totalTags: tagMap.size,
    updatedAt: new Date().toISOString(),
    topTags: [...tagMap.entries()]
      .map(([tag, items]) => ({ tag, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50),
  };

  pipeline.set("nano_prompts:metadata", JSON.stringify(metadata));

  await pipeline.exec();

  console.log("Redis sync complete.");
  console.log(`Wrote ${validPrompts.length} nano_prompt:{id} keys`);
  console.log(`Wrote 1 nano_prompts:most_popular key`);
  console.log(`Wrote ${tagMap.size} nano_prompts:tag:{tag} keys`);

  await client.close();
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});