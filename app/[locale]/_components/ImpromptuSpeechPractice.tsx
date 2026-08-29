// app/[locale]/_components/ImpromptuSpeechPractice.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTracking } from "@/services/useTracking";
import {
  IMPROMPTU_TOPICS,
  TOPIC_THEMES,
  TOPICS_BY_THEME,
  drawTopic,
  getTopicById,
  type ImpromptuTopic,
} from "@/lib/impromptu-topics";

// The whole surface is client-side: getUserMedia → MediaRecorder → an object
// URL. Nothing is uploaded, no auth, no credits. That is deliberate — it is
// what lets an anonymous visitor from search complete the loop, which is the
// only way the 4-week funnel numbers mean anything.
//
// Handing the recording off to the subtitle/translate jobs is NOT wired here.
// See docs/video-jobs-spec.md §3: there is no anonymous video upload path, and
// /videos/upload hardcodes a .mp4 filename while MediaRecorder emits WebM. The
// CTA links to those tools instead and the user picks the file they saved.

const PREP_SECONDS = 30;
const SPEAK_SECONDS = 90;

// Content id prefix for interaction tracking. content_type / action_type must
// stay inside the existing enums — the backend silently drops unknown values,
// so a "new" event type would look like zero traffic rather than an error.
const TRACK_ID = "impromptu-speech-practice";

type Phase = "idle" | "prepping" | "recording" | "review";

// Opening a camera is not instant and is not guaranteed to fail fast: if the
// device is held by another app, or the user simply never answers the
// permission prompt, getUserMedia stays pending indefinitely. So the request
// is tracked as its own state and never gates the countdown.
type CameraState = "idle" | "requesting" | "ready" | "unavailable";

/** Pick a container the browser actually supports. Chrome/Firefox give WebM,
 *  Safari gives MP4 — never assume, or the download saves an unplayable file
 *  with the wrong extension. */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  return candidates.find((t) => {
    try {
      return MediaRecorder.isTypeSupported(t);
    } catch {
      return false;
    }
  });
}

