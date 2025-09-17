"use client";

import { useRef, useState } from "react";
import Icon from "./Icon";
import { videoService } from "@/services/video";

const ACCEPTED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-ms-wmv",
];

interface Props {
  onUploaded: (
    videoId: string,
    blobUrl: string,
    thumbnailUrl?: string
  ) => void;
  onPreviewReady?: (localPreviewUrl: string, file: File) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
}

export default function Upload({ 
  onUploaded, 
  onPreviewReady, 
  onUploadStart, 
  onUploadError 
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      const errorMsg = "Only .mp4, .mov, .webm, .avi, .wmv files are supported";
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
        <p>.mp4/.mov/.webm/.avi/.wmv</p>
        <button className="p-2.5 mr-[-0.625rem]">
          <Icon name="info" />
        </button>
      </div>
      <p className="text-[var(--c4)] underline">Supported Languages</p>

      <input
        ref={inputRef}
        type="file"
        accept=".mp4,.mov,.webm,.avi,.wmv"
        hidden
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  );
}