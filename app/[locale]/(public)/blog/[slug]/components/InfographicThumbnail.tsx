import React from 'react';

interface InfographicThumbnailProps {
  title: string;
  category: string;
  type: 'flow' | 'stats' | 'comparison' | 'timeline';
  data?: any[];
}

export const InfographicThumbnail: React.FC<InfographicThumbnailProps> = ({ 
  title, 
  category, 
  type,
  data = [] 
}) => {
  const renderFlowChart = () => (
    <svg width="400" height="250" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="250" fill="#f8fafc"/>
      
      {/* Header */}
      <rect width="400" height="50" fill="#3b82f6"/>
      <text x="200" y="30" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">
        {title.length > 30 ? title.substring(0, 30) + '...' : title}
      </text>
      
      {/* Flow Diagram */}
      <rect x="30" y="70" width="80" height="50" rx="6" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
      <text x="70" y="90" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="600" fill="#1e40af" textAnchor="middle">Input</text>
      <text x="70" y="105" fontFamily="Arial, sans-serif" fontSize="9" fill="#64748b" textAnchor="middle">Data</text>
      
      <path d="M 110 95 L 130 95" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      
      <rect x="130" y="70" width="80" height="50" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
      <text x="170" y="90" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="600" fill="#92400e" textAnchor="middle">Process</text>
      <text x="170" y="105" fontFamily="Arial, sans-serif" fontSize="9" fill="#64748b" textAnchor="middle">Analysis</text>
      
      <path d="M 210 95 L 230 95" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      
      <rect x="230" y="70" width="80" height="50" rx="6" fill="#dcfce7" stroke="#22c55e" strokeWidth="2"/>
      <text x="270" y="90" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="600" fill="#166534" textAnchor="middle">Output</text>
      <text x="270" y="105" fontFamily="Arial, sans-serif" fontSize="9" fill="#64748b" textAnchor="middle">Results</text>
      
      {/* Key Points */}
      <text x="30" y="150" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#374151">Key Points:</text>
      <circle cx="35" cy="165" r="2" fill="#3b82f6"/>
      <text x="45" y="168" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280">• Automated workflow</text>
      <circle cx="35" cy="180" r="2" fill="#f59e0b"/>
      <text x="45" y="183" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280">• Smart processing</text>
      <circle cx="35" cy="195" r="2" fill="#22c55e"/>
      <text x="45" y="198" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280">• Quality results</text>
      
      {/* Category Badge */}
      <rect x="320" y="210" width="70" height="25" rx="12" fill="#e0e7ff"/>
      <text x="355" y="227" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="#4338ca" textAnchor="middle">{category}</text>
      
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#3b82f6"/>
        </marker>
      </defs>
    </svg>
  );

  const renderStatsChart = () => (
    <svg width="400" height="250" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="250" fill="#f8fafc"/>
      
      {/* Header */}
      <rect width="400" height="50" fill="#10b981"/>
      <text x="200" y="30" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">
        {title.length > 30 ? title.substring(0, 30) + '...' : title}
      </text>
      
      {/* Bar Chart */}
      <text x="30" y="80" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#374151">Performance Metrics</text>
      
      {/* Bars */}
      <rect x="30" y="120" width="40" height="60" fill="#3b82f6"/>
      <text x="50" y="195" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280" textAnchor="middle">Speed</text>
      <text x="50" y="115" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#1e40af" textAnchor="middle">85%</text>
      
      <rect x="90" y="100" width="40" height="80" fill="#10b981"/>
      <text x="110" y="195" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280" textAnchor="middle">Quality</text>
      <text x="110" y="95" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#047857" textAnchor="middle">92%</text>
      
      <rect x="150" y="110" width="40" height="70" fill="#f59e0b"/>
      <text x="170" y="195" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280" textAnchor="middle">Efficiency</text>
      <text x="170" y="105" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#92400e" textAnchor="middle">88%</text>
      
      <rect x="210" y="90" width="40" height="90" fill="#8b5cf6"/>
      <text x="230" y="195" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280" textAnchor="middle">Accuracy</text>
      <text x="230" y="85" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#6b21a8" textAnchor="middle">95%</text>
      
      {/* Key Insights */}
      <text x="280" y="80" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="600" fill="#374151">Key Insights:</text>
      <text x="280" y="100" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280">• High accuracy rate</text>
      <text x="280" y="115" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280">• Fast processing</text>
      <text x="280" y="130" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280">• Reliable output</text>
      <text x="280" y="145" fontFamily="Arial, sans-serif" fontSize="9" fill="#6b7280">• Cost effective</text>
      
      {/* Category Badge */}
      <rect x="320" y="210" width="70" height="25" rx="12" fill="#d1fae5"/>
      <text x="355" y="227" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="#047857" textAnchor="middle">{category}</text>
    </svg>
  );

  const renderComparison = () => (
    <svg width="400" height="250" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="250" fill="#f8fafc"/>
      
      {/* Header */}
      <rect width="400" height="50" fill="#8b5cf6"/>
      <text x="200" y="30" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">
        {title.length > 30 ? title.substring(0, 30) + '...' : title}
      </text>
      
      {/* Comparison Table */}
      <text x="30" y="75" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#374151">Feature Comparison</text>
      
      {/* Headers */}
      <rect x="30" y="85" width="100" height="25" fill="#e5e7eb"/>
      <text x="80" y="102" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#374151" textAnchor="middle">Feature</text>
      
      <rect x="130" y="85" width="100" height="25" fill="#dbeafe"/>
      <text x="180" y="102" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#1e40af" textAnchor="middle">Option A</text>
      
      <rect x="230" y="85" width="100" height="25" fill="#dcfce7"/>
      <text x="280" y="102" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#166534" textAnchor="middle">Option B</text>
      
      {/* Rows */}
      <rect x="30" y="110" width="100" height="20" fill="#f9fafb"/>
      <text x="80" y="124" fontFamily="Arial, sans-serif" fontSize="9" fill="#374151" textAnchor="middle">Speed</text>
      <rect x="130" y="110" width="100" height="20" fill="#f9fafb"/>
      <text x="180" y="124" fontFamily="Arial, sans-serif" fontSize="9" fill="#1e40af" textAnchor="middle">Fast</text>
      <rect x="230" y="110" width="100" height="20" fill="#f9fafb"/>
      <text x="280" y="124" fontFamily="Arial, sans-serif" fontSize="9" fill="#166534" textAnchor="middle">Medium</text>
      
      <rect x="30" y="130" width="100" height="20" fill="#f9fafb"/>
      <text x="80" y="144" fontFamily="Arial, sans-serif" fontSize="9" fill="#374151" textAnchor="middle">Cost</text>
      <rect x="130" y="130" width="100" height="20" fill="#f9fafb"/>
      <text x="180" y="144" fontFamily="Arial, sans-serif" fontSize="9" fill="#1e40af" textAnchor="middle">Low</text>
      <rect x="230" y="130" width="100" height="20" fill="#f9fafb"/>
      <text x="280" y="144" fontFamily="Arial, sans-serif" fontSize="9" fill="#166534" textAnchor="middle">High</text>
      
      <rect x="30" y="150" width="100" height="20" fill="#f9fafb"/>
      <text x="80" y="164" fontFamily="Arial, sans-serif" fontSize="9" fill="#374151" textAnchor="middle">Quality</text>
      <rect x="130" y="150" width="100" height="20" fill="#f9fafb"/>
      <text x="180" y="164" fontFamily="Arial, sans-serif" fontSize="9" fill="#1e40af" textAnchor="middle">Good</text>
      <rect x="230" y="150" width="100" height="20" fill="#f9fafb"/>
      <text x="280" y="164" fontFamily="Arial, sans-serif" fontSize="9" fill="#166534" text-anchor="middle">Excellent</text>
      
      {/* Recommendation */}
      <rect x="30" y="180" width="300" height="30" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
      <text x="180" y="199" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#92400e" textAnchor="middle">Recommendation: Choose based on your priorities</text>
      
      {/* Category Badge */}
      <rect x="320" y="215" width="70" height="25" rx="12" fill="#ede9fe"/>
      <text x="355" y="232" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="#6b21a8" text-anchor="middle">{category}</text>
    </svg>
  );

  const renderTimeline = () => (
    <svg width="400" height="250" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="250" fill="#f8fafc"/>
      
      {/* Header */}
      <rect width="400" height="50" fill="#f59e0b"/>
      <text x="200" y="30" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">
        {title.length > 30 ? title.substring(0, 30) + '...' : title}
      </text>
      
      {/* Timeline */}
      <text x="30" y="75" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#374151">Development Timeline</text>
      
      {/* Timeline Line */}
      <line x1="50" y1="120" x2="350" y2="120" stroke="#d1d5db" strokeWidth="2"/>
      
      {/* Timeline Points */}
      <circle cx="80" cy="120" r="8" fill="#3b82f6"/>
      <text x="80" y="105" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="#1e40af" textAnchor="middle">Phase 1</text>
      <text x="80" y="140" fontFamily="Arial, sans-serif" fontSize="8" fill="#6b7280" textAnchor="middle">Planning</text>
      
      <circle cx="160" cy="120" r="8" fill="#10b981"/>
      <text x="160" y="105" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="#047857" textAnchor="middle">Phase 2</text>
      <text x="160" y="140" fontFamily="Arial, sans-serif" fontSize="8" fill="#6b7280" textAnchor="middle">Development</text>
      
      <circle cx="240" cy="120" r="8" fill="#f59e0b"/>
      <text x="240" y="105" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="#92400e" textAnchor="middle">Phase 3</text>
      <text x="240" y="140" fontFamily="Arial, sans-serif" fontSize="8" fill="#6b7280" text-anchor="middle">Testing</text>
      
      <circle cx="320" cy="120" r="8" fill="#8b5cf6"/>
      <text x="320" y="105" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="#6b21a8" text-anchor="middle">Phase 4</text>
      <text x="320" y="140" fontFamily="Arial, sans-serif" fontSize="8" fill="#6b7280" text-anchor="middle">Launch</text>
      
      {/* Duration Labels */}
      <text x="120" y="165" fontFamily="Arial, sans-serif" fontSize="8" fill="#6b7280" text-anchor="middle">2 weeks</text>
      <text x="200" y="165" fontFamily="Arial, sans-serif" fontSize="8" fill="#6b7280" text-anchor="middle">4 weeks</text>
      <text x="280" y="165" fontFamily="Arial, sans-serif" fontSize="8" fill="#6b7280" text-anchor="middle">2 weeks</text>
      
      {/* Total Duration */}
      <rect x="30" y="180" width="340" height="25" rx="6" fill="#ecfdf5" stroke="#10b981" strokeWidth="1"/>
      <text x="200" y="197" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="#047857" text-anchor="middle">Total Duration: 8 weeks</text>
      
      {/* Category Badge */}
      <rect x="320" y="215" width="70" height="25" rx="12" fill="#fef3c7"/>
      <text x="355" y="232" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="#92400e" text-anchor="middle">{category}</text>
    </svg>
  );

  return (
    <div className="infographic-thumbnail">
      {type === 'flow' && renderFlowChart()}
      {type === 'stats' && renderStatsChart()}
      {type === 'comparison' && renderComparison()}
      {type === 'timeline' && renderTimeline()}
    </div>
  );
};
