import React from 'react';
import { InfographicThumbnail } from '../components/InfographicThumbnail';
import { MermaidThumbnail } from '../components/MermaidThumbnail';

export interface ThumbnailConfig {
  type: 'image' | 'infographic' | 'mermaid';
  style?: 'flow' | 'stats' | 'comparison' | 'timeline';
  diagramType?: 'flowchart' | 'graph' | 'sequence' | 'gantt';
  customContent?: any;
}

export interface BlogThumbnailProps {
  title: string;
  category: string;
  config: ThumbnailConfig;
  fallbackImage?: string;
}

export const BlogThumbnail: React.FC<BlogThumbnailProps> = ({ 
  title, 
  category, 
  config,
  fallbackImage 
}) => {
  const renderThumbnail = () => {
    switch (config.type) {
      case 'infographic':
        return React.createElement(
          InfographicThumbnail,
          {
            title: title,
            category: category,
            type: config.style || 'flow',
            data: config.customContent
          }
        );
      
      case 'mermaid':
        return React.createElement(
          MermaidThumbnail,
          {
            title: title,
            category: category,
            diagramType: config.diagramType || 'flowchart',
            mermaidCode: config.customContent || ''
          }
        );
      
      case 'image':
      default:
        // Fallback to traditional image
        if (fallbackImage) {
          return React.createElement('img', {
            src: fallbackImage,
            alt: title,
            className: 'w-full h-full object-cover rounded-lg'
          });
        }
        
        // Default placeholder if no image provided
        return React.createElement('div', {
          className: 'w-full h-full bg-gray-200 rounded-lg flex items-center justify-center'
        }, React.createElement('span', {
          className: 'text-gray-500 text-sm'
        }, 'No thumbnail available'));
    }
  };

  return React.createElement('div', {
    className: 'blog-thumbnail w-full h-full'
  }, renderThumbnail());
};

// Predefined configurations for different blog categories
export const getThumbnailConfigForCategory = (category: string, slug: string): ThumbnailConfig => {
  const configs: Record<string, ThumbnailConfig[]> = {
    'ds-ai-engineering': [
      { type: 'mermaid', diagramType: 'flowchart' },
      { type: 'infographic', style: 'flow' },
      { type: 'infographic', style: 'comparison' }
    ],
    'creator-tools': [
      { type: 'infographic', style: 'stats' },
      { type: 'mermaid', diagramType: 'sequence' },
      { type: 'infographic', style: 'timeline' }
    ],
    'video-translation': [
      { type: 'mermaid', diagramType: 'sequence' },
      { type: 'infographic', style: 'flow' },
      { type: 'infographic', style: 'stats' }
    ],
    'nano-banana-prompts': [
      { type: 'infographic', style: 'comparison' },
      { type: 'mermaid', diagramType: 'graph' },
      { type: 'infographic', style: 'stats' }
    ],
    'culture': [
      { type: 'infographic', style: 'timeline' },
      { type: 'mermaid', diagramType: 'gantt' }
    ]
  };

  const categoryConfigs = configs[category] || [
    { type: 'infographic', style: 'flow' }
  ];

  // Use slug to consistently select the same config for the same blog post
  const configIndex = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % categoryConfigs.length;
  
  return categoryConfigs[configIndex];
};

// Helper to generate Mermaid code for specific blog types
export const generateMermaidCode = (blogType: string, title: string): string => {
  const templates: Record<string, string> = {
    'qa-bot': `flowchart TD
    A[User Question] --> B[NLP Processing]
    B --> C{Intent Recognition}
    C -->|Simple Query| D[Direct Answer]
    C -->|Complex Task| E[Task Agent]
    E --> F[Execute Action]
    F --> G[Return Result]
    D --> G`,
    
    'video-enhancement': `flowchart LR
    A[Raw Video] --> B[AI Analysis]
    B --> C[Storyboard Gen]
    C --> D[Enhancement]
    D --> E[Final Output]`,
    
    'voice-cloning': `sequenceDiagram
    participant U as User
    participant S as System
    participant AI as AI Model
    participant DB as Database
    
    U->>S: Voice Sample
    S->>AI: Process Audio
    AI->>DB: Store Voice Profile
    AI-->>S: Voice Model
    S-->>U: Cloning Complete`,
    
    'translation': `flowchart TD
    A[Source Video] --> B[Speech Recognition]
    B --> C[Translation]
    C --> D[Voice Synthesis]
    D --> E[Translated Video]`,
    
    'video-transcription-business': `flowchart TD
    A[Video Input] --> B[Speech Recognition]
    B --> C[Text Processing]
    C --> D{Business Use Case}
    D -->|Content| E[SEO Optimization]
    D -->|Education| F[Learning Materials]
    D -->|Meetings| G[Documentation]
    D -->|Accessibility| H[Compliance]
    E --> I[Business Value]
    F --> I
    G --> I
    H --> I`,
    
    'video-transcription-pipeline': `flowchart TD
    A[Video/Audio] --> B[ASR Engine]
    B --> C[Raw Transcript]
    C --> D[Speaker Diarization]
    D --> E[Timestamp Alignment]
    E --> F[Post-Processing]
    F --> G[Final Output]
    
    H[Quality Metrics] --> F
    I[Language Models] --> B
    J[Audio Enhancement] --> A`,
    
    'comparison': `graph LR
    A[Option A] --> B[Criteria 1]
    A --> C[Criteria 2]
    A --> D[Criteria 3]
    E[Option B] --> B
    E --> C
    E --> D
    F[Option C] --> B
    F --> C
    F --> D`
  };

  // Simple keyword matching to select template
  for (const [key, template] of Object.entries(templates)) {
    if (title.toLowerCase().includes(key)) {
      return template;
    }
  }

  return templates['qa-bot']; // Default fallback
};
