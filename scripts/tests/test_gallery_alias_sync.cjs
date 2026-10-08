const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('Redis detail, related and tag summaries preserve bilingual aliases; old records stay compatible', async () => {
  const item = require('../configs/editorial_gallery_v3_2026_10_08.json').items[0].entry;
  const legacy = { ...item, id: 123, aliases: undefined };
  const writes = new Map();
  let finish;
  const done = new Promise(resolve => { finish = resolve; });
  const pipeline = { set: (key, value) => writes.set(key, JSON.parse(value)), exec: async () => {} };
  const client = { on() {}, connect: async () => {}, multi: () => pipeline, quit: async () => finish() };
  const code = fs.readFileSync(path.join(__dirname, '../sync_nanoprompts_to_redis.cjs'), 'utf8');
  vm.runInNewContext(code, {
    require: name => name === 'redis' ? { createClient: () => client } : name === 'fs' ? { existsSync: () => true, readFileSync: () => JSON.stringify([item, legacy]) } : require(name),
    process: { cwd: () => process.cwd(), env: { REDIS_PASSWORD: 'test-only' }, exit: () => { throw new Error('Unexpected sync failure'); } },
    console: { log() {}, error: console.error },
  });
  await done;
  assert.deepEqual(writes.get(`nano_prompt:${item.id}`).aliases, item.aliases);
  assert.deepEqual(writes.get('nano_prompt:123').aliases, []);
  assert.deepEqual(writes.get('nano_prompt:123').related[0].aliases, item.aliases);
  assert.deepEqual(writes.get('nano_prompts:tag:fashion').find(x => x.id === item.id).aliases, item.aliases);
  assert.deepEqual(writes.get('nano_prompts:most_popular').find(x => x.id === item.id).aliases, item.aliases);
});
