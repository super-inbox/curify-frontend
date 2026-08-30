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
import {
  clearTake,
  loadTake,
  loadMicId,
  loadTopicId,
  saveMicId,
  saveTake,
  saveTopicId,
} from "@/lib/impromptu-storage";

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

// RMS above this counts as "we heard something". Deliberately low (~-54 dBFS):
// this is not a quality bar, it only separates a live input from a dead one. A
// distant mic with aggressive noise suppression and low gain can sit well under
// the -40 dBFS that sounds like a reasonable threshold, and a false "no sound"
// on a good take is far worse than staying quiet.
const SILENCE_RMS = 0.002;
// RMS that fills the meter. Normal speaking voice peaks well under 1.0.
// Level buckets for the three-dot indicator. Speech normally sits in the top
// two; the first dot exists to show the input is alive at all.
const METER_STEPS = [0.015, 0.05];
const DOT_LIT = "#10b981"; // emerald-500
const DOT_DIM = "#d1d5db"; // gray-300

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
  // A recording with a video track and a silent audio track looks completely
  // normal until playback, which for a *speech* tool is the worst possible
  // failure: the user spends 90 seconds and finds out afterwards. The meter
  // makes input visible during prep, and this flags a take that captured
  // nothing.
  const [noSound, setNoSound] = useState(false);
  const [hasAudioTrack, setHasAudioTrack] = useState(true);
  // A restored take is not re-derivable, so if persisting it failed the user
  // has to be told before they navigate away trusting it was kept.
  const [saveFailed, setSaveFailed] = useState(false);
  const [restored, setRestored] = useState(false);
  // What the browser reports about the chosen input. track.muted is the
  // authoritative "this track is producing no data" signal — far more reliable
  // than inferring it from amplitude — and the label tells the user which
  // device Chrome actually picked, which is the usual culprit.
  const [audioInfo, setAudioInfo] = useState<{
    label: string;
    muted: boolean;
    enabled: boolean;
    readyState: string;
  } | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string | null>(null);

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
  // Meter plumbing. The level is written straight to the bar's style in a rAF
  // loop rather than through state — 60 re-renders a second to animate one
  // <div> would be absurd, and it would re-render the 88-item topic list too.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const meterRef = useRef<HTMLDivElement | null>(null);
  // Last bucket painted, so the rAF loop only touches the DOM when the level
  // actually crosses a threshold rather than on every one of 60 frames.
  const lastLitRef = useRef(-1);
  const sawSoundRef = useRef(false);
  // Whether the level meter actually ran. Without this, any failure to measure
  // (AudioContext blocked, constructor missing, exception) left sawSound false
  // and was reported as silence — inferring "no sound" from "no data", which is
  // how a perfectly good recording gets branded silent.
  const meterRanRef = useRef(false);
  // Read in rec.onstop, which cannot see the hasAudioTrack state value.
  const hasAudioRef = useRef(true);
  // rec.onstop is created once per take and closes over `topic`. Reading it
  // through a ref avoids filing the wrong topic against a recording if the
  // callback outlives the render that made it.
  const topicRef = useRef<ImpromptuTopic | null>(null);
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

  /** Light 0-3 dots. Written straight to the DOM: re-rendering the component
   *  (and its 88-item topic list) to animate three dots would be absurd. */
  const paintDots = useCallback((lit: number) => {
    const el = meterRef.current;
    if (!el || lastLitRef.current === lit) return;
    lastLitRef.current = lit;
    el.dataset.level = String(lit);
    Array.from(el.children).forEach((dot, i) => {
      (dot as HTMLElement).style.backgroundColor = i < lit ? DOT_LIT : DOT_DIM;
    });
  }, []);

  const stopMeter = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    paintDots(0);
  }, [paintDots]);

  const startMeter = useCallback(
    (stream: MediaStream) => {
      stopMeter();
      if (stream.getAudioTracks().length === 0) {
        hasAudioRef.current = false;
        setHasAudioTrack(false);
        return;
      }
      hasAudioRef.current = true;
      setHasAudioTrack(true);
      const at = stream.getAudioTracks()[0];
      const readInfo = () =>
        setAudioInfo({
          label: at.label || "unknown input",
          muted: at.muted,
          enabled: at.enabled,
          readyState: at.readyState,
        });
      readInfo();
      at.onmute = readInfo;
      at.onunmute = readInfo;
      meterRanRef.current = false;
      lastLitRef.current = -1;
      try {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return;
        const ac = new Ctor();
        audioCtxRef.current = ac;
        // A fresh AudioContext can be created suspended under the autoplay
        // policy, and a suspended context feeds the analyser nothing but zeros.
        if (ac.state === "suspended") void ac.resume().catch(() => {});
        const analyser = ac.createAnalyser();
        analyser.fftSize = 1024;
        ac.createMediaStreamSource(stream).connect(analyser);
        const buf = new Float32Array(analyser.fftSize);
        const tick = () => {
          analyser.getFloatTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
          const rms = Math.sqrt(sum / buf.length);
          // Only trust a silence verdict from a context that is actually
          // running; a suspended one reports zeros forever.
          if (audioCtxRef.current?.state === "running") meterRanRef.current = true;
          if (rms > SILENCE_RMS) sawSoundRef.current = true;
          paintDots(
            rms <= SILENCE_RMS
              ? 0
              : rms < METER_STEPS[0]
                ? 1
                : rms < METER_STEPS[1]
                  ? 2
                  : 3,
          );
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // The meter is a diagnostic, not the feature. Never let it stop a take.
      }
    },
    [stopMeter, paintDots],
  );

  const releaseStream = useCallback(() => {
    stopMeter();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
  }, [stopMeter]);

  const setUrl = useCallback((next: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next;
    setRecordingUrl(next);
  }, []);

  // Restore on mount, in precedence order. All of it runs after mount rather
  // than during render: a shared link, localStorage and IndexedDB are none of
  // them available to the server, and reading them while rendering would not
  // survive hydration.
  //
  //   1. ?topic= from a shared link — an explicit request beats any local state
  //   2. a previously recorded take, which also restores the topic it was for
  //   3. the last drawn topic
  useEffect(() => {
    let alive = true;
    const fromUrl = getTopicById(searchParams?.get("topic"));
    if (fromUrl) {
      setTopic(fromUrl);
      return;
    }
    void (async () => {
      const take = await loadTake();
      if (!alive) return;
      if (take) {
        mimeRef.current = take.mimeType;
        urlRef.current = URL.createObjectURL(take.blob);
        setRecordingUrl(urlRef.current);
        setTopic(getTopicById(take.topicId));
        setNoSound(take.noSound);
        setPhase("review");
        setRestored(true);
        return;
      }
      const stored = getTopicById(loadTopicId());
      if (stored) setTopic(stored);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    topicRef.current = topic;
    // Only ever write a real topic. This effect also runs on mount, when topic
    // is still null, and clearing here would wipe the stored id a moment before
    // the async restore below gets to read it.
    if (topic) saveTopicId(topic.id);
  }, [topic]);

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
      sawSoundRef.current = false; // judge the take, not the prep window
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeRef.current || "video/webm",
        });
        chunksRef.current = [];
        // Two ways to be sure: there was no audio track at all, or the meter
        // ran and measured nothing. If the meter simply never ran we do not
        // know, and saying nothing beats accusing a good take.
        const silent =
          !hasAudioRef.current || (meterRanRef.current && !sawSoundRef.current);
        setNoSound(silent);
        releaseStream();
        setUrl(URL.createObjectURL(blob));
        setPhase("review");
        setRestored(false);
        track("record-complete", "generate");
        void saveTake({
          blob,
          topicId: topicRef.current?.id ?? null,
          mimeType: mimeRef.current || "video/webm",
          noSound: silent,
          createdAt: Date.now(),
        }).then((ok) => setSaveFailed(!ok));
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

  // Labels are blank until permission has been granted at least once, so this
  // is always called after a successful getUserMedia.
  const refreshDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setAudioDevices(all.filter((d) => d.kind === "audioinput" && d.deviceId));
    } catch {
      // Enumeration is a convenience; recording does not depend on it.
    }
  }, []);

  const attach = useCallback(
    (stream: MediaStream) => {
      streamRef.current = stream;
      if (previewRef.current) previewRef.current.srcObject = stream;
      setCameraState("ready");
      startMeter(stream);
      const id = stream.getAudioTracks()[0]?.getSettings().deviceId ?? null;
      if (id) setSelectedMicId(id);
      void refreshDevices();
    },
    [startMeter, refreshDevices],
  );

  /** Swap the microphone without losing the prep clock. Blocked mid-recording:
   *  the MediaRecorder is bound to the stream we would be tearing down. */
  const switchMic = useCallback(
    async (deviceId: string) => {
      if (phaseRef.current === "recording") return;
      saveMicId(deviceId);
      setSelectedMicId(deviceId);
      setMediaError(null);
      const run = ++runRef.current;
      releaseStream();
      setCameraState("requesting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: { deviceId: { exact: deviceId } },
        });
        if (runRef.current !== run) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        attach(stream);
      } catch {
        if (runRef.current !== run) return;
        setCameraState("unavailable");
        setMediaError(
          "That microphone could not be opened. Another application may be holding it — pick a different input.",
        );
      }
    },
    [releaseStream, attach],
  );

  const startPrep = useCallback(() => {
    if (!topic) return;
    setMediaError(null);
    setNoSound(false);
    setSaveFailed(false);
    setRestored(false);
    setUrl(null);
    void clearTake();
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
    // Prefer the input the user picked last time. `ideal` rather than `exact`
    // so a device that has since been unplugged degrades to the default
    // instead of failing the whole request.
    const remembered = loadMicId();
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: remembered ? { deviceId: { ideal: remembered } } : true,
      })
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
        attach(stream);
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
  }, [topic, setUrl, track, attach]);

  const draw = useCallback(() => {
    track("draw", "click");
    runRef.current++;
    releaseStream();
    void clearTake();
    setUrl(null);
    setRestored(false);
    const next = drawTopic(topic?.id);
    setTopic(next);
    setCameraState("idle");
    setNoSound(false);
    setPhase("idle");
    setRemaining(PREP_SECONDS);
    setCopied(false);
  }, [topic, track, releaseStream, setUrl]);

  const chooseTopic = useCallback(
    (t: ImpromptuTopic) => {
      track("topic-pick", "click");
      // Same teardown as draw(): the user may be mid-prep with the camera open.
      runRef.current++;
      releaseStream();
      void clearTake();
      setUrl(null);
      setRestored(false);
      setTopic(t);
      setCameraState("idle");
      setMediaError(null);
      setNoSound(false);
      setPhase("idle");
      setRemaining(PREP_SECONDS);
      setCopied(false);
      document
        .getElementById("practice")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [track, releaseStream, setUrl],
  );

  const reset = useCallback(() => {
    runRef.current++;
    releaseStream();
    setUrl(null);
    setPhase("idle");
    setRemaining(PREP_SECONDS);
    setMediaError(null);
    setNoSound(false);
    setCameraState("idle");
  }, [releaseStream, setUrl]);

  const deleteTake = useCallback(() => {
    void clearTake();
    setUrl(null);
    setRestored(false);
    setSaveFailed(false);
    setNoSound(false);
    setPhase("idle");
    setRemaining(PREP_SECONDS);
  }, [setUrl]);

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

        {/* Mic level. Shown during prep as well as recording, deliberately: the
            point is to catch a dead input in the 30 seconds BEFORE the take,
            not to explain a silent file afterwards. */}
        {cameraState === "ready" && (phase === "prepping" || phase === "recording") && (
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 shrink-0">
                Mic
              </span>
              <div ref={meterRef} data-level="0" className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              </div>
            </div>
            {!hasAudioTrack && (
              <p className="mt-2 text-xs text-red-600">
                No microphone track — this take will have no sound.
              </p>
            )}
            {hasAudioTrack && (
              <>
                <p className="mt-1 text-xs text-gray-500">
                  Say something — the dots should light up. If they stay grey, pick a
                  different input below. Conferencing apps install virtual
                  devices (Teams, Zoom, BlackHole) that often take the default
                  slot and carry no microphone audio.
                </p>
                {audioDevices.length > 0 && (
                  <label className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="shrink-0">Input</span>
                    <select
                      value={selectedMicId ?? ""}
                      disabled={phase === "recording"}
                      onChange={(e) => void switchMic(e.target.value)}
                      className="max-w-full flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      {audioDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || "Microphone"}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {audioInfo?.muted && (
                  <p className="mt-1 text-xs text-red-600">
                    The browser reports no audio coming from this device.
                  </p>
                )}
                {phase === "recording" && audioDevices.length > 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    The input cannot be changed mid-recording.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {restored && phase === "review" && (
          <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            This is your last take, restored from this browser.
          </p>
        )}

        {saveFailed && phase === "review" && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This take could not be saved in your browser — most likely it is
            larger than the space available. It will be gone when you leave the
            page, so download it now if you want it.
          </p>
        )}

        {/* playback */}
        {phase === "review" && recordingUrl && (
          <video
            src={recordingUrl}
            controls
            playsInline
            className="mt-5 w-full rounded-xl bg-black aspect-video"
          />
        )}

        {phase === "review" && recordingUrl && noSound && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            <strong>This take looks silent.</strong> The video recorded, but no
            audio was detected from{" "}
            <span className="font-medium">{audioInfo?.label ?? "your microphone"}</span>{" "}
            while you were speaking. Play it back to check — if you can hear
            yourself, ignore this. If not, record again and choose a different
            <span className="font-medium"> Input </span> under the mic meter:
            virtual devices installed by Teams or Zoom often hold the default
            slot and pass no microphone audio.
          </p>
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
              <button
                type="button"
                onClick={deleteTake}
                className="text-sm text-gray-500 underline underline-offset-4 hover:text-red-600"
              >
                Delete this recording
              </button>
            </>
          )}
        </div>

        {/* Nothing leaves the browser, and saying so plainly is the honest
            answer to the question a camera prompt provokes. Since the take is
            now kept across reloads, that has to be stated too — writing webcam
            video to someone's disk is not something to do quietly. */}
        <p className="mt-4 text-xs text-gray-500">
          Recording happens entirely in your browser and is never uploaded to
          us. Your most recent take is kept in this browser so it survives a
          reload — it stays on this device, is discarded after seven days, and
          you can delete it yourself from the buttons above. Download a take if
          you want to keep it properly.
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
