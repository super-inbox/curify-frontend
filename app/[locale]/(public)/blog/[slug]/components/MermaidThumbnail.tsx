import React from 'react';

interface MermaidThumbnailProps {
  title: string;
  category: string;
  diagramType: 'flowchart' | 'graph' | 'sequence' | 'gantt';
  mermaidCode: string;
}

export const MermaidThumbnail: React.FC<MermaidThumbnailProps> = ({ 
  title, 
  category, 
  diagramType,
  mermaidCode 
}) => {
  // Predefined Mermaid diagrams for different blog types
  const getMermaidDiagram = () => {
    switch (diagramType) {
      case 'flowchart':
        return `flowchart TD
    A[Input Data] --> B{Processing}
    B -->|Valid| C[Transform]
    B -->|Invalid| D[Error Handling]
    C --> E[Output Results]
    D --> F[Log Error]
    F --> A`;
      
      case 'graph':
        return `graph LR
    A[User] --> B[Interface]
    B --> C[Processing]
    C --> D[Database]
    C --> E[API]
    E --> F[External Service]
    F --> C`;
      
      case 'sequence':
        return `sequenceDiagram
    participant U as User
    participant I as Interface
    participant S as System
    participant D as Database
    
    U->>I: Request
    I->>S: Process
    S->>D: Query
    D-->>S: Data
    S-->>I: Results
    I-->>U: Response`;
      
      case 'gantt':
        return `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Planning     :a1, 2024-01-01, 14d
    section Phase 2
    Development  :a2, after a1, 28d
    section Phase 3
    Testing      :a3, after a2, 14d
    section Phase 4
    Deployment   :a4, after a3, 7d`;
      
      default:
        return mermaidCode;
    }
  };

  const renderMermaidAsSVG = () => {
    const code = getMermaidDiagram();
    
    // Simple SVG representation of Mermaid diagram
    return (
      <svg width="400" height="250" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
        {/* Background */}
        <rect width="400" height="250" fill="#f8fafc"/>
        
        {/* Header */}
        <rect width="400" height="50" fill="#06b6d4"/>
        <text x="200" y="30" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">
          {title.length > 30 ? title.substring(0, 30) + '...' : title}
        </text>
        
        {/* Diagram Type Badge */}
        <rect x="10" y="60" width="80" height="20" rx="10" fill="#e0f2fe"/>
        <text x="50" y="74" fontFamily="monospace" fontSize="9" fontWeight="600" fill="#0277bd" textAnchor="middle">{diagramType}</text>
        
        {/* Simplified Diagram Visualization */}
        <g transform="translate(20, 90)">
          {diagramType === 'flowchart' && (
            <>
              {/* Nodes */}
              <rect x="0" y="0" width="60" height="30" rx="4" fill="#3b82f6" stroke="#1e40af" strokeWidth="1"/>
              <text x="30" y="20" fontFamily="Arial, sans-serif" fontSize="8" fill="white" textAnchor="middle">Input</text>
              
              <path d="M 60 15 L 80 15" stroke="#6b7280" strokeWidth="1" markerEnd="url(#arrow)"/>
              
              <rect x="80" y="0" width="60" height="30" rx="4" fill="#f59e0b" stroke="#92400e" strokeWidth="1"/>
              <text x="110" y="20" fontFamily="Arial, sans-serif" fontSize="8" fill="white" textAnchor="middle">Process</text>
              
              <path d="M 140 15 L 160 15" stroke="#6b7280" strokeWidth="1" markerEnd="url(#arrow)"/>
              
              <rect x="160" y="0" width="60" height="30" rx="4" fill="#10b981" stroke="#047857" strokeWidth="1"/>
              <text x="190" y="20" fontFamily="Arial, sans-serif" fontSize="8" fill="white" textAnchor="middle">Output</text>
              
              {/* Branch */}
              <path d="M 110 30 L 110 50" stroke="#6b7280" strokeWidth="1"/>
              <rect x="80" y="50" width="60" height="25" rx="4" fill="#ef4444" stroke="#b91c1c" strokeWidth="1"/>
              <text x="110" y="67" fontFamily="Arial, sans-serif" fontSize="7" fill="white" textAnchor="middle">Error</text>
            </>
          )}
          
          {diagramType === 'graph' && (
            <>
              {/* Network nodes */}
              <circle cx="30" cy="30" r="15" fill="#8b5cf6" stroke="#6b21a8" strokeWidth="1"/>
              <text x="30" y="34" fontFamily="Arial, sans-serif" fontSize="8" fill="white" textAnchor="middle">User</text>
              
              <circle cx="100" cy="30" r="15" fill="#3b82f6" stroke="#1e40af" strokeWidth="1"/>
              <text x="100" y="34" fontFamily="Arial, sans-serif" fontSize="8" fill="white" textAnchor="middle">API</text>
              
              <circle cx="170" cy="30" r="15" fill="#10b981" stroke="#047857" strokeWidth="1"/>
              <text x="170" y="34" fontFamily="Arial, sans-serif" fontSize="8" fill="white" textAnchor="middle">DB</text>
              
              <circle cx="100" cy="80" r="15" fill="#f59e0b" stroke="#92400e" strokeWidth="1"/>
              <text x="100" y="84" fontFamily="Arial, sans-serif" fontSize="8" fill="white" textAnchor="middle">Service</text>
              
              {/* Connections */}
              <line x1="45" y1="30" x2="85" y2="30" stroke="#6b7280" strokeWidth="1"/>
              <line x1="115" y1="30" x2="155" y2="30" stroke="#6b7280" strokeWidth="1"/>
              <line x1="100" y1="45" x2="100" y2="65" stroke="#6b7280" strokeWidth="1"/>
              <line x1="115" y1="70" x2="155" y2="40" stroke="#6b7280" strokeWidth="1"/>
            </>
          )}
          
          {diagramType === 'sequence' && (
            <>
              {/* Participants */}
              <rect x="0" y="0" width="40" height="20" fill="#e5e7eb"/>
              <text x="20" y="14" fontFamily="Arial, sans-serif" fontSize="8" textAnchor="middle">User</text>
              
              <rect x="60" y="0" width="40" height="20" fill="#e5e7eb"/>
              <text x="80" y="14" fontFamily="Arial, sans-serif" fontSize="8" textAnchor="middle">UI</text>
              
              <rect x="120" y="0" width="40" height="20" fill="#e5e7eb"/>
              <text x="140" y="14" fontFamily="Arial, sans-serif" fontSize="8" textAnchor="middle">System</text>
              
              <rect x="180" y="0" width="40" height="20" fill="#e5e7eb"/>
              <text x="200" y="14" fontFamily="Arial, sans-serif" fontSize="8" text-anchor="middle">DB</text>
              
              {/* Lifelines */}
              <line x1="20" y1="20" x2="20" y2="100" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2"/>
              <line x1="80" y1="20" x2="80" y2="100" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2"/>
              <line x1="140" y1="20" x2="140" y2="100" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2"/>
              <line x1="200" y1="20" x2="200" y2="100" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2"/>
              
              {/* Messages */}
              <path d="M 20 35 L 75 35" stroke="#3b82f6" strokeWidth="1" markerEnd="url(#arrow)"/>
              <text x="47" y="32" fontFamily="Arial, sans-serif" fontSize="7" text-anchor="middle">request</text>
              
              <path d="M 80 50 L 135 50" stroke="#10b981" strokeWidth="1" markerEnd="url(#arrow)"/>
              <text x="107" y="47" fontFamily="Arial, sans-serif" fontSize="7" text-anchor="middle">process</text>
              
              <path d="M 140 65 L 195 65" stroke="#f59e0b" strokeWidth="1" markerEnd="url(#arrow)"/>
              <text x="167" y="62" fontFamily="Arial, sans-serif" fontSize="7" text-anchor="middle">query</text>
              
              <path d="M 195 80 L 145 80" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" markerEnd="url(#arrow)"/>
              <text x="170" y="77" fontFamily="Arial, sans-serif" fontSize="7" text-anchor="middle">data</text>
            </>
          )}
          
          {diagramType === 'gantt' && (
            <>
              {/* Timeline header */}
              <text x="0" y="0" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#374151">Project Timeline</text>
              
              {/* Timeline bars */}
              <rect x="0" y="10" width="60" height="8" fill="#3b82f6"/>
              <text x="-5" y="25" fontFamily="Arial, sans-serif" fontSize="7" fill="#6b7280">Planning</text>
              
              <rect x="60" y="10" width="80" height="8" fill="#10b981"/>
              <text x="75" y="25" fontFamily="Arial, sans-serif" fontSize="7" fill="#6b7280">Development</text>
              
              <rect x="140" y="10" width="40" height="8" fill="#f59e0b"/>
              <text x="145" y="25" fontFamily="Arial, sans-serif" fontSize="7" fill="#6b7280">Testing</text>
              
              <rect x="180" y="10" width="20" height="8" fill="#8b5cf6"/>
              <text x="175" y="25" fontFamily="Arial, sans-serif" fontSize="7" fill="#6b7280">Deploy</text>
              
              {/* Time markers */}
              <line x1="0" y1="35" x2="200" y2="35" stroke="#d1d5db" strokeWidth="1"/>
              <text x="0" y="45" fontFamily="Arial, sans-serif" fontSize="6" fill="#6b7280">Week 1</text>
              <text x="60" y="45" fontFamily="Arial, sans-serif" fontSize="6" fill="#6b7280">Week 3</text>
              <text x="140" y="45" fontFamily="Arial, sans-serif" fontSize="6" fill="#6b7280">Week 7</text>
              <text x="180" y="45" fontFamily="Arial, sans-serif" fontSize="6" fill="#6b7280">Week 9</text>
            </>
          )}
        </g>
        
        {/* Code Preview */}
        <rect x="20" y="170" width="360" height="60" rx="4" fill="#1f2937"/>
        <text x="30" y="185" fontFamily="monospace" fontSize="7" fill="#10b981">// {diagramType} diagram</text>
        <text x="30" y="195" fontFamily="monospace" fontSize="6" fill="#9ca3af">{code.substring(0, 60)}...</text>
        <text x="30" y="205" fontFamily="monospace" fontSize="6" fill="#9ca3af">{code.includes('\n') ? code.split('\n')[1].substring(0, 60) : '...'}</text>
        <text x="30" y="215" fontFamily="monospace" fontSize="6" fill="#9ca3af">{code.includes('\n') && code.split('\n')[2] ? code.split('\n')[2].substring(0, 60) : '...'}</text>
        
        {/* Category Badge */}
        <rect x="320" y="235" width="70" height="12" rx="6" fill="#e0f2fe"/>
        <text x="355" y="244" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="600" fill="#0277bd" textAnchor="middle">{category}</text>
        
        {/* Arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#6b7280"/>
          </marker>
        </defs>
      </svg>
    );
  };

  return (
    <div className="mermaid-thumbnail">
      {renderMermaidAsSVG()}
    </div>
  );
};
