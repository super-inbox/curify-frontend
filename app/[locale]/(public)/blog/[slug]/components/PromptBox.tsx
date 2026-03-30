"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface PromptBoxProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  promptText?: string; // Optional raw text for copying
}

export default function PromptBox({
  title,
  children,
  className = "",
  promptText,
}: PromptBoxProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Handle escape key + body scroll lock
  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  const extractTextFromChildren = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
      return String(node);
    }
    if (Array.isArray(node)) {
      return node.map(extractTextFromChildren).join("");
    }
    if (
      node &&
      typeof node === "object" &&
      "props" in node &&
      typeof node.props === "object" &&
      node.props !== null &&
      "children" in node.props
    ) {
      return extractTextFromChildren(node.props.children as React.ReactNode);
    }
    return "";
  };

  const handleCopyContent = async () => {
    const textToCopy = promptText ?? extractTextFromChildren(children);

    if (!textToCopy) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // swallow; you could add toast here
    }
  };

  // Fullscreen modal view
  if (expanded) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/55 backdrop-blur-md cursor-pointer"
          onClick={() => setExpanded(false)}
        />

        {/* Modal */}
        <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl border border-white/10 bg-white">
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between bg-white/90 backdrop-blur-xl px-5 sm:px-6 py-3.5 border-b border-neutral-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 truncate">
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  copied
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                onClick={handleCopyContent}
                title={copied ? "Copied!" : "Copy to clipboard"}
                type="button"
              >
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>

              <button
                onClick={() => setExpanded(false)}
                className="group rounded-lg p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer"
                type="button"
                aria-label="Close modal"
              >
                <svg
                  className="h-5 w-5 group-hover:rotate-90 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.25}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 bg-white">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-auto max-h-[70vh]">
              <div className="text-sm font-mono leading-relaxed text-gray-700 whitespace-pre-wrap">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  // Inline view
  return (
    <>
      <style jsx>{`
        .prompt-box {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #cbd5e0;
          border-radius: 12px;
          margin: 20px 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: visible;
          width: 100%;
        }

        .prompt-box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          color: white;
        }

        .prompt-box-title {
          margin: 0;
          font-size: 1.1em;
          font-weight: 600;
          flex: 1;
        }

        .prompt-box-buttons {
          display: flex;
          gap: 8px;
        }

        .prompt-box-copy-btn,
        .prompt-box-expand-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s ease;
        }

        .prompt-box-copy-btn:hover,
        .prompt-box-expand-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .prompt-box-copy-btn.copied {
          background: rgba(34, 197, 94, 0.3);
          border-color: rgba(34, 197, 94, 0.5);
        }

        .prompt-box-content {
          padding: 20px;
          background: white;
        }

        .prompt-box-content > div {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          font-family: "Courier New", monospace;
          font-size: 0.9em;
          color: #495057;
          overflow-x: auto;
          overflow-y: auto;
          white-space: pre-wrap;
          line-height: 1.5;
          max-height: 500px;
          min-height: 200px;
        }

        .prompt-box-content strong {
          color: #2d3748;
          font-weight: 600;
        }

        .prompt-box-content ul {
          margin: 12px 0;
          padding-left: 20px;
        }

        .prompt-box-content li {
          margin: 4px 0;
          color: #4a5568;
        }
      `}</style>

      <div className={`prompt-box ${className}`}>
        <div className="prompt-box-header">
          <h4 className="prompt-box-title">{title}</h4>
          <div className="prompt-box-buttons">
            <button
              className={`prompt-box-copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopyContent}
              title={copied ? "Copied!" : "Copy to clipboard"}
              type="button"
            >
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
            <button
              className="prompt-box-expand-btn"
              onClick={() => setExpanded(true)}
              title="Expand to fullscreen"
              type="button"
            >
              ⤢ Expand
            </button>
          </div>
        </div>
        <div className="prompt-box-content">
          <div>{children}</div>
        </div>
      </div>
    </>
  );
}
