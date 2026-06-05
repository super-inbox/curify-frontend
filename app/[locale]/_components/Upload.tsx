"use client";

import { useRef, useState } from "react";
import Icon from "./Icon";
import { videoService } from "@/services/video";

// Per-kind whitelists used by the file-picker accept= filter, drag/drop
// MIME validation, the visible filetype hint, and the error message. The
// kind comes from the parent (driven by lib/create-job-ui.ts:acceptedKinds),
// defaults to "video" so existing call sites keep their current behavior.
type UploadKind = "video" | "audio";

const KIND_SPEC: Record<
  UploadKind,
  { mimeTypes: string[]; extList: string; extLabel: string }
> = {
  video: {
    mimeTypes: [
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-msvideo",
      "video/x-ms-wmv",
    ],
    extList: ".mp4,.mov,.webm,.avi,.wmv",
    extLabel: ".mp4/.mov/.webm/.avi/.wmv",
  },
  audio: {
    mimeTypes: [
      "audio/mpeg",        // .mp3
      "audio/wav",
      "audio/x-wav",
      "audio/mp4",         // .m4a (sometimes reported as audio/mp4)
      "audio/x-m4a",
      "audio/m4a",
      "audio/aac",
      "audio/ogg",
      "audio/flac",
      "audio/webm",
    ],
    extList: ".mp3,.wav,.m4a,.aac,.flac,.ogg,.webm",
    extLabel: ".mp3/.wav/.m4a/.aac/.flac/.ogg",
  },
};

interface Props {
  onUploaded: (
    videoId: string,
    blobUrl: string,
    thumbnailUrl?: string
  ) => void;
  onPreviewReady?: (localPreviewUrl: string, file: File) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  /** What kind of file this Upload accepts. Defaults to "video". */
  acceptedKinds?: UploadKind;
}

export default function Upload({
  onUploaded,
  onPreviewReady,
  onUploadStart,
  onUploadError,
  acceptedKinds = "video",
}: Props) {
  const { mimeTypes: ACCEPTED_TYPES, extList: ACCEPT_ATTR, extLabel: TYPE_LABEL } =
    KIND_SPEC[acceptedKinds];
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      const errorMsg = `Only ${TYPE_LABEL.split("/").join(", ")} files are supported`;
      alert(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    onPreviewReady?.(localUrl, file);

    // Notify parent that upload is starting
    onUploadStart?.();

    // Upload in the background
    try {
      const res = await videoService.uploadVideo(file);
      onUploaded(res.video_id, res.blob_url, res.thumbnail_signed_url);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      const errorMsg = "Upload failed, please try again.";
      alert(errorMsg);
      onUploadError?.(errorMsg);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files);
      }}
      className={`
        w-100 h-60 flex flex-col items-center justify-center
        cursor-pointer rounded-xl p-6 text-center transition 
        ${
          isDragging
            ? "bg-[var(--p-blue)]/6 opacity-80 shadow-[inset_0_0_0_0_var(--c4)]"
            : "bg-white opacity-100 shadow-[inset_0_0_0_1px_var(--c4)]"
        }
      `}
    >
      <Icon name="add" size={8} />
      <p className="text-[var(--c2)] text-base font-bold mt-4.5 mb-1.5">
        Drag & Drop or Click to Upload
      </p>
      <div className="flex items-center mb-[-0.625rem]">
        <p>{TYPE_LABEL}</p>
        <button className="p-2.5 mr-[-0.625rem]">
          <Icon name="info" />
        </button>
      </div>
      <p className="text-[var(--c4)] underline">Supported Languages</p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        hidden
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  );
}