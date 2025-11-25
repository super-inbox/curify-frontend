'use client';

import { useEffect, useRef } from 'react';

export default function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderMermaid = async () => {
      if (containerRef.current) {
        try {
          const { default: mermaid } = await import('mermaid');
          mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
          });
          mermaid.contentLoaded();
        } catch (error) {
          console.error('Error loading Mermaid:', error);
        }
      }
    };

    renderMermaid();
  }, [chart]);

  return (
    <div className="my-8 p-6 bg-gray-50 rounded-lg" ref={containerRef}>
      <div className="mermaid">{chart}</div>
    </div>
  );
}
