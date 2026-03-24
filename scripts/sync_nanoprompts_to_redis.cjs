const { createClient } = require("redis");

async function main() {
  const redisHost = "curify-nano-redis.westus2.redis.azure.net";
  const redisPort = "10000";
  const redisPassword = process.env.REDIS_PASSWORD;

  if (!redisHost || !redisPassword) {
    throw new Error("Missing REDIS_HOST or REDIS_PASSWORD");
  }

  const client = createClient({
    socket: {
      host: redisHost,
      port: Number(redisPort),
      tls: true,
      connectTimeout: 5000,
    },
    password: redisPassword,
  });

  client.on("error", (err) => {
    console.error("❌ Redis error:", err);
  });

  client.on("connect", () => {
    console.log("🔌 Connected (socket)");
  });

  client.on("ready", () => {
    console.log("✅ Ready");
  });

  await client.connect();

  // test write
  await client.set("test:key", "hello");

  // test read
  const value = await client.get("test:key");
  console.log("📦 Value:", value);

  await client.quit();
}

main().catch((err) => {
  console.error("🔥 Test failed:", err);
  process.exit(1);
});