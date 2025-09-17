"use client";

import { useAtom } from "jotai";
import { headerAtom, modalAtom, modalModeAtom } from "@/app/atoms/atoms";
import Modal from "../_components/Modal";
import Upload from "../_components/Upload";
import { useEffect, useRef, useState } from "react";
import Options from "../_components/Options";
import Icon from "../_components/Icon";
import BtnP from "../_components/button/ButtonPrimary";
import { useRouter } from "@/i18n/navigation";
import { projectService } from "@/services/projects";
import { getLangCode, languages } from "@/lib/language_utils";

interface CreateNewModalProps {}

export default function CreateNewModal({}: CreateNewModalProps) {
  const router = useRouter();
  const [modalState, setModalState] = useAtom(modalAtom);
  const [, setHeaderState] = useAtom(headerAtom);
  const [mode] = useAtom(modalModeAtom);

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

  const [voiceover, setVoiceover] = useState<"Yes" | "No">(mode === 'subtitles' ? "No" : "Yes");
  const [subtitle, setSubtitle] = useState<"None" | "Source" | "Target" | "Bilingual">(
    mode === 'subtitles' ? "Target" : "None"
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const getDuration = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const seconds = e.currentTarget.duration;
    const minutes = Math.floor(seconds / 60);
    setCost(Math.ceil((seconds / 60) * 10));
    const secs = Math.floor(seconds % 60);
    setDuration(`${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
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
    if (!uploadedFile || !videoId || transto === "Select Language") return;

    try {
      const newProject = await projectService.createProject({
        video_id: videoId, // ✅ use video_id from upload
        job_settings: {
          source_language: source === "Auto Detect" ? "auto" : getLangCode(source),
          target_language: getLangCode(transto),
          subtitles_enabled: subtitle.toLowerCase(),
          audio_option: mode === 'subtitles' ? "original" : (voiceover === "Yes" ? "dubbed" : "original"),
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

  return (
    <>
      {/* Step 1: Upload */}
      <Modal title={mode === 'subtitles' ? "Add Subtitles" : "Generate Translated Video"} open={modalState === "add"}>
        {!localPreviewUrl ? (
          <Upload
            onPreviewReady={(localUrl, file) => {
              setLocalPreviewUrl(localUrl);
              setUploadedFile(file);
              setIsUploading(true);
            }}
            onUploaded={(id, blobUrl, thumbnailUrl) => {
              setVideoId(id);
              setVideoBlobUrl(blobUrl);
              setIsUploading(false);
              // Auto-advance to settings once upload completes
              setModalState("setting");
            }}
          />
        ) : (
          <div className="flex flex-col items-center">
            {/* Show local preview immediately while uploading */}
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
            
            {/* Upload status */}
            <div className="text-center">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--p-blue)]"></div>
                  <p className="text-[var(--c2)] text-sm">Uploading video...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Icon name="check" className="text-green-500" size={8} />
                  <p className="text-green-600 text-sm font-medium">Upload complete!</p>
                  <p className="text-[var(--c4)] text-xs">Proceeding to settings...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Step 2: Settings */}
      <Modal title={mode === 'subtitles' ? "Add Subtitles" : "Generate Translated Video"} open={modalState === "setting"}>
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
            <div className="flex gap-3 w-full">
              {/* Source Selector */}
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

              {/* Target Selector */}
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

            {/* Options - Different based on mode */}
            {mode === 'translation' ? (
              <>
                <Options label="Voiceover" options={["Yes", "No"]} value={voiceover} onChange={setVoiceover} />
                <Options label="Subtitles" options={["None", "Source", "Target", "Bilingual"]} value={subtitle} onChange={setSubtitle} />
              </>
            ) : (
              <>
                {/* Subtitle-only mode - no voiceover option, different subtitle options */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Source", "Target", "Bilingual"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setSubtitle(option as "Source" | "Target" | "Bilingual")}
                        className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                          subtitle === option
                            ? "bg-[var(--p-blue)] text-white border-[var(--p-blue)]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {option === "Source" && "Original Language"}
                        {option === "Target" && "Translated Language"}
                        {option === "Bilingual" && "Both Languages"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cost */}
          <p className="flex items-center mt-6.5 mb-2">
            Credits Required:
            <span className="text-[var(--p-blue)] ml-1">{cost}</span>
            <button className="p-2.5 mr-[-0.625rem]">
              <Icon name="info" />
            </button>
          </p>

          <BtnP onClick={handleStart}>
            {mode === 'subtitles' ? 'Add Subtitles' : 'Start Translation'}
          </BtnP>
        </div>
      </Modal>
    </>
  );
}