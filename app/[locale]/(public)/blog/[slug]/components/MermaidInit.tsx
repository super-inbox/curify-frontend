"use client";

import { useEffect } from "react";
import Script from "next/script";

export function MermaidInit() {
  useEffect(() => {
    const initMermaid = () => {
      if (typeof window !== "undefined" && (window as any).mermaid) {
        (window as any).mermaid.initialize({
          startOnLoad: true,
          theme: "default",
          flowchart: { useMaxWidth: true, htmlLabels: true },
        });
        (window as any).mermaid.run();
      }
    };
    initMermaid();
    const timer = setTimeout(initMermaid, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"
      strategy="afterInteractive"
    />
  );
}
