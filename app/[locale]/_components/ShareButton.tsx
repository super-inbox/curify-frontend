"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Share2, Link2, Check } from "lucide-react";

type ShareButtonProps = {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  onShared?: () => void;
};

function isMobileLikeDevice() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || coarsePointer;
}

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const WeiboIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zm6.748-9.754a1.08 1.08 0 01-.791-.144c-.362-.094-.448-.371-.216-.576.232-.205.538-.397.873-.516.335-.118.671-.143 1.006-.143.335 0 .694.031 1.021.094.327.063.664.183.933.348.27.165.427.376.427.578 0 .201-.157.38-.427.493-.27.112-.606.158-.933.147-.327-.01-.664-.048-1.021-.117a3.779 3.779 0 01-.872-.164zm-1.047-2.828c-.179.096-.389.14-.589.12-.2-.02-.379-.1-.488-.223a.7.7 0 01-.159-.445c.01-.164.068-.33.177-.472.109-.142.261-.254.437-.308.175-.054.358-.05.527.014.169.064.31.181.397.328.087.147.107.318.058.48-.049.161-.157.3-.36.504zm2.85-1.43c.269.12.47.322.55.562.08.24.037.497-.117.714a1.48 1.48 0 01-.629.509c-.259.107-.544.143-.815.097-.27-.046-.509-.169-.66-.345a.858.858 0 01-.164-.619c.047-.23.177-.44.374-.593a1.576 1.576 0 01.65-.294c.27-.054.542-.029.811.087zm-1.36-3.23C14.409.506 10.433-.28 7.124 1.56 3.814 3.402 2.529 7.027 3.907 9.999c.276.59.636 1.124 1.065 1.593-.503.44-.926.97-1.235 1.566-.586 1.129-.586 2.359 0 3.488.586 1.13 1.666 2.044 3.088 2.64 1.422.596 3.06.838 4.719.68 1.659-.158 3.201-.709 4.435-1.558 1.234-.849 2.076-1.98 2.383-3.216.307-1.236.054-2.542-.716-3.679a6.1 6.1 0 00-.657-.796c.296-.31.55-.661.748-1.044.566-1.116.566-2.329 0-3.44-.273-.537-.682-1.006-1.196-1.376z" />
  </svg>
);

const BUTTON_GAP = 50;

type Platform = {
  id: string;
  label: string;
  bg: string;
  Icon: () => React.ReactElement;
  getUrl: (url: string, title?: string, text?: string) => string;
};

const PLATFORMS: Platform[] = [
  {
    id: "facebook",
    label: "Facebook",
    bg: "#1877F2",
    Icon: FacebookIcon,
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    label: "X / Twitter",
    bg: "#000000",
    Icon: XIcon,
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}${title ? `&text=${encodeURIComponent(title)}` : ""}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    bg: "#0077B5",
    Icon: LinkedInIcon,
    getUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    bg: "#25D366",
    Icon: WhatsAppIcon,
    getUrl: (url, title, text) => {
      const parts = [title, url, text].filter(Boolean).join("\r\n");
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(parts)}`;
    },
  },
  {
    id: "weibo",
    label: "Weibo",
    bg: "#E6162D",
    Icon: WeiboIcon,
    getUrl: (url, title) =>
      `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}${title ? `&title=${encodeURIComponent(title)}` : ""}`,
  },
];

export default function ShareButton({
  url,
  title,
  text,
  className = "",
  onShared,
}: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "shared" | "copied">("idle");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const prefersNativeShare = useMemo(() => {
    if (typeof window === "undefined") return false;
    return isMobileLikeDevice() && typeof navigator.share === "function";
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const resetStatusLater = () => {
    window.setTimeout(() => setStatus("idle"), 2500);
  };

  const fullUrl = url.startsWith("http") ? url : `https://www.curify-ai.com${url}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
    onShared?.();
    setStatus("copied");
    resetStatusLater();
  };

  const handleMainClick = async () => {
    if (prefersNativeShare) {
      try {
        await navigator.share({ title, text, url: fullUrl });
        onShared?.();
        setStatus("shared");
        resetStatusLater();
      } catch {
        try { await copyLink(); } catch { /* ignore */ }
      }
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const handleSocialClick = (platform: Platform) => {
    window.open(platform.getUrl(fullUrl, title, text), "_blank", "noopener,noreferrer");
    onShared?.();
    setIsOpen(false);
  };

  const handleCopyClick = async () => {
    await copyLink();
    setIsOpen(false);
  };

  const label =
    status === "shared" ? "Shared" : status === "copied" ? "Copied!" : "Share";

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {}
      <button
        type="button"
        onClick={handleMainClick}
        style={{ position: "relative", zIndex: 20 }}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 ${
          isOpen ? "border-neutral-400 bg-neutral-50" : ""
        }`}
        aria-label="Share"
        aria-expanded={isOpen}
      >
        <Share2
          className="h-4 w-4 transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(20deg)" : "rotate(0deg)" }}
        />
        {label}
      </button>

      {/* Social platform buttons — burst out to the right */}
      {PLATFORMS.map((platform, index) => {
        const offset = (index + 1) * BUTTON_GAP;
        const delay = index * 50;
        const closeDelay = (PLATFORMS.length - index) * 35;
        return (
          <button
            key={platform.id}
            type="button"
            aria-label={`Share on ${platform.label}`}
            onClick={() => handleSocialClick(platform)}
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              backgroundColor: platform.bg,
              transform: isOpen
                ? `translateY(-50%) translateX(${offset}px) scale(1)`
                : `translateY(-50%) translateX(0px) scale(0.5)`,
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none",
              transition: isOpen
                ? `transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, opacity 200ms ease ${delay}ms`
                : `transform 200ms ease ${closeDelay}ms, opacity 150ms ease ${closeDelay}ms`,
              zIndex: 10 - index,
            }}
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full text-white shadow-md hover:brightness-110 active:scale-95"
          >
            <platform.Icon />
          </button>
        );
      })}

      {/* Copy link button */}
      {(() => {
        const index = PLATFORMS.length;
        const offset = (index + 1) * BUTTON_GAP;
        const delay = index * 50;
        const closeDelay = 0;
        return (
          <button
            key="copy"
            type="button"
            aria-label="Copy link"
            onClick={handleCopyClick}
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: isOpen
                ? `translateY(-50%) translateX(${offset}px) scale(1)`
                : `translateY(-50%) translateX(0px) scale(0.5)`,
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none",
              transition: isOpen
                ? `transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, opacity 200ms ease ${delay}ms`
                : `transform 200ms ease ${closeDelay}ms, opacity 150ms ease ${closeDelay}ms`,
              zIndex: 10 - index,
            }}
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full bg-neutral-700 text-white shadow-md hover:brightness-110 active:scale-95"
          >
            {status === "copied" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
          </button>
        );
      })()}
    </div>
  );
}
