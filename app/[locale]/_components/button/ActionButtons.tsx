import { Star, Copy, Share2 } from "lucide-react";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

type ActionButtonsProps = {
  saved: boolean;
  copied: boolean;
  shared: boolean;
  saveCount: number;
  copyCount: number;
  shareCount: number;
  onSave: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
};

export function ActionButtons({
  saved,
  copied,
  shared,
  saveCount,
  copyCount,
  shareCount,
  onSave,
  onCopy,
  onShare,
}: ActionButtonsProps) {
  const baseBtn =
    "inline-flex items-center gap-2 px-1.5 py-1 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer";
  const baseIcon = "h-6 w-6"; // more prominent
  const baseCount = "tabular-nums";

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      {/* Save */}
      <button
        type="button"
        onClick={onSave}
        className={classNames(baseBtn, saved && "text-amber-700")}
        aria-label="Save"
      >
        <Star
          className={classNames(baseIcon, "stroke-[1.4]")}
          fill={saved ? "currentColor" : "none"}
        />
        <span className={baseCount}>{saveCount}</span>
      </button>

      {/* Copy */}
      <button
        type="button"
        onClick={onCopy}
        className={classNames(baseBtn, copied && "text-emerald-700")}
        aria-label="Copy"
      >
        <Copy className={classNames(baseIcon, "stroke-[1.4]")} />
        <span className={baseCount}>{copyCount}</span>
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={onShare}
        className={classNames(baseBtn, shared && "text-blue-700")}
        aria-label="Share"
      >
        <Share2 className={classNames(baseIcon, "stroke-[1.4]")} />
        <span className={baseCount}>{shareCount}</span>
      </button>
    </div>
  );
}
