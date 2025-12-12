/**
 * Scene Detection Blog Post
 * 
 * This component renders a detailed blog post about AI-powered scene detection,
 * showcasing how raw video is analyzed and transformed into structured storyboards.
 * It demonstrates the technical process and benefits of automated scene analysis.
 */

import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import CdnImage from '@/app/[locale]/_components/CdnImage';

// SEO metadata for the blog post
export const metadata: Metadata = {
  title: "From Raw Footage to Storyboards - AI-Powered Scene Detection",
  description: "How Curify AI transforms raw video into structured storyboards using advanced scene detection and analysis.",
};

// Helper component for rendering lists from translations
function ListPoints({ points }: { points: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-2 text-gray-700">
      {points.map((point, index) => (
        <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
      ))}
    </ul>
  );
}

// Helper component for the pro tip section
function ProTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-blue-500 pl-4 py-2 my-6">
      <p className="font-semibold text-blue-700">Pro Tip</p>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}

// Main component for the Scene Detection blog post
export default function SceneDetectionPage() {
  const t = useTranslations('SceneDetection');
  
  return (
    <article className="max-w-4xl mx-auto px-6 py-12 prose prose-base md:prose-lg">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Advanced Scene Detection & Storyboard Generation</h1>
      
      {/* Author info */}
      <div className="flex items-center mb-8">
        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
          <CdnImage
            src="/images/team/author.jpg"
            alt="AI Research Team"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-medium text-gray-900">Curify AI Team</p>
          <p className="text-sm text-gray-500">AI Research Team</p>
        </div>
      </div>

      {/* Introduction */}
      <div className="prose prose-lg max-w-none mb-12">
        <p className="text-xl text-gray-600 leading-relaxed mb-8">
          Our advanced scene detection and storyboard generation system transforms raw video content into structured, searchable storyboards. Built with Python and leveraging computer vision and AI, this pipeline automates the tedious process of video analysis, making it accessible to content creators and developers alike.
        </p>
        
        <div className="relative w-full h-96 rounded-xl overflow-hidden mb-12">
          <CdnImage
            src="/blog/scene-detection-hero.jpg"
            alt="AI analyzing video scenes and generating storyboards"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <p className="text-white/80 text-sm">
              The scene detection pipeline in action, identifying key moments and generating structured storyboards
            </p>
          </div>
        </div>
      </div>

      {/* Pro Tip Section */}
      <ProTip>
        For optimal results, ensure your video has clear visual separation between scenes. The system works best with well-lit footage and minimal motion blur. Consider adding chapter markers or scene breaks in your video editor to improve detection accuracy.
      </ProTip>

      {/* Technical Implementation */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-6">Technical Implementation</h2>
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">1. Video Processing Pipeline</h3>
            <p className="text-gray-700 mb-3">Our system processes videos through a multi-stage pipeline:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Video loading and frame extraction using OpenCV</li>
              <li>Scene boundary detection with adaptive thresholding</li>
              <li>Feature extraction using deep learning models</li>
              <li>Scene classification and labeling</li>
              <li>Storyboard generation in JSON format</li>
            </ul>
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <pre className="text-sm overflow-x-auto">
                <code>
{`def process_video(video_path: str, output_path: str, threshold: float = 0.4, use_ai: bool = True):
    # Initialize video analyzer
    analyzer = VideoAnalyzer(video_path)
    
    # Initialize AI components
    ai_analyzer = create_analyzer(model="llava:latest") if use_ai else None
    camera_analyzer = CameraAnalyzer(
        frame_width=analyzer.width,
        frame_height=analyzer.height,
        fps=analyzer.fps
    )
    
    # Generate storyboard
    storyboard = StoryboardGenerator(analyzer, ai_analyzer, camera_analyzer)
    scenes = storyboard.analyze_video(threshold=threshold, use_ai=use_ai)
    
    # Save results
    storyboard = Storyboard(
        scenes=scenes,
        metadata={
            'video_path': video_path,
            'duration': analyzer.duration,
            'resolution': f"{analyzer.width}x{analyzer.height}",
            'fps': analyzer.fps,
            'frame_count': analyzer.frame_count
        }
    )
    storyboard.to_json(output_path)`}
                </code>
              </pre>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">2. Key Features</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><strong>YouTube Integration</strong>: Directly process videos from YouTube URLs</li>
              <li><strong>AI-Powered Analysis</strong>: Optional AI enhancement for scene understanding</li>
              <li><strong>Camera Motion Detection</strong>: Identify different types of camera movements</li>
              <li><strong>Flexible Output</strong>: Export to JSON or human-readable formats</li>
              <li><strong>Configurable Thresholds</strong>: Fine-tune detection sensitivity</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">3. Output Structure</h3>
            <p className="text-gray-700 mb-3">The generated storyboard includes detailed metadata for each scene:</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <pre className="text-sm overflow-x-auto">
                <code>
{`{
  "scenes": [
    {
      "scene_id": 1,
      "start_time": 0.0,
      "end_time": 5.2,
      "duration": 5.2,
      "key_frame": "path/to/keyframe.jpg",
      "shot_type": "establishing",
      "camera_move": "static",
      "detected_objects": ["person", "car", "building"],
      "description": "Wide shot of a city street with moderate traffic"
    },
    // Additional scenes...
  ],
  "metadata": {
    "video_path": "input/video.mp4",
    "duration": 120.5,
    "resolution": "1920x1080",
    "fps": 30,
    "frame_count": 3615
  }
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-6">Why This Approach Works</h2>
        <div className="space-y-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <strong>Modular Architecture</strong> - The system is built with separate components for video analysis, AI processing, and output generation, making it easy to extend and maintain.
              </div>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <strong>Performance Optimized</strong> - Efficient frame processing and parallelization ensure fast analysis even for long videos.
              </div>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <strong>AI-Enhanced Analysis</strong> - Optional AI components provide deeper scene understanding and more accurate labeling.
              </div>
            </li>
          </ul>
        </div>
      </section>


      {/* Advanced Usage */}
      <section className="my-16">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          Advanced Usage & Customization
        </h2>
        
        <p className="text-gray-600 mb-8 text-lg">
          The scene detection system is highly customizable to fit different use cases. Here are some advanced features and customization options:
        </p>

        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">
              Custom Scene Detection Thresholds
            </h3>
            <p className="text-gray-700 mb-3">
              Adjust the sensitivity of scene detection by modifying the threshold parameter. Lower values make the detection more sensitive to changes.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm overflow-x-auto">
                <code>
{`# More sensitive detection (0.0 - 1.0, default: 0.4)
python scene_detector.py input.mp4 --threshold 0.3

# Less sensitive detection
python scene_detector.py input.mp4 --threshold 0.6`}
                </code>
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">
              AI-Enhanced Analysis
            </h3>
            <p className="text-gray-700 mb-3">
              Enable AI analysis for more detailed scene understanding and labeling. This requires additional setup with the Ollama server.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm overflow-x-auto">
                <code>
{`# Enable AI analysis (requires Ollama server)
python scene_detector.py input.mp4 --use-ai --ai-model llava:latest

# Specify custom AI model
python scene_detector.py input.mp4 --use-ai --ai-model your-custom-model`}
                </code>
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">
              Output Customization
            </h3>
            <p className="text-gray-700 mb-3">
              Customize the output format and include additional metadata in the generated storyboard.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm overflow-x-auto">
                <code>
{`# Output to custom file
python scene_detector.py input.mp4 --output custom_output.json

# Include detailed frame information
python scene_detector.py input.mp4 --include-frames

# Generate a visual storyboard
python scene_detector.py input.mp4 --generate-preview`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Integration with Other Tools
          </h3>
          <p className="text-gray-700 mb-6">
            The storyboard output can be easily integrated with other tools and workflows. Here are some examples:
          </p>
          
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">1</span>
              <div>
                <strong>Video Editing Software</strong> - Import the JSON output into video editors that support script-based editing
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">2</span>
              <div>
                <strong>Content Management Systems</strong> - Automatically generate metadata for video assets
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">3</span>
              <div>
                <strong>AI Training Data</strong> - Use the structured output as training data for machine learning models
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Scene Breakdown Section */}
      <section className="my-16">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          {t('sceneBreakdown.title')}
        </h2>
        
        <p className="text-gray-600 mb-8 text-lg">
          {t('sceneBreakdown.introduction')}
        </p>

        <div className="space-y-12">
          {(t.raw('sceneBreakdown.scenes') as any[]).map((scene: any, index: number) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">
                {scene.title}
              </h3>
              <p className="text-gray-700 mb-3">{scene.content}</p>
              <div className="space-y-4 mt-3">
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 font-mono">
                  {scene.example}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">JSON Structure:</p>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    <code>{JSON.stringify(scene.jsonExample, null, 2)}</code>
                  </pre>
                  <p className="text-xs text-gray-500 mt-1">{scene.jsonDescription}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {t('sceneBreakdown.analysisTitle')}
          </h3>
          <p className="text-gray-700 mb-6">
            {t('sceneBreakdown.analysisContent')}
          </p>
          
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-3">
              {t('sceneBreakdown.fullExampleTitle')}
            </h4>
            <p className="text-gray-700 mb-4">
              {t('sceneBreakdown.fullExampleDescription')}
            </p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>{JSON.stringify(t.raw('sceneBreakdown.fullExample'), null, 2)}</code>
            </pre>
          </div>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3">
            {t('sceneBreakdown.benefitsTitle')}
          </h4>
          <ul className="space-y-2">
            {(t.raw('sceneBreakdown.benefits') as string[]).map((benefit: string, index: number) => (
              <li key={index} className="flex items-start" dangerouslySetInnerHTML={{ __html: benefit }} />
            ))}
          </ul>
        </div>
      </section>

      {/* Conclusion Section */}
      <section className="prose prose-lg max-w-none mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('conclusion.title')}
        </h2>
        <p className="text-gray-600 mb-4">
          {t.rich('conclusion.p1', {
            strong: (chunks) => <strong>{chunks}</strong>
          })}
        </p>
        <p className="text-gray-600">
          {t.rich('conclusion.p2', {
            strong: (chunks) => <strong>{chunks}</strong>
          })}
        </p>
      </section>
    </article>
  );
}