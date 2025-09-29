"use client";

import { useAtom } from "jotai";
import { headerAtom, modalAtom, jobTypeAtom } from "@/app/atoms/atoms";
import Modal from "../_components/Modal";
import Upload from "../_components/Upload";
import { useEffect, useRef, useState } from "react";
import Options from "../_components/Options";
import Icon from "../_components/Icon";
import BtnP from "../_components/button/ButtonPrimary";
import { useRouter } from "@/i18n/navigation";
import { projectService } from "@/services/projects";
import { getLangCode, languages } from "@/lib/language_utils";
import { SubtitleFormat, JobSettings } from "@/types/projects";
import { userAtom } from "@/app/atoms/atoms";

export default function CreateNewModal() {
  const router = useRouter();
  const [modalState, setModalState] = useAtom(modalAtom);
  const [, setHeaderState] = useAtom(headerAtom);
  const [jobType] = useAtom(jobTypeAtom);
  const [user] = useAtom(userAtom);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string>("");
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState("");
  const [cost, setCost] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [source, setSource] = useState("Auto Detect");
  const [transto, setTransto] = useState("Select Language");
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isTargetOpen, setIsTargetOpen] = useState(false);
  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const [voiceover, setVoiceover] = useState<"Yes" | "No">(jobType === "subtitles" ? "No" : "Yes");
  const [subtitle, setSubtitle] = useState<"None" | "Source" | "Target" | "Bilingual">(
    jobType === "subtitles" ? "Target" : "None"
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showMissingTargetWarning, setShowMissingTargetWarning] = useState(false);

  const [remainingCredits, setRemainingCredits] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {        
        const remainingCredits =
        (user?.non_expiring_credits || 0) + (user?.expiring_credits || 0);
        setRemainingCredits(remainingCredits);
      } catch (e) {
        console.error("Failed to fetch credits", e);
      }
    };
    fetchBalance();
  }, []);

  const getDuration = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const seconds = e.currentTarget.duration;
    const minutes = seconds / 60;
    const rate = jobType === "translation" ? 5 : 1;
    const billableMinutes = Math.max(minutes, 1);
    setCost(Math.ceil(billableMinutes * rate));
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    setDuration(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target as Node)) {
        setIsSourceOpen(false);
      }
      if (targetRef.current && !targetRef.current.contains(e.target as Node)) {
        setIsTargetOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const handleStart = async () => {
    if (!uploadedFile || !videoId) return;

    if (jobType === "translation" && transto === "Select Language") {
      setShowMissingTargetWarning(true);
      return;
    }

    if (cost > remainingCredits) {
      alert(`Not enough credits. Required: ${cost}, Available: ${remainingCredits}`);
      return;
    }

    try {
      const isSubtitleOnly = jobType === "subtitles";
const isRemoveSubtitle = subtitle === "Source" && jobType === "subtitles";

const newProject = await projectService.createProject({
  video_id: videoId,
  job_settings: {
    source_language: source === "Auto Detect" ? "auto" : getLangCode(source),
    target_language: jobType === "translation" ? getLangCode(transto) : undefined, // must be null for subtitle-only
    subtitles_enabled: subtitle.toLowerCase() as SubtitleFormat,              // "source" for subtitle-only
    audio_option:
      jobType === "subtitles"
        ? "original"
        : voiceover === "Yes"
        ? "dubbed"
        : "original",
    erase_original_subtitles: isRemoveSubtitle,  // ✅ only true if subtitle = "Source" and jobType = "subtitles"
    allow_lip_syncing: false,                     // optional, false by default
  },
  project_name: uploadedFile.name,
});

      setModalState(null);
      router.replace(`/magic/${newProject.project_id}`);
    } catch (error) {
      alert("Failed to create project.");
      console.error(error);
    }
  };

  const title = jobType === "subtitles" ? "Add Subtitles" : "Generate Translated Video";

  return (
    <>
      {/* Upload Modal */}
      <Modal title={title} open={modalState === "add"}>
        {!localPreviewUrl ? (
          <Upload
            onPreviewReady={(localUrl, file) => {
              setLocalPreviewUrl(localUrl);
              setUploadedFile(file);
              setIsUploading(true);
            }}
            onUploaded={(id, blobUrl) => {
              setVideoId(id);
              setVideoBlobUrl(blobUrl);
              setIsUploading(false);
              setModalState("setting");
            }}
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-80 h-48 bg-[var(--c1)]/20 rounded-2xl overflow-hidden relative mt-5 mb-6">
              <video
                src={localPreviewUrl}
                className="w-full h-full object-contain"
                onLoadedMetadata={getDuration}
                controls
              />
              <div className="absolute w-full h-9 bottom-0 z-1 flex items-center justify-end pr-3 bg-[linear-gradient(0deg,rgba(var(--c1-rgb),0.3),rgba(var(--c1-rgb),0))] text-white">
                {duration}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Settings Modal */}
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
            {jobType === "translation" ? (
              <>
                {/* Language selectors */}
                <div className="flex gap-3 w-full">
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
                </div>

                {showMissingTargetWarning && (
                  <p className="text-red-500 text-sm mt-1 -mb-3">
                    Please select a target language before proceeding.
                  </p>
                )}

                <Options label="Voiceover" options={["Yes", "No"]} value={voiceover} onChange={setVoiceover} />
                <Options label="Subtitles" options={["None", "Source", "Target", "Bilingual"]} value={subtitle} onChange={setSubtitle} />
              </>
            ) : (
              // Subtitles job type: fixed radio, no language choices
              <Options
  label="Subtitle Action"
  options={["Add Subtitles", "Remove Subtitles"]}
  value={"Add Subtitles"}        // default selection
  onChange={() => {}}
  disabled={true}  // disable interaction
/>
            )}
          </div>

          <p className="flex items-center mt-6.5 mb-2">
            Credits Required:
            <span className="text-[var(--p-blue)] ml-1">{cost}</span>
            <span className="ml-3 text-sm text-gray-500">(Available: {remainingCredits})</span>
          </p>

          <BtnP onClick={handleStart}>
            {jobType === "subtitles" ? "Add Subtitles" : "Start Translation"}
          </BtnP>
        </div>
      </Modal>
    </>
  );
}
