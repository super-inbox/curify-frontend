// scripts/check_impromptu_practice.mjs
//
// Browser-level checks for /tools/impromptu-speech-practice. The tool is the
// only surface in this repo that touches getUserMedia / MediaRecorder, and none
// of it is reachable from a type check or an SSR curl — the failures live in
// permission and device states that only a real browser produces.
//
// Run against a dev server:
//     npm run dev
//     node scripts/check_impromptu_practice.mjs
//
// Chromium is launched with fake media devices. Its synthetic device has no
// audio source, so video+audio always rejects headlessly; the happy-path
// context strips audio from the constraint to get a recordable stream. Real
// browsers have a microphone, so this is a harness workaround, not a product
// behaviour — the denied and hanging cases below exercise the real failure
// paths directly.
//
// Two bugs this caught, both of which look fine in code review:
//   * getUserMedia is not guaranteed to settle (device held by another app, or
//     the permission prompt simply ignored). Awaiting it before starting the
//     prep clock left the button looking dead indefinitely.
//   * Choosing a topic from the bank mid-preparation returned the UI to idle
//     but left the camera track live, so the capture light stayed on.

import pw from "/Users/qqwjq/curify-frontend/node_modules/playwright/index.js";
import { statSync } from "fs";
const { chromium } = pw;
const URL_ = "http://localhost:3000/tools/impromptu-speech-practice";
// Console noise this suite deliberately does not fail on, none of it from the
// tool under test:
//   hydrat…        every tool page mismatches — SearchBar renders a random
//                  placeholder. Verified the practice subtree itself is
//                  byte-identical server vs client.
//   fetch-failed   an /interactions/track request still in flight when the
//                  test navigates away; apiClient already swallows it.
//   network/Google  the third-party login script, which is not under test and
//                  fails on a flaky connection.
const IGNORE =
  /hydrat|ApiClient:fetch-failed|ERR_NETWORK_CHANGED|Failed to load resource|Google script/i;
let failures = 0;
const check = (c, m) => { if (!c) failures++; console.log(`  ${c ? "PASS" : "FAIL"}  ${m}`); };
const HYDRATE = 6000; // dev-mode hydration settle

const browser = await chromium.launch({
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
});
const errors = [];
const wire = (pg, tag = "") => {
  pg.on("pageerror", (e) => { if (!IGNORE.test(String(e))) errors.push(tag + String(e)); });
  pg.on("console", (m) => { if (m.type() === "error" && !IGNORE.test(m.text())) errors.push(tag + m.text()); });
};
const topicText = (pg) => pg.locator("#practice p.font-semibold").first().textContent();

// The headless fake device has no audio source, so video+audio always rejects.
// Real browsers have one; strip audio so the happy path is testable at all.
const STRIP_AUDIO = () => {
  const orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = (c) => orig({ video: c.video });
};

// ---------- 1. happy path ----------
console.log("\n--- happy path (synthetic camera) ---");
{
  const ctx = await browser.newContext({ permissions: ["camera", "microphone"], acceptDownloads: true });
  const page = await ctx.newPage();
  wire(page);
  await page.addInitScript(STRIP_AUDIO);
  await page.goto(URL_, { waitUntil: "load", timeout: 180000 });
  await page.waitForSelector("#practice", { timeout: 60000 });
  await page.waitForTimeout(HYDRATE);

  await page.getByRole("button", { name: "Draw a topic" }).click();
  const t1 = (await topicText(page))?.trim();
  check(!!t1 && t1.length > 10, `topic drawn: "${t1?.slice(0, 46)}…"`);
  await page.getByRole("button", { name: "Draw another" }).click();
  check(t1 !== (await topicText(page))?.trim(), "Draw another changes the topic");

  await page.getByRole("button", { name: /Start 30s preparation/ }).click();
  await page.waitForSelector("text=Preparing", { timeout: 15000 });
  check(true, "enters prep phase");
  await page.waitForSelector("#practice video:visible", { timeout: 15000 });
  check(true, "live camera preview visible during prep");
  await page.waitForTimeout(2500); // let the clock tick before asserting on it
  const left = parseInt((await page.locator("#practice .tabular-nums.font-bold").textContent()).split(":")[1], 10);
  check(left < 29 && left > 15, `prep countdown running (${left}s left)`);

  console.log("  … waiting out the 30s prep clock");
  await page.waitForSelector("text=Recording — speak now", { timeout: 45000 });
  check(true, "prep timer auto-advanced into recording at 0");
  check(await page.evaluate(() => document.querySelectorAll("video")[0]?.srcObject != null), "MediaStream attached while recording");

  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "Stop" }).click();
  await page.waitForSelector("text=Download your recording", { timeout: 20000 });
  check(true, "Stop moves to review");
  const src = await page.locator("#practice video[controls]").getAttribute("src");
  check(!!src?.startsWith("blob:"), "playback source is a local blob URL (never uploaded)");
  const dl = await page.getByRole("link", { name: "Download your recording" }).getAttribute("download");
  check(/^impromptu-.+\.(webm|mp4)$/.test(dl || ""), `download filename: ${dl}`);
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }),
    page.getByRole("link", { name: "Download your recording" }).click(),
  ]);
  const size = statSync(await download.path()).size;
  check(size > 1000, `downloaded file is real (${size} bytes)`);
  for (const n of ["Get a transcript", "Add subtitles", "Translate it"]) {
    const href = await page.getByRole("link", { name: n }).getAttribute("href");
    check(!!href?.includes("/tools/"), `continue-CTA "${n}" → ${href}`);
  }
  check(!(await page.evaluate(() => document.querySelectorAll("video")[0]?.srcObject != null)),
        "camera released after stop (capture light off)");

  // shared link + topic bank
  await page.goto(URL_ + "?topic=h07", { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector("#practice", { timeout: 60000 });
  await page.waitForTimeout(HYDRATE);
  check(((await topicText(page)) || "").includes("time machine"), "?topic=h07 resolves to the shared topic");
  const n = await page.locator("section ul li button").count();
  check(n === 88, `all 88 topics rendered server-side as buttons (${n})`);
  await page.locator("section ul li button").nth(3).click();
  await page.waitForTimeout(500);
  check(((await topicText(page)) || "").length > 10, "clicking a bank topic loads it into the timer");
  await ctx.close();
}

// ---------- 2. permission denied ----------
console.log("\n--- camera denied ---");
{
  const ctx = await browser.newContext({ permissions: [] });
  const page = await ctx.newPage();
  wire(page, "denied: ");
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      Promise.reject(new DOMException("Permission denied", "NotAllowedError"));
  });
  await page.goto(URL_, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector("#practice", { timeout: 60000 });
  await page.waitForTimeout(HYDRATE);
  await page.getByRole("button", { name: "Draw a topic" }).click();
  await page.getByRole("button", { name: /Start 30s preparation/ }).click();
  await page.waitForSelector("#practice .bg-amber-50", { timeout: 15000 });
  check(true, "shows a plain no-camera notice");
  check(await page.locator("text=Preparing").isVisible(), "timer still runs without a camera");
  await page.waitForTimeout(2500);
  const t = await page.locator("#practice .tabular-nums.font-bold").textContent();
  check(/0:[012]\d/.test(t || ""), `countdown still ticking (${t?.trim()})`);
  await ctx.close();
}

