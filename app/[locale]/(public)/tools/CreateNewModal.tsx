// CreateNewModal.tsx
"use client";

import { useAtom } from "jotai";
import { modalAtom, userAtom, drawerAtom, createJobContextAtom } from "@/app/atoms/atoms";
import Modal from "../../_components/Modal";
import Upload from "../../_components/Upload";
import { useEffect, useRef, useState } from "react";
import Options from "../../_components/Options";
import BtnP from "../../_components/button/ButtonPrimary";
import { useRouter } from "@/i18n/navigation";
import { projectService } from "@/services/projects";
import { videoService } from "@/services/video";
import { authService } from "@/services/auth";
import { getLangCode, languages } from "@/lib/language_utils";
import type { SubtitleFormat, AudioOption } from "@/types/projects";
import type { BackendJobType } from "@/types/projects";
import { getJobUiConfig } from "@/lib/create-job-ui";
import toast from "react-hot-toast";

export default function CreateNewModal() {
  const router = useRouter();
  const [modalState, setModalState] = useAtom(modalAtom);
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);

  const [jobCtx] = useAtom(createJobContextAtom);
  const job_type: BackendJobType = (jobCtx?.job_type as BackendJobType) ?? "subtitle_only";
  const ui = getJobUiConfig(job_type);

  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string>("");
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState("");
  const [cost, setCost] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const isStartingRef = useRef(false);

  const [source, setSource] = useState("Auto Detect");
  const [transto, setTransto] = useState("Select Language");
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isTargetOpen, setIsTargetOpen] = useState(false);
  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const [voiceover, setVoiceover] = useState<"Yes" | "No">(ui.allowVoiceover ? "Yes" : "No");
  const [subtitle, setSubtitle] = useState<"None" | "Source" | "Target" | "Bilingual">(
    ui.subtitleOptions.includes("Target") ? "Target" : "None"
  );
  const [requireTranslation, setRequireTranslation] = useState<"Yes" | "No">("No");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showMissingTargetWarning, setShowMissingTargetWarning] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [isYoutubeUpload, setIsYoutubeUpload] = useState<boolean>(false);
  // Metadata from the lightweight probe (duration/title/thumb) shown as an
  // upfront cost-confirmation card before the full download runs.
  const [youtubeMeta, setYoutubeMeta] = useState<{ duration_seconds: number; title?: string; thumbnail?: string } | null>(null);
  const [probingYoutube, setProbingYoutube] = useState(false);

  const remainingCredits =
    ((user as any)?.non_expiring_credits ?? 0) + ((user as any)?.expiring_credits ?? 0);

  // Compute + display the credit cost from a duration in seconds. Shared by
  // the uploaded-file preview (<video onLoadedMetadata>) and the YouTube
  // metadata probe so both show the same upfront "Credits Required" prompt.
  const applyDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    const minutes = seconds / 60;
    const billableMinutes = Math.max(minutes, 1);
    setCost(Math.ceil(billableMinutes * ui.ratePerMinute));

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    setDuration(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
  };

  const getDuration = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    applyDuration(e.currentTarget.duration);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target as Node)) setIsSourceOpen(false);
      if (targetRef.current && !targetRef.current.contains(e.target as Node)) setIsTargetOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    setShowMissingTargetWarning(false);
    setTransto("Select Language");
    setSource("Auto Detect");

    setVoiceover(ui.allowVoiceover ? "Yes" : "No");

    if (!ui.allowSubtitles) {
      setSubtitle("None");
    } else {
      setSubtitle(ui.subtitleOptions.includes("Target") ? "Target" : ui.subtitleOptions[0] ?? "None");
    }

    setRequireTranslation("No");

    // Clear any YouTube URL / cost preview carried over from another tool.
    setYoutubeUrl("");
    setYoutubeMeta(null);
    setProbingYoutube(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job_type]);

  const requiresTargetLang = () => {
    if (!ui.showTargetLang) return false;
    if (job_type === "subtitle_only") return requireTranslation === "Yes";
    return true;
  };

  // Step 1 for a YouTube URL: probe metadata (no download) so we can show the
  // cost + gate on credits BEFORE spending time downloading the whole video.
  const handleYoutubeProbe = async () => {
    const url = youtubeUrl.trim();
    if (!url || probingYoutube || isUploading) return;
    setProbingYoutube(true);
    try {
      const meta = await videoService.getYoutubeMetadata(url);
      if (!meta || !meta.duration_seconds) throw new Error("no duration");
      setYoutubeMeta(meta);
      applyDuration(meta.duration_seconds);
    } catch (error) {
      console.error("YouTube metadata probe failed:", error);
      setYoutubeMeta(null);
      alert("Couldn't read this YouTube video. It may be private, age-restricted, live, or unavailable. Please check the URL.");
    } finally {
      setProbingYoutube(false);
    }
  };

  // Step 2 (after the user confirms the cost): actually download + process the
  // video, then advance to the settings screen — same as before.
  const handleYoutubeDownload = async () => {
    const url = youtubeUrl.trim();
    if (!url || isUploading) return;
    setIsUploading(true);
    setIsYoutubeUpload(true);
    try {
      const result = await videoService.uploadYoutubeVideo(url);
      if (!result || !result.video_id) throw new Error("Invalid response from server");
      setVideoId(result.video_id);
      setVideoBlobUrl(result.blob_url);
      setLocalPreviewUrl(result.blob_url);
      setUploadedFile(new File([], `youtube_${result.video_id}.mp4`));
      setIsUploading(false);
      setModalState("setting");
    } catch (error) {
      console.error("YouTube upload failed:", error);
      alert("Failed to download YouTube video. Please check the URL and try again.");
      setIsUploading(false);
      setIsYoutubeUpload(false);
    }
  };

  const handleStart = async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    if (job_type === "youtube_subtitles") {
      if (!videoId) return;
    } else {
      if (!uploadedFile || !videoId) return;
    }

    if (requiresTargetLang() && transto === "Select Language") {
      setShowMissingTargetWarning(true);
      return;
    }

    if (cost > remainingCredits) {
      alert(`Not enough credits. Required: ${cost}, Available: ${remainingCredits}`);
      return;
    }

    try {
      setIsStarting(true);
      isStartingRef.current = true;

      const isRemoveSubtitle = subtitle === "Source" && job_type === "subtitle_only";

      let subtitles_enabled: string = "none";
      if (!ui.allowSubtitles) {
        subtitles_enabled = "none";
      } else if (job_type === "full_translation") {
        subtitles_enabled = subtitle.toLowerCase();
      } else if (job_type === "subtitle_only") {
        subtitles_enabled = requireTranslation === "Yes" ? subtitle.toLowerCase() : "source";
      } else {
        subtitles_enabled = subtitle.toLowerCase();
      }

      const target_language = requiresTargetLang()
      ? getLangCode(transto)
      : undefined;

      const payload = {
        video_id: videoId,
        job_settings: {
          job_type,
          source_language: ui.showSourceLang
            ? source === "Auto Detect"
              ? "auto"
              : getLangCode(source)
            : "auto",
          target_language,
          subtitles_enabled: subtitles_enabled as SubtitleFormat,
          audio_option: (ui.forceAudioOption ?? (ui.allowVoiceover
            ? voiceover === "Yes"
              ? "dubbed"
              : "original"
            : "original")) as AudioOption,
          erase_original_subtitles: isRemoveSubtitle,
          allow_lip_syncing: false,
        },
        project_name:
          uploadedFile?.name ??
          (job_type === "youtube_subtitles" ? `youtube_${videoId}.mp4` : "job"),
      };
      
      // print payload
      console.log("createProject payload:", payload);
      console.log("createProject payload JSON:", JSON.stringify(payload, null, 2));
      
      const newProject = await projectService.createProject(payload);

      // Thin auth probe before navigating to /magic/<id>. The page is
      // server-gated by the middleware (middleware.ts:45-65) reading
      // NextAuth session cookies, while createProject above used the
      // localStorage Bearer token — the two auth surfaces can expire
      // independently. When only the cookie is stale the API call
      // succeeds (backend queues the job ✓) but the next navigation
      // silently 302s the user back to the locale home. Hit getProfile
      // first; if 401, services/api.ts:86-94 clears localStorage and
      // dispatches `auth:expired`, and we surface the failure here so
      // the user gets an explicit "session expired" toast instead of
      // an unexplained bounce to home.
      try {
        await authService.getProfile();
      } catch {
        setModalState(null);
        toast.error(
          "Your job was submitted, but your session has expired. Please sign in again to track progress."
        );
        setDrawerState("signin");
        setIsStarting(false);
        isStartingRef.current = false;
        return;
      }

      setModalState(null);
      router.replace(`/magic/${newProject.project_id}`);
    } catch (error) {
      alert("Failed to create project.");
      console.error(error);
      setIsStarting(false);
      isStartingRef.current = false;
    }
  };

  const title = ui.title;

  return (
    <>
      <Modal title={title} open={modalState === "add"}>
        {!localPreviewUrl ? (
          <div className="flex flex-col items-center w-full">
            {ui.allowUpload ? (
              <Upload
                acceptedKinds={ui.acceptedKinds}
                onPreviewReady={(localUrl, file) => {
                  setLocalPreviewUrl(localUrl);
                  setUploadedFile(file);
                  setIsUploading(true);
                  setIsYoutubeUpload(false);
                }}
                onUploaded={(id, blobUrl) => {
                  setVideoId(id);
                  setVideoBlobUrl(blobUrl);
                  setIsUploading(false);
                  setModalState("setting");
                }}
              />
            ) : null}

            {ui.allowUpload && ui.allowYoutube ? (
              <div className="flex items-center gap-3 w-full max-w-md my-6">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-gray-500 text-sm font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>
            ) : null}

            {ui.allowYoutube ? (
              <div className="w-full max-w-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/shorts/t84v79KXbFY"
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      // Any URL edit invalidates the previous cost preview.
                      if (youtubeMeta) setYoutubeMeta(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleYoutubeProbe();
                      }
                    }}
                    disabled={isUploading || probingYoutube}
                    className="flex-1 px-4 py-3 border-2 border-blue-400 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={handleYoutubeProbe}
                    disabled={!youtubeUrl.trim() || isUploading || probingYoutube}
                    className="shrink-0 px-4 py-3 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {probingYoutube ? "Checking…" : "Check"}
                  </button>
                </div>

                {/* Upfront cost confirmation — parity with the uploaded-file
                    flow. Gates the (expensive) download on available credits. */}
                {youtubeMeta ? (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex gap-3">
                      {youtubeMeta.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={youtubeMeta.thumbnail}
                          alt=""
                          className="h-16 w-28 shrink-0 rounded object-cover bg-gray-200"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {youtubeMeta.title || "YouTube video"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Duration: {duration}</p>
                      </div>
                    </div>

                    <p className="flex items-center mt-3 text-sm">
                      Credits Required:
                      <span className="text-[var(--p-blue)] ml-1 font-medium">{cost}</span>
                      <span className="ml-3 text-gray-500" suppressHydrationWarning>
                        (Available: {remainingCredits})
                      </span>
                    </p>
                    {cost > remainingCredits ? (
                      <p className="text-red-500 text-xs mt-1">
                        Not enough credits for this video.
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleYoutubeDownload}
                      disabled={isUploading || cost > remainingCredits}
                      className="mt-3 w-full px-4 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-80 h-48 bg-[var(--c1)]/20 rounded-2xl overflow-hidden relative mt-5 mb-6">
              <video
                src={localPreviewUrl}
                className="w-full h-full object-contain opacity-50"
                onLoadedMetadata={getDuration}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                <p className="text-white font-medium text-sm">
                  {isYoutubeUpload ? "Downloading from YouTube..." : "Uploading video..."}
                </p>
                <p className="text-white/70 text-xs mt-1">Please wait while we process your file</p>
              </div>
              <div className="absolute w-full h-9 bottom-0 z-1 flex items-center justify-end pr-3 bg-[linear-gradient(0deg,rgba(var(--c1-rgb),0.3),rgba(var(--c1-rgb),0))] text-white">
                {duration}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal title={title} open={modalState === "setting"}>
        <div className="flex flex-col items-center">
          <div className="w-80 h-48 bg-[var(--c1)]/20 rounded-2xl overflow-hidden relative mt-5 mb-6">
            {localPreviewUrl ? (
              <video
                src={localPreviewUrl}
                className="w-full h-full object-contain"
                onLoadedMetadata={getDuration}
                controls
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                Loading...
              </div>
            )}
            <div className="absolute w-full h-9 bottom-0 z-1 flex items-center justify-end pr-3 bg-[linear-gradient(0deg,rgba(var(--c1-rgb),0.3),rgba(var(--c1-rgb),0))] text-white">
              {duration}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4.5 w-full">
            {ui.allowRequireTranslationToggle ? (
              <Options
                label="Require Translation"
                options={["Yes", "No"]}
                value={requireTranslation}
                onChange={(value) => {
                  setRequireTranslation(value as "Yes" | "No");
                  if (value === "No") setShowMissingTargetWarning(false);
                }}
              />
            ) : null}

            {(ui.showSourceLang || ui.showTargetLang) ? (
              <>
                <div className="flex gap-3 w-full">
                  {ui.showSourceLang ? (
                    <div className="flex-1 relative" ref={sourceRef}>
                      <div
                        className="cursor-pointer w-full border border-gray-300 rounded-md px-4 py-2 bg-white hover:border-blue-400 text-sm text-gray-800"
                        onClick={() => setIsSourceOpen(!isSourceOpen)}
                      >
                        <label className="block text-xs text-gray-500 mb-1">Source Language</label>
                        <p>{source}</p>
                      </div>
                      {isSourceOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-md max-h-52 overflow-y-auto text-sm">
                          <div
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                              setSource("Auto Detect");
                              setIsSourceOpen(false);
                            }}
                          >
                            Auto Detect
                          </div>
                          {languages.map((lang) => (
                            <div
                              key={lang.code}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                              onClick={() => {
                                setSource(lang.name);
                                setIsSourceOpen(false);
                              }}
                            >
                              {lang.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {ui.showTargetLang && requiresTargetLang() ? (
                    <div className="flex-1 relative" ref={targetRef}>
                      <div
                        className="cursor-pointer w-full border border-gray-300 rounded-md px-4 py-2 bg-white hover:border-blue-400 text-sm text-gray-800"
                        onClick={() => setIsTargetOpen(!isTargetOpen)}
                      >
                        <label className="block text-xs text-gray-500 mb-1">Translate To</label>
                        <p>{transto}</p>
                      </div>
                      {isTargetOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-md max-h-52 overflow-y-auto text-sm">
                          {languages.map((lang) => (
                            <div
                              key={lang.code}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                              onClick={() => {
                                setTransto(lang.name);
                                setShowMissingTargetWarning(false);
                                setIsTargetOpen(false);
                              }}
                            >
                              {lang.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {showMissingTargetWarning ? (
                  <p className="text-red-500 text-sm mt-1 -mb-3">
                    Please select a target language before proceeding.
                  </p>
                ) : null}
              </>
            ) : null}

            {ui.allowVoiceover ? (
              <Options label="Voiceover" options={["Yes", "No"]} value={voiceover} onChange={setVoiceover} />
            ) : null}

            {ui.allowSubtitles ? (
              <Options
                label="Subtitles"
                options={ui.subtitleOptions}
                value={subtitle}
                onChange={(v) => setSubtitle(v as any)}
              />
            ) : null}
          </div>

          <p className="flex items-center mt-6.5 mb-2">
            Credits Required:
            <span className="text-[var(--p-blue)] ml-1">{cost}</span>
            <span className="ml-3 text-sm text-gray-500" suppressHydrationWarning>(Available: {remainingCredits})</span>
          </p>

          <BtnP onClick={handleStart} disabled={isStarting} className={isStarting ? "cursor-not-allowed opacity-70" : ""}>
            {isStarting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Starting...
              </span>
            ) : (
              ui.ctaLabel
            )}
          </BtnP>
        </div>
      </Modal>
    </>
  );
}
