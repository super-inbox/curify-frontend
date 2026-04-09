import React from 'react';

export const VideoTranscriptionBusinessMermaid: React.FC = () => {
  return (
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="600" height="400" fill="#f8fafc"/>
      
      {/* Header */}
      <rect width="600" height="50" fill="#059669"/>
      <text x="300" y="30" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle">
        
      </text>
      
      {/* Business Use Cases */}
      <g transform="translate(50, 80)">
        <rect width="200" height="120" rx="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2"/>
        <text x="100" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="600" fill="#0c4a6e" textAnchor="middle">Use Cases</text>
        
        <circle cx="30" cy="50" r="4" fill="#0284c7"/>
        <text x="45" y="54" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Content Creation</text>
        
        <circle cx="30" cy="70" r="4" fill="#0284c7"/>
        <text x="45" y="74" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Education</text>
        
        <circle cx="30" cy="90" r="4" fill="#0284c7"/>
        <text x="45" y="94" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Meetings</text>
        
        <circle cx="120" cy="50" r="4" fill="#0284c7"/>
        <text x="135" y="54" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Accessibility</text>
        
        <circle cx="120" cy="70" r="4" fill="#0284c7"/>
        <text x="135" y="74" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">SEO</text>
        
        <circle cx="120" cy="90" r="4" fill="#0284c7"/>
        <text x="135" y="94" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Compliance</text>
      </g>
      
      {/* Business Benefits */}
      <g transform="translate(350, 80)">
        <rect width="200" height="120" rx="8" fill="#dcfce7" stroke="#16a34a" strokeWidth="2"/>
        <text x="100" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="600" fill="#14532d" textAnchor="middle">Business Benefits</text>
        
        <circle cx="30" cy="50" r="4" fill="#16a34a"/>
        <text x="45" y="54" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Time Savings</text>
        
        <circle cx="30" cy="70" r="4" fill="#16a34a"/>
        <text x="45" y="74" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Cost Reduction</text>
        
        <circle cx="30" cy="90" r="4" fill="#16a34a"/>
        <text x="45" y="94" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Reach Expansion</text>
        
        <circle cx="120" cy="50" r="4" fill="#16a34a"/>
        <text x="135" y="54" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Analytics</text>
        
        <circle cx="120" cy="70" r="4" fill="#16a34a"/>
        <text x="135" y="74" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Automation</text>
        
        <circle cx="120" cy="90" r="4" fill="#16a34a"/>
        <text x="135" y="94" fontFamily="Arial, sans-serif" fontSize="10" fill="#475569">Compliance</text>
      </g>
      
      {/* Implementation Flow */}
      <g transform="translate(50, 230)">
        <text x="0" y="0" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#374151">Implementation Process:</text>
        
        {/* Step boxes */}
        <rect x="0" y="10" width="100" height="30" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
        <text x="50" y="30" fontFamily="Arial, sans-serif" fontSize="10" fill="#92400e" textAnchor="middle">1. Assessment</text>
        
        <path d="M 100 25 L 120 25" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)"/>
        
        <rect x="120" y="10" width="100" height="30" rx="4" fill="#e0e7ff" stroke="#3730a3" strokeWidth="1"/>
        <text x="170" y="30" fontFamily="Arial, sans-serif" fontSize="10" fill="#1e1b4b" textAnchor="middle">2. Tool Selection</text>
        
        <path d="M 220 25 L 240 25" stroke="#3730a3" strokeWidth="2" markerEnd="url(#arrow)"/>
        
        <rect x="240" y="10" width="100" height="30" rx="4" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1"/>
        <text x="290" y="30" fontFamily="Arial, sans-serif" fontSize="10" fill="#5b21b6" textAnchor="middle">3. Integration</text>
        
        <path d="M 340 25 L 360 25" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arrow)"/>
        
        <rect x="360" y="10" width="100" height="30" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1"/>
        <text x="410" y="30" fontFamily="Arial, sans-serif" fontSize="10" fill="#166534" textAnchor="middle">4. Optimization</text>
      </g>
      
      {/* ROI Metrics */}
      <g transform="translate(50, 290)">
        <rect width="500" height="70" rx="8" fill="#f1f5f9" stroke="#64748b" strokeWidth="1"/>
        <text x="10" y="20" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#374151">ROI Metrics:</text>
        
        <text x="10" y="40" fontFamily="Arial, sans-serif" fontSize="10" fill="#6b7280">• 75% reduction in manual transcription time</text>
        <text x="10" y="55" fontFamily="Arial, sans-serif" fontSize="10" fill="#6b7280">• 3x faster content production pipeline</text>
        
        <text x="260" y="40" fontFamily="Arial, sans-serif" fontSize="10" fill="#6b7280">• 40% cost savings vs manual services</text>
        <text x="260" y="55" fontFamily="Arial, sans-serif" fontSize="10" fill="#6b7280">• 2x increase in content accessibility</text>
      </g>
      
      {/* Performance Badges */}
      <g transform="translate(50, 20)">
        <rect width="80" height="25" rx="12" fill="#dcfce7"/>
        <text x="40" y="17" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#166534" textAnchor="middle">Fast ROI</text>
      </g>
      
      <g transform="translate(150, 20)">
        <rect width="80" height="25" rx="12" fill="#e0f2fe"/>
        <text x="40" y="17" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#0c4a6e" textAnchor="middle">Scalable</text>
      </g>
      
      <g transform="translate(250, 20)">
        <rect width="80" height="25" rx="12" fill="#fef3c7"/>
        <text x="40" y="17" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#92400e" textAnchor="middle">Secure</text>
      </g>
      
      <g transform="translate(350, 20)">
        <rect width="80" height="25" rx="12" fill="#ede9fe"/>
        <text x="40" y="17" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#5b21b6" textAnchor="middle">Compliant</text>
      </g>
      
      <g transform="translate(450, 20)">
        <rect width="80" height="25" rx="12" fill="#fee2e2"/>
        <text x="40" y="17" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#b91c1c" textAnchor="middle">Global</text>
      </g>
      
      {/* Arrow marker definition */}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#6b7280"/>
        </marker>
      </defs>
    </svg>
  );
};