// ---------- 3. REGRESSION: getUserMedia never settles ----------
console.log("\n--- camera request hangs (device busy / prompt ignored) ---");
{
  const ctx = await browser.newContext({ permissions: [] });
  const page = await ctx.newPage();
  wire(page, "hang: ");
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => new Promise(() => {}); // never settles
  });
  await page.goto(URL_, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector("#practice", { timeout: 60000 });
  await page.waitForTimeout(HYDRATE);
  await page.getByRole("button", { name: "Draw a topic" }).click();
  await page.getByRole("button", { name: /Start 30s preparation/ }).click();
  await page.waitForTimeout(3000);
  const visible = await page.locator("text=Preparing").isVisible();
  check(visible, "prep starts immediately instead of hanging on the camera");
  check(await page.locator("text=waiting for camera permission").isVisible(), "tells the user it is waiting on permission");
  const t = await page.locator("#practice .tabular-nums.font-bold").textContent();
  check(/0:2\d/.test(t || ""), `countdown running while the request is pending (${t?.trim()})`);
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.waitForTimeout(500);
  check(await page.getByRole("button", { name: "Draw another" }).isVisible(), "Cancel returns to idle");
  await ctx.close();
}

// ---------- 4. REGRESSION: bank topic clicked mid-prep must free the camera ----------
console.log("\n--- switching topic mid-prep releases the camera ---");
{
  const ctx = await browser.newContext({ permissions: ["camera", "microphone"] });
  const page = await ctx.newPage();
  wire(page, "switch: ");
  await page.addInitScript(STRIP_AUDIO);
  await page.addInitScript(() => {
    // Record every track we hand out so the test can assert they were stopped.
    window.__tracks = [];
    const orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (c) => {
      const s = await orig(c);
      s.getTracks().forEach((t) => window.__tracks.push(t));
      return s;
    };
  });
  await page.goto(URL_, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector("#practice", { timeout: 60000 });
  await page.waitForTimeout(HYDRATE);
  await page.getByRole("button", { name: "Draw a topic" }).click();
  await page.getByRole("button", { name: /Start 30s preparation/ }).click();
  await page.waitForSelector("#practice video:visible", { timeout: 15000 });
  check(await page.evaluate(() => window.__tracks.some((t) => t.readyState === "live")), "camera live during prep");
  await page.locator("section ul li button").nth(10).click();
  await page.waitForTimeout(1000);
  check(await page.evaluate(() => window.__tracks.every((t) => t.readyState === "ended")),
        "picking a bank topic mid-prep stops every track");
  check(await page.getByRole("button", { name: /Start 30s preparation/ }).isVisible(), "returns to idle with the new topic");
  await ctx.close();
}

await browser.close();
console.log(`\nunexpected page/console errors: ${errors.length}`);
errors.slice(0, 5).forEach((e) => console.log("   ! " + e.slice(0, 160)));
const passed = failures === 0 && errors.length === 0;
console.log(passed ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(passed ? 0 : 1);
