'use client';

import React, { useEffect, useRef, useId } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
  chart: string;
  id?: string;
  className?: string;
}

// Initialize once at module load so multiple charts on a page don't reset
// each other. Mermaid v11+ deprecates the legacy `mermaid.contentLoaded()`
// re-scan pattern — `mermaid.render(id, chart)` is the supported entry
// point and returns the SVG synchronously (resolved promise).
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
});

export const MermaidChart: React.FC<MermaidChartProps> = ({
  chart,
  id,
  className = '',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  // Stable per-instance id so multiple charts on the same page don't collide.
  const reactId = useId().replace(/[:]/g, '');
  const renderId = `mermaid-${id || reactId}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!chartRef.current) return;
      try {
        const { svg } = await mermaid.render(renderId, chart);
        if (!cancelled && chartRef.current) {
          chartRef.current.innerHTML = svg;
        }
      } catch (err) {
        // Surface the chart source as a code block on render failure so the
        // page doesn't look broken; the chart text itself is still useful.
        if (chartRef.current) {
          chartRef.current.innerHTML =
            `<pre style="white-space:pre-wrap;font-size:0.85rem;color:#475569;">${chart}</pre>`;
        }
        console.error('MermaidChart render failed:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, renderId]);

  return (
    <div
      ref={chartRef}
      className={`mermaid-container ${className}`}
      style={{
        maxWidth: '100%',
        overflow: 'auto',
        backgroundColor: '#f8fafc',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0',
      }}
    />
  );
};
