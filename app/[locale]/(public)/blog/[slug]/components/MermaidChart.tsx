'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
  chart: string;
  id?: string;
  className?: string;
}

export const MermaidChart: React.FC<MermaidChartProps> = ({ 
  chart, 
  id = 'mermaid-chart', 
  className = '' 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    });

    if (chartRef.current) {
      chartRef.current.innerHTML = `<div class="mermaid">${chart}</div>`;
      mermaid.contentLoaded();
    }
  }, [chart]);

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
        border: '1px solid #e2e8f0'
      }}
    />
  );
};