function extensionFor(mime: string | undefined): string {
  if (!mime) return "webm";
  if (mime.startsWith("video/mp4")) return "mp4";
  return "webm";
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export default function ImpromptuSpeechPractice() {
  const { trackAction } = useTracking();
  const searchParams = useSearchParams();

  const [topic, setTopic] = useState<ImpromptuTopic | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(PREP_SECONDS);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [copied, setCopied] = useState(false);

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const mimeRef = useRef<string | undefined>(undefined);
  // The object URL currently held, so cleanup does not depend on state that
  // may already have been replaced. A leaked blob URL pins the whole recording
  // in memory for the life of the tab.
  const urlRef = useRef<string | null>(null);
  // Incremented on every start/reset. A getUserMedia promise that resolves
  // after the user has cancelled belongs to a dead run, and its tracks must be
  // stopped rather than attached — otherwise the camera light comes on for a
  // session the user already abandoned.
  const runRef = useRef(0);
  // The getUserMedia callback closes over a stale `phase`, but it must know
  // whether the prep window is still open before attaching a camera. Synced in
  // an effect rather than assigned during render: a concurrent render that is
  // discarded before commit would otherwise leave this pointing at a phase the
  // user never actually reached.
  const phaseRef = useRef<Phase>("idle");

  const track = useCallback(
    (suffix: string, action: "click" | "generate" | "download") => {
      trackAction(
        { contentId: `${TRACK_ID}::${suffix}`, contentType: "tool_card" },
        action,
      );
    },
    [trackAction],
  );

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
  }, []);

  const setUrl = useCallback((next: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next;
    setRecordingUrl(next);
  }, []);

  // Inbound shared link: /tools/impromptu-speech-practice?topic=h07.
  // Read once on mount rather than during render — the draw is random, and a
  // random value computed while rendering does not survive hydration.
  useEffect(() => {
    const fromUrl = getTopicById(searchParams?.get("topic"));
    if (fromUrl) setTopic(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Stop the camera on unmount. Without this the capture light stays on after
  // the user navigates away, which reads as spyware even though it is a leak.
  useEffect(() => {
    return () => {
      releaseStream();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [releaseStream]);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop(); // onstop builds the blob and moves us to "review"
    } else {
      releaseStream();
      setPhase("review");
    }
  }, [releaseStream]);

  const beginRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) {
      // No camera (denied or unsupported): still run the 90s clock so the
      // timing drill works. This is the whole point of the degraded path.
      setPhase("recording");
      setRemaining(SPEAK_SECONDS);
      return;
    }
    try {
      const mimeType = pickMimeType();
      mimeRef.current = mimeType;
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      // The recorder is free to negotiate a different container than the one
      // requested, and rec.mimeType is what it actually produced. Take that,
      // or the saved file gets an extension its bytes do not match.
      mimeRef.current = rec.mimeType || mimeType;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeRef.current || "video/webm",
        });
        chunksRef.current = [];
        releaseStream();
        setUrl(URL.createObjectURL(blob));
        setPhase("review");
        track("record-complete", "generate");
      };
      recorderRef.current = rec;
      rec.start();
      setPhase("recording");
      setRemaining(SPEAK_SECONDS);
    } catch {
      setMediaError(
        "This browser could not start a recording. The topic and timer still work — you can practise without the camera.",
      );
      setPhase("recording");
      setRemaining(SPEAK_SECONDS);
    }
  }, [releaseStream, setUrl, track]);

  // One clock drives both countdowns; it only ever decrements.
  useEffect(() => {
    if (phase !== "prepping" && phase !== "recording") return;
    const id = window.setInterval(
      () => setRemaining((r) => Math.max(0, r - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [phase]);

  // Phase advance lives in its own effect rather than inside the setRemaining
  // updater. React may invoke an updater twice (StrictMode does so in dev), and
  // starting a MediaRecorder from inside one would open two recordings on the
  // same stream.
  useEffect(() => {
    if (remaining !== 0) return;
    if (phase === "prepping") beginRecording();
    else if (phase === "recording") stopRecording();
  }, [remaining, phase, beginRecording, stopRecording]);

  const startPrep = useCallback(() => {
    if (!topic) return;
    setMediaError(null);
    setUrl(null);
    track("start-practice", "click");

    // Start the clock synchronously. Awaiting the camera first meant that a
    // getUserMedia call which never settles left the button looking dead, and
    // the 30 seconds the user was promised had not begun.
    const run = ++runRef.current;
    setPhase("prepping");
    setRemaining(PREP_SECONDS);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable");
      setMediaError(
        "This browser cannot record video. The topic and both timers still work.",
      );
      return;
    }

    setCameraState("requesting");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Attach only while prep is still running. If the permission prompt was
        // answered after the speaking clock already started, the recorder was
        // never created for this take — showing a live preview and "● Recording"
        // at that point would tell the user their speech is being captured when
        // it is not.
        if (runRef.current !== run || phaseRef.current !== "prepping") {
          stream.getTracks().forEach((t) => t.stop());
          if (runRef.current === run) {
            setCameraState("unavailable");
            setMediaError(
              "Camera access arrived too late to record this take — the speaking clock had already started. Your next attempt will record.",
            );
          }
          return;
        }
        streamRef.current = stream;
        if (previewRef.current) previewRef.current.srcObject = stream;
        setCameraState("ready");
      })
      .catch(() => {
        if (runRef.current !== run) return;
        setCameraState("unavailable");
        // Deliberately no silent fall back to video-only: a muted recording of
        // a speech looks fine and is useless, which is a worse outcome than
        // being told plainly that this take will not be recorded.
        setMediaError(
          "No camera or microphone access, so this run will not be recorded. The topic and both timers still work — practising out loud against the clock is most of the value.",
        );
      });
  }, [topic, setUrl, track]);

  const draw = useCallback(() => {
    track("draw", "click");
    runRef.current++;
    releaseStream();
    const next = drawTopic(topic?.id);
    setTopic(next);
    setCameraState("idle");
    setPhase("idle");
    setRemaining(PREP_SECONDS);
    setCopied(false);
  }, [topic, track, releaseStream]);

  const chooseTopic = useCallback(
    (t: ImpromptuTopic) => {
      track("topic-pick", "click");
      // Same teardown as draw(): the user may be mid-prep with the camera open.
      runRef.current++;
      releaseStream();
      setTopic(t);
      setCameraState("idle");
      setMediaError(null);
      setPhase("idle");
      setRemaining(PREP_SECONDS);
      setCopied(false);
      document
        .getElementById("practice")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [track, releaseStream],
  );

  const reset = useCallback(() => {
    runRef.current++;
    releaseStream();
    setUrl(null);
    setPhase("idle");
    setRemaining(PREP_SECONDS);
    setMediaError(null);
    setCameraState("idle");
  }, [releaseStream, setUrl]);

  const copyTopicLink = useCallback(async () => {
    if (!topic || typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}?topic=${topic.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — not worth an error state */
    }
  }, [topic]);

  const downloadName = topic
    ? `impromptu-${slugify(topic.text)}.${extensionFor(mimeRef.current)}`
    : `impromptu-speech.${extensionFor(mimeRef.current)}`;

  const totalForPhase = phase === "recording" ? SPEAK_SECONDS : PREP_SECONDS;
  const pct = phase === "idle" ? 0 : ((totalForPhase - remaining) / totalForPhase) * 100;

  return (
    <div className="text-left">
      {/* ---------------- the practice widget ---------------- */}
      <div
        id="practice"
        className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm"
      >
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Practise now</h2>
          <span className="text-sm text-gray-500 tabular-nums">
            {PREP_SECONDS}s to think · {SPEAK_SECONDS}s to speak
          </span>
        </div>

        {/* topic card */}
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-6 text-center">
          {topic ? (
            <p className="text-lg sm:text-2xl font-semibold text-gray-900 leading-snug text-balance">
              {topic.text}
            </p>
          ) : (
            <p className="text-lg sm:text-xl text-gray-500">
              Draw a topic to start. You get {PREP_SECONDS} seconds to think, then{" "}
              {SPEAK_SECONDS} seconds to answer.
            </p>
          )}
        </div>

        {/* countdown */}
        {(phase === "prepping" || phase === "recording") && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-medium">
              <span
                className={
                  phase === "recording" ? "text-red-600" : "text-[#5a50e5]"
                }
              >
                {phase === "recording"
                  ? cameraState === "ready"
                    ? "● Recording — speak now"
                    : "Speak now (not recording)"
                  : cameraState === "requesting"
                    ? "Preparing — waiting for camera permission…"
                    : "Preparing — plan your opening line"}
              </span>
              <span className="tabular-nums text-gray-900 font-bold text-lg">
                {fmt(remaining)}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-[width] duration-1000 ease-linear ${
                  phase === "recording" ? "bg-red-500" : "bg-[#5a50e5]"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* live camera preview */}
        <video
          ref={previewRef}
          muted
          autoPlay
          playsInline
          className={`mt-5 w-full rounded-xl bg-black aspect-video ${
            cameraState === "ready" && (phase === "prepping" || phase === "recording")
              ? "block"
              : "hidden"
          }`}
        />

        {/* playback */}
        {phase === "review" && recordingUrl && (
          <video
            src={recordingUrl}
            controls
            playsInline
            className="mt-5 w-full rounded-xl bg-black aspect-video"
          />
        )}

        {mediaError && (
          <p className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
            {mediaError}
          </p>
        )}

        {/* controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {phase === "idle" && (
            <>
              <button
                type="button"
                onClick={draw}
                className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                {topic ? "Draw another" : "Draw a topic"}
              </button>
              {topic && (
                <>
                  <button
                    type="button"
                    onClick={startPrep}
                    className="rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-6 py-3 font-bold text-white shadow-lg transition-opacity hover:opacity-90"
                  >
                    Start {PREP_SECONDS}s preparation
                  </button>
                  <button
                    type="button"
                    onClick={copyTopicLink}
                    className="text-sm text-gray-500 underline underline-offset-4 hover:text-gray-800"
                  >
                    {copied ? "Link copied" : "Copy link to this topic"}
                  </button>
                </>
              )}
            </>
          )}

          {phase === "prepping" && (
            <>
              <button
                type="button"
                onClick={beginRecording}
                className="rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-6 py-3 font-bold text-white shadow-lg transition-opacity hover:opacity-90"
              >
                I&apos;m ready — start speaking
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {phase === "recording" && (
            <button
              type="button"
              onClick={stopRecording}
              className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white shadow-lg transition-opacity hover:opacity-90"
            >
              Stop
            </button>
          )}

          {phase === "review" && (
            <>
              {recordingUrl && (
                <a
                  href={recordingUrl}
                  download={downloadName}
                  onClick={() => track("download", "download")}
                  className="rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-6 py-3 font-bold text-white shadow-lg transition-opacity hover:opacity-90"
                >
                  Download your recording
                </a>
              )}
              <button
                type="button"
                onClick={draw}
                className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                New topic
              </button>
              <button
                type="button"
                onClick={startPrep}
                className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Same topic again
              </button>
            </>
          )}
        </div>

        {/* Nothing leaves the browser, and saying so plainly is the honest
            answer to the question a camera prompt provokes. */}
        <p className="mt-4 text-xs text-gray-500">
          Recording happens entirely in your browser. Nothing is uploaded, and
          nothing is stored on our servers — if you want to keep a take,
          download it before you leave the page.
        </p>

        {/* continue-to-a-real-job CTA — the >5% signal in the 4-week review */}
        {phase === "review" && recordingUrl && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="font-semibold text-gray-900">
              Next: turn this take into something you can study
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Reading your own words back is where most of the improvement
              happens — filler words and run-on sentences are much easier to see
              than to hear. Download the file above, then drop it into:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { slug: "video-transcript-generator", label: "Get a transcript" },
                { slug: "bilingual-subtitles", label: "Add subtitles" },
                { slug: "translate-subtitles", label: "Translate it" },
              ].map((c) => (
                <Link
                  key={c.slug}
                  href={`/tools/${c.slug}`}
                  onClick={() => track(`cta-${c.slug}`, "click")}
                  className="rounded-lg border border-[#5a50e5] px-4 py-2 text-sm font-semibold text-[#5a50e5] hover:bg-[#5a50e5] hover:text-white transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------------- the topic bank ----------------
          Rendered unconditionally so it is present in the server HTML. This is
          the part that answers "impromptu speech topics" (1.3k/mo, informational
          intent) — the recorder above is the differentiator, not the hook.
          Buttons rather than ?topic= links on purpose: 88 crawlable query URLs
          would be near-duplicates of this page. */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900">
          {IMPROMPTU_TOPICS.length} impromptu speech topics
        </h2>
        <p className="mt-2 max-w-2xl text-gray-600">
          These come from years of running table-topics sessions, not from a
          generator — every one has been put to a real room. Tap any topic to
          load it into the timer above.
        </p>

        {TOPIC_THEMES.map((theme) => (
          <div key={theme.id} className="mt-8">
            <h3 className="text-lg font-bold text-gray-900">{theme.label}</h3>
            <p className="mt-1 mb-3 max-w-2xl text-sm text-gray-600">
              {theme.blurb}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {TOPICS_BY_THEME[theme.id].map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => chooseTopic(t)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-[15px] text-gray-800 hover:border-[#5a50e5] hover:bg-[#5a50e5]/5 transition-colors"
                  >
                    {t.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
