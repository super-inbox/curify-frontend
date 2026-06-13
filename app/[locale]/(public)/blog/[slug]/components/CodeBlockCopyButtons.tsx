"use client";

import { useEffect } from "react";

// Client enhancer: adds a "Copy prompt" button to every <pre> code block in the
// blog article. Blog prompts render as <pre><code> from formatContent, which is
// injected as an HTML string (dangerouslySetInnerHTML), so a React component
// can't be embedded directly — this walks the rendered DOM after hydration and
// attaches a copy button to each block. Gives blog readers the copy-prompt
// escape hatch (the sajjadit.com pattern) so high-traffic WC poster posts stop
// bouncing visitors who just want the prompt. Idempotent + cleans up on unmount.
export default function CodeBlockCopyButtons() {
  useEffect(() => {
    const pres = Array.from(
      document.querySelectorAll<HTMLPreElement>("article pre")
    );
    const cleanups: Array<() => void> = [];

    for (const pre of pres) {
      if (pre.dataset.copyEnhanced) continue;
      pre.dataset.copyEnhanced = "1";
      if (!pre.style.position) pre.style.position = "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Copy prompt";
      btn.className =
        "absolute top-2 right-2 z-10 rounded-md bg-white/10 hover:bg-white/20 " +
        "text-gray-100 text-xs font-semibold px-2.5 py-1 border border-white/20 " +
        "backdrop-blur-sm transition-colors cursor-pointer";

      const onClick = async () => {
        const text = (
          pre.querySelector("code")?.textContent ??
          pre.textContent ??
          ""
        ).trim();
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Fallback for browsers without async clipboard (some in-app webviews)
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
          } catch {
            /* noop */
          }
          ta.remove();
        }
        btn.textContent = "Copied!";
        window.setTimeout(() => {
          btn.textContent = "Copy prompt";
        }, 1500);
      };

      btn.addEventListener("click", onClick);
      pre.appendChild(btn);
      cleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
        delete pre.dataset.copyEnhanced;
      });
    }

    return () => cleanups.forEach((c) => c());
  }, []);

  return null;
}
