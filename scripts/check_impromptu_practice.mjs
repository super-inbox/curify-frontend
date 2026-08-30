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

// ---------- 5. mic level: audible vs silent vs no track ----------
// A take with video and a silent audio track is the worst failure this tool
// has — it looks completely normal until playback, by which point the user has
// spent 90 seconds. These three cases cover what the meter has to distinguish.
async function micCase(mode) {
  const ctx = await browser.newContext({ permissions: ["camera", "microphone"] });
  const page = await ctx.newPage();
  wire(page, `mic-${mode}: `);
  await page.addInitScript(([m]) => {
    navigator.mediaDevices.getUserMedia = async () => {
      const cv = Object.assign(document.createElement("canvas"), { width: 320, height: 240 });
      const g = cv.getContext("2d");
      setInterval(() => { g.fillStyle = "#" + Math.floor(Math.random() * 16777215).toString(16); g.fillRect(0, 0, 320, 240); }, 100);
      const video = cv.captureStream(25).getVideoTracks();
      if (m === "notrack") return new MediaStream(video);
      const ac = new AudioContext();
      const dest = ac.createMediaStreamDestination();
      if (m === "tone") { const o = ac.createOscillator(); o.start(); o.connect(dest); }
      // "silent": a real audio track carrying nothing — what a dead or
      // wrongly-selected input device actually produces.
      return new MediaStream([...video, ...dest.stream.getAudioTracks()]);
    };
  }, [mode]);
  await page.goto(URL_, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector("#practice", { timeout: 60000 });
  await page.waitForTimeout(HYDRATE);
  await page.getByRole("button", { name: "Draw a topic" }).click();
  await page.getByRole("button", { name: /Start 30s preparation/ }).click();
  await page.waitForSelector("#practice video:visible", { timeout: 15000 });
  await page.waitForTimeout(1500);
  if (mode === "notrack") {
    check(await page.locator("text=No microphone track").isVisible(), "[notrack] warns during prep that there is no mic track");
  } else {
    const lvl = await page.evaluate(() => {
      const el = document.querySelector("#practice [data-level]");
      return el ? Number(el.dataset.level) : -1;
    });
    check(mode === "tone" ? lvl >= 1 : lvl === 0,
          `[${mode}] meter ${mode === "tone" ? "lights up" : "stays dark"} (${lvl}/3 dots)`);
  }
  await page.getByRole("button", { name: /I'm ready/ }).click();
  await page.waitForTimeout(3500);
  await page.getByRole("button", { name: "Stop" }).click();
  await page.waitForSelector("text=Download your recording", { timeout: 20000 });
  const warned = await page.locator("text=This take looks silent").isVisible();
  check(mode === "tone" ? !warned : warned,
        mode === "tone" ? "[tone] no false silent-warning on a good take" : `[${mode}] flags the silent take on review`);
  await ctx.close();
}
console.log("\n--- mic level ---");
for (const m of ["tone", "silent", "notrack"]) await micCase(m);

// ---------- 6. local persistence ----------
// Nothing is uploaded, so "keep my work" can only mean this browser: the topic
// in localStorage, the take in IndexedDB. The subtle failure here is ordering —
// an effect that saves on change also runs on mount with a null topic, and
// clearing there wipes the stored id just before the async restore reads it.
console.log("\n--- local persistence ---");
{
  const ctx = await browser.newContext({ permissions: ["camera", "microphone"] });
  const page = await ctx.newPage();
  wire(page, "persist: ");
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const cv = Object.assign(document.createElement("canvas"), { width: 320, height: 240 });
      const g = cv.getContext("2d");
      setInterval(() => { g.fillStyle = "#" + Math.floor(Math.random() * 16777215).toString(16); g.fillRect(0, 0, 320, 240); }, 100);
      const ac = new AudioContext(); const o = ac.createOscillator(); o.start();
      const d = ac.createMediaStreamDestination(); o.connect(d);
      return new MediaStream([...cv.captureStream(25).getVideoTracks(), ...d.stream.getAudioTracks()]);
    };
  });
  const topicOf = () => page.locator("#practice p.font-semibold").first().textContent();
  const load = async (u = URL_) => {
    await page.goto(u, { waitUntil: "load", timeout: 180000 });
    await page.waitForSelector("#practice", { timeout: 60000 });
    await page.waitForTimeout(HYDRATE);
  };

  await load();
  await page.getByRole("button", { name: "Draw a topic" }).click();
  const t1 = (await topicOf())?.trim();
  await page.goto("http://localhost:3000/tools", { waitUntil: "load", timeout: 180000 });
  await load();
  check((await topicOf())?.trim() === t1, "drawn topic survives navigating away and back");

  await page.getByRole("button", { name: /Start 30s preparation/ }).click();
  await page.waitForSelector("#practice video:visible", { timeout: 15000 });
  await page.getByRole("button", { name: /I'm ready/ }).click();
  await page.waitForTimeout(3500);
  await page.getByRole("button", { name: "Stop" }).click();
  await page.waitForSelector("text=Download your recording", { timeout: 20000 });
  check(!(await page.locator("text=could not be saved").isVisible()), "take persisted without a save error");

  await load();
  check(await page.locator("text=Download your recording").isVisible(), "playback restored after a full reload");
  check(await page.locator("text=restored from this browser").isVisible(), "says the take was restored");
  check((await topicOf())?.trim() === t1, "restored take keeps the topic it was recorded for");
  const bytes = await page.evaluate(async () => {
    const v = document.querySelector("#practice video[controls]");
    return (await (await fetch(v.src)).blob()).size;
  });
  check(bytes > 1000, `restored blob is intact (${bytes} bytes)`);

  await page.getByRole("button", { name: "Delete this recording" }).click();
  await page.waitForTimeout(800);
  check(!(await page.locator("text=Download your recording").isVisible()), "delete clears the review immediately");
  await load();
  check(!(await page.locator("text=Download your recording").isVisible()), "deleted take does not come back on reload");

  await load(URL_ + "?topic=f01");
  check(((await topicOf()) || "").includes("snake"), "a shared ?topic= link beats stored state");
  await ctx.close();
}

// ---------- 7. input device picker ----------
// Reported from real use: Chrome had defaulted to "Microsoft Teams Audio Device
// (Virtual)", a loopback device that carries no microphone audio, which is why
// takes came out silent while Google Meet — which has its own picker — worked
// fine. Simulate exactly that: a silent virtual device holding the default
// slot, plus a real mic.
console.log("\n--- input device picker ---");
{
  const ctx = await browser.newContext({ permissions: ["camera", "microphone"] });
  const page = await ctx.newPage();
  wire(page, "devices: ");
  const INJECT = () => {
    // Two inputs, mirroring the reported situation: a virtual conferencing
    // device holding the default slot and carrying nothing, plus a real mic.
    const DEVS = [
      { deviceId: "teams", label: "Microsoft Teams Audio Device (Virtual)", silent: true },
      { deviceId: "mbp",   label: "MacBook Pro Microphone",                 silent: false },
    ];
    navigator.mediaDevices.enumerateDevices = async () => [
      ...DEVS.map(d => ({ kind: "audioinput", deviceId: d.deviceId, label: d.label, groupId: "g" })),
      { kind: "videoinput", deviceId: "cam", label: "FaceTime HD Camera", groupId: "g" },
    ];
    navigator.mediaDevices.getUserMedia = async (c) => {
      const want = c?.audio?.deviceId?.exact ?? c?.audio?.deviceId?.ideal ?? "teams";
      const dev = DEVS.find(d => d.deviceId === want) ?? DEVS[0];
      const cv = Object.assign(document.createElement("canvas"), { width:320, height:240 });
      const g = cv.getContext("2d");
      setInterval(()=>{g.fillStyle="#"+Math.floor(Math.random()*16777215).toString(16);g.fillRect(0,0,320,240);},100);
      const ac = new AudioContext();
      const dest = ac.createMediaStreamDestination();
      if (!dev.silent) { const o = ac.createOscillator(); o.start(); o.connect(dest); }
      const at = dest.stream.getAudioTracks()[0];
      Object.defineProperty(at, "label", { value: dev.label });
      at.getSettings = () => ({ deviceId: dev.deviceId });
      window.__lastRequested = dev.deviceId;
      return new MediaStream([...cv.captureStream(25).getVideoTracks(), at]);
    };
  };
  await page.addInitScript(INJECT);
  const load = async () => { await page.goto(URL_,{waitUntil:"load",timeout:180000}); await page.waitForSelector("#practice",{timeout:60000}); await page.waitForTimeout(6000); };
  const meter = () => page.evaluate(() => { const e=document.querySelector("#practice [data-level]"); return e?Number(e.dataset.level):-1; });
  const sel = page.locator("#practice select");

  console.log("\n--- default is the silent virtual device ---");
  await load();
  await page.getByRole("button",{name:"Draw a topic"}).click();
  await page.getByRole("button",{name:/Start 30s preparation/}).click();
  await page.waitForSelector("#practice video:visible",{timeout:15000});
  await page.waitForTimeout(1500);
  check(await sel.isVisible(), "input picker is shown");
  check(await sel.inputValue() === "teams", "picker reflects the device actually in use (teams)");
  check((await sel.locator("option").allTextContents()).length === 2, "both inputs listed");
  check(await meter() === 0, `meter dark on the virtual device (${await meter()}/3 dots)`);

  console.log("\n--- switching input ---");
  await sel.selectOption("mbp");
  await page.waitForTimeout(2000);
  check(await page.evaluate(() => window.__lastRequested) === "mbp", "re-acquired the stream on the chosen device");
  check(await meter() >= 1, `meter lights up after switching (${await meter()}/3 dots)`);
  check(await page.locator("text=Preparing").isVisible(), "still in prep — the clock was not lost");

  console.log("\n--- choice is remembered ---");
  await page.getByRole("button",{name:/I'm ready/}).click();
  await page.waitForTimeout(2500);
  check(await sel.isDisabled(), "picker locked during recording");
  await page.getByRole("button",{name:"Stop"}).click();
  await page.waitForSelector("text=Download your recording",{timeout:20000});
  check(!(await page.locator("text=This take looks silent").isVisible()), "good take not flagged silent");
  await load();
  // The take persists, so a reload lands in review — start the next one from there.
  check(await page.locator("text=restored from this browser").isVisible(), "reload restores the take (persistence intact)");
  await page.getByRole("button",{name:"Same topic again"}).click();
  await page.waitForSelector("#practice video:visible",{timeout:15000});
  await page.waitForTimeout(1500);
  check(await page.evaluate(() => window.__lastRequested) === "mbp", "remembered the chosen mic after a reload");
  check(await meter() >= 1, "meter live on the remembered device");
  await ctx.close();
}

await browser.close();
console.log(`\nunexpected page/console errors: ${errors.length}`);
errors.slice(0, 5).forEach((e) => console.log("   ! " + e.slice(0, 160)));
const passed = failures === 0 && errors.length === 0;
console.log(passed ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(passed ? 0 : 1);
