import React from 'react';

export const VideoTranscriptionMermaid: React.FC = () => {
  return (
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="600" height="400" fill="#f8fafc"/>
      
      {/* Header */}
      <rect width="600" height="50" fill="#1e40af"/>
      <text x="300" y="30" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle">
        AI Video Transcription Pipeline
      </text>
      
      {/* Pipeline Stages */}
      
      {/* Stage 1: Video Input */}
      <g transform="translate(50, 80)">
        <rect width="100" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
        <text x="50" y="25" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#1e40af" textAnchor="middle">Video Input</text>
        <text x="50" y="45" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748b" textAnchor="middle">MP4/AVI/MOV</text>
      </g>
      
      {/* Arrow 1 */}
      <path d="M 150 110 L 180 110" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      
      {/* Stage 2: Audio Extraction */}
      <g transform="translate(180, 80)">
        <rect width="100" height="60" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
        <text x="50" y="25" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#92400e" textAnchor="middle">Audio</text>
        <text x="50" y="45" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748b" textAnchor="middle">Extraction</text>
      </g>
      
      {/* Arrow 2 */}
      <path d="M 280 110 L 310 110" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      
      {/* Stage 3: ASR */}
      <g transform="translate(310, 80)">
        <rect width="100" height="60" rx="8" fill="#dcfce7" stroke="#22c55e" strokeWidth="2"/>
        <text x="50" y="25" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#166534" textAnchor="middle">ASR</text>
        <text x="50" y="45" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748b" textAnchor="middle">Speech Recognition</text>
      </g>
      
      {/* Arrow 3 */}
      <path d="M 410 110 L 440 110" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      
      {/* Stage 4: Alignment */}
      <g transform="translate(440, 80)">
        <rect width="100" height="60" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2"/>
        <text x="50" y="25" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#6b21a8" textAnchor="middle">Alignment</text>
        <text x="50" y="45" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748b" textAnchor="middle">Timestamp Sync</text>
      </g>
      
      {/* Branch to Speaker Diarization */}
      <path d="M 490 140 L 490 170" stroke="#3b82f6" strokeWidth="2"/>
      <path d="M 490 170 L 320 170" stroke="#3b82f6" strokeWidth="2"/>
      <path d="M 320 170 L 320 200" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      
      {/* Stage 5: Speaker Diarization */}
      <g transform="translate(270, 200)">
        <rect width="100" height="60" rx="8" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
        <text x="50" y="25" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#b91c1c" textAnchor="middle">Speaker</text>
        <text x="50" y="45" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748b" textAnchor="middle">Diarization</text>
      </g>
      
      {/* Arrow 4 */}
      <path d="M 370 230 L 400 230" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      
      {/* Stage 6: Output */}
      <g transform="translate(400, 200)">
        <rect width="100" height="60" rx="8" fill="#f0fdf4" stroke="#10b981" strokeWidth="2"/>
        <text x="50" y="25" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#047857" textAnchor="middle">Final Output</text>
        <text x="50" y="45" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748b" textAnchor="middle">Transcript</text>
      </g>
      
      {/* Technical Details Box */}
      <g transform="translate(50, 290)">
        <rect width="500" height="80" rx="8" fill="#f1f5f9" stroke="#64748b" strokeWidth="1"/>
        <text x="10" y="20" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#374151">Key Technologies:</text>
        <text x="10" y="40" fontFamily="Arial, sans-serif" fontSize="10" fill="#6b7280">• WhisperX for ASR and alignment</text>
        <text x="10" y="55" fontFamily="Arial, sans-serif" fontSize="10" fill="#6b7280">• Voice Activity Detection (VAD)</text>
        <text x="10" y="70" fontFamily="Arial, sans-serif" fontSize="10" fill="#6b7280">• Clustering algorithms for speaker separation</text>
        
        <text x="260" y="40" fontFamily="Arial, sans-serif" fontSize="10" fill="#6b7280">• Word-level timestamps</text>
        <text x="260" y="55" fontFamily="Arial, sans-serif" fontSize="10" fill="#6b7280">• Speaker embeddings</text>
        <text x="260" y="70" fontFamily="Arial, sans-serif" fontSize="10" fill="#6b7280">• Confidence scoring</text>
      </g>
      
      {/* Performance Metrics */}
      <g transform="translate(50, 20)">
        <rect width="120" height="25" rx="12" fill="#dbeafe"/>
        <text x="60" y="17" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#1e40af" textAnchor="middle">95% Accuracy</text>
      </g>
      
      <g transform="translate(180, 20)">
        <rect width="120" height="25" rx="12" fill="#dcfce7"/>
        <text x="60" y="17" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#166534" textAnchor="middle">Real-time</text>
      </g>
      
      <g transform="translate(310, 20)">
        <rect width="120" height="25" rx="12" fill="#fef3c7"/>
        <text x="60" y="17" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#92400e" textAnchor="middle">Multi-speaker</text>
      </g>
      
      {/* Arrow marker definition */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6"/>
        </marker>
      </defs>
    </svg>
  );
};
