"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";

type MermaidRuntime = {
  initialize: (config: Record<string, unknown>) => void;
  run: (options: { nodes: HTMLElement[] }) => Promise<void>;
};

/** Load the legacy renderer only when this article contains a raw diagram. */
export function MermaidInit({ scopeId }: { scopeId: string }) {
  const [hasDiagrams, setHasDiagrams] = useState(false);
  const pendingNodes = useCallback(() => {
    const root = document.getElementById(scopeId);
    return Array.from(root?.querySelectorAll<HTMLElement>(
      '.mermaid:not([data-processed="true"])',
    ) ?? []);
  }, [scopeId]);

  useEffect(() => {
    setHasDiagrams(pendingNodes().length > 0);
  }, [pendingNodes]);

  const renderDiagrams = useCallback(() => {
    const mermaid = (window as Window & { mermaid?: MermaidRuntime }).mermaid;
    const nodes = pendingNodes();
    if (!mermaid || nodes.length === 0) return;
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      flowchart: { useMaxWidth: true, htmlLabels: true },
    });
    void mermaid.run({ nodes }).catch((error: unknown) => {
      console.error("Article diagram render failed:", error);
    });
  }, [pendingNodes]);

  if (!hasDiagrams) return null;
  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"
      strategy="afterInteractive"
      // onReady also runs on remount when Next has already cached the script.
      // A timer can race a slow download and leave diagrams unrendered.
      onReady={renderDiagrams}
    />
  );
}
