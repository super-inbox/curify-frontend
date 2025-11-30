/** * Storyboard to AI Pipeline Blog Post * * This component renders a detailed blog post about transforming storyboards into * AI-powered video pipelines, showcasing the process from initial prompt to final video. * It demonstrates Curify AI's approach to controlled video generation with structured workflows. */

// Core Next.js and component imports
import Image from "next/image";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import CdnImage from "../../_components/CdnImage";
import dynamic from 'next/dynamic';

// Define types for our translations
type StepPoints = string | string[];

interface StepTranslations {
  title: string;
  points: StepPoints;
  description?: string;
}

interface StepsTranslations {
  [key: string]: StepTranslations;
}

// SEO metadata for the blog post
export const metadata: Metadata = {
  title: "From Storyboards to AI Pipelines – Redefining Animation (Part 1)",
  description: "How Curify AI bridges creative storytelling with structured, controllable AI video pipelines.",
};

/**
 * Helper component to render step points with proper typing
 */
function StepPoints({ points, t }: { points: StepPoints; t: any }) {
  if (Array.isArray(points)) {
    return (
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        {points.map((point, index) => (
          <li key={index}>
            {t.rich ? (
              t.rich(`steps.stepX.points.${index}`, {
                strong: (chunks: any) => <strong>{chunks}</strong>
              })
            ) : (
              <span dangerouslySetInnerHTML={{ __html: point }} />
            )}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-gray-700">{points}</p>;
}

/**
 * Main component for the Storyboard to AI Pipeline blog post
 * Uses next-intl for internationalization support
 */
export default function StoryboardToPipelinePost() {
  // Initialize translations for the 'storyboardToPipeline' namespace
  const t = useTranslations("storyboardToPipeline");

  // Get step data with proper typing
  const getStep = (stepKey: string): StepTranslations => {
    const title = t(`steps.${stepKey}.title`);
    const points = t.raw(`steps.${stepKey}.points`);
    const description = t(`steps.${stepKey}.description`, {defaultValue: ''});
    
    return {
      title,
      points: Array.isArray(points) ? points : [points],
      description: description || undefined
    };
  };

  return (
    <article className="max-w-4xl mx-auto px-6 py-12 prose prose-base md:prose-lg">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("title")}</h1>
      
      {/* Featured image with floating layout */}
      <div className="float-right ml-6 mb-4 w-1/2">
        <CdnImage
          src="/blog/storyboard-pipeline-hero.jpg"
          alt={t("title")}
          width={600}
          height={400}
          className="rounded-lg shadow-lg"
        />
      </div>

      <p className="text-gray-700 mb-6">
        {t.rich('intro.p1', {
          strong: (chunks) => <strong>{chunks}</strong>
        })}
      </p>
      <p className="text-gray-700 mb-6">
        {t.rich('intro.p2', {
          strong: (chunks) => <strong>{chunks}</strong>
        })}
      </p>
      <p className="text-gray-700 mb-6">
        {t.rich('intro.p3', {
          strong: (chunks) => <strong>{chunks}</strong>
        })}
      </p>
      <p className="text-gray-700 mb-6">
        {t.rich('intro.p4', {
          strong: (chunks) => <strong>{chunks}</strong>
        })}
      </p>

      {/* Visual pipeline representation */}
      <div className="my-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg clear-both">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {t("pipeline.title")}
        </h2>
        
        {/* Pipeline stages */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Individual pipeline step */}
          {[
            'prompt',
            'storyboard',
            'images',
            'animation',
            'voiceOver',
            'finalVideo'
          ].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="bg-white px-4 py-2 rounded-lg shadow-md text-center min-w-[120px] text-sm">
                {t(`pipeline.${step}`)}
              </div>
              {index < 5 && (
                <span className="mx-2 text-2xl text-gray-400">→</span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm sm:text-base">{t('pipeline.description')}</p>
        
        <ul className="mt-4 list-disc list-inside space-y-2">
          {Array.isArray(t.raw('pipeline.features')) && 
           (t.raw('pipeline.features') as unknown[]).map((feature, index) => (
             <li key={index} className="text-sm sm:text-base">{String(feature)}</li>
           ))}
        </ul>

        <p className="mt-4 font-medium">{t('pipeline.exampleIntro')}</p>
      </div>

      <div className="my-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {t('steps.step1.title')}
        </h3>
        <p className="mb-4 text-sm sm:text-base">{t('steps.step1.example')}</p>
        <p className="mb-4 text-sm sm:text-base">{t('steps.step1.expandedPrompt')}</p>

        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm sm:text-base">
          <code>
            A young woman standing alone on a midnight train platform, dim lights reflecting off the wet ground, wind blowing her hair, cinematic lighting, anime art style, 4K
          </code>
        </pre>
      </div>

      <div className="my-8 p-6 bg-purple-50 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {t('steps.step2.title')}
        </h3>
        
        {/* Storyboard table showing scene breakdown */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Scene</th>
                <th className="border border-gray-300 p-2">Shot</th>
                <th className="border border-gray-300 p-2">Camera</th>
                <th className="border border-gray-300 p-2">Visual</th>
                <th className="border border-gray-300 p-2">Dialogue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">1</td>
                <td className="border border-gray-300 p-2">Wide</td>
                <td className="border border-gray-300 p-2">Sway</td>
                <td className="border border-gray-300 p-2">The girl waits alone at the platform. Wet pavement reflects dim station lights. Wind gently lifts her hair.</td>
                <td className="border border-gray-300 p-2">(No dialogue – ambient station sounds)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">2</td>
                <td className="border border-gray-300 p-2">Medium</td>
                <td className="border border-gray-300 p-2">Push</td>
                <td className="border border-gray-300 p-2">The camera slowly zooms in on her eyes. A distant light appears — a train approaches.</td>
                <td className="border border-gray-300 p-2">She whispers, "It's time."</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">3</td>
                <td className="border border-gray-300 p-2">Close-up</td>
                <td className="border border-gray-300 p-2">Static</td>
                <td className="border border-gray-300 p-2">Her hand tightens on an old ticket, knuckles white. Her gaze flickers with nerves and resolve.</td>
                <td className="border border-gray-300 p-2">(No dialogue – deep inhale)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">4</td>
                <td className="border border-gray-300 p-2">Wide</td>
                <td className="border border-gray-300 p-2">Handheld</td>
                <td className="border border-gray-300 p-2">The train screeches in, spraying mist. The doors open with a hiss.</td>
                <td className="border border-gray-300 p-2">(No dialogue – train arrival and footsteps)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">5</td>
                <td className="border border-gray-300 p-2">Over-the-shoulder</td>
                <td className="border border-gray-300 p-2">Track</td>
                <td className="border border-gray-300 p-2">From behind, she steps inside. Her silhouette framed by the train's pale light.</td>
                <td className="border border-gray-300 p-2">She says softly, "I hope you're there."</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">6</td>
                <td className="border border-gray-300 p-2">Inside train</td>
                <td className="border border-gray-300 p-2">Swivel</td>
                <td className="border border-gray-300 p-2">She sits beside an empty seat, the world passing in blurred streaks outside.</td>
                <td className="border border-gray-300 p-2">(No dialogue – distant announcement echoes)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">7</td>
                <td className="border border-gray-300 p-2">Insert</td>
                <td className="border border-gray-300 p-2">Static</td>
                <td className="border border-gray-300 p-2">Close-up of her phone: a message reads "I'm waiting." Her lips form a faint smile.</td>
                <td className="border border-gray-300 p-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">8</td>
                <td className="border border-gray-300 p-2">Medium</td>
                <td className="border border-gray-300 p-2">Dolly</td>
                <td className="border border-gray-300 p-2">The train slows. She stands and approaches the door, breath catching in anticipation.</td>
                <td className="border border-gray-300 p-2">(No dialogue – heartbeat and brakes squeal softly)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {[3, 4, 5].map((stepNum) => {
  const stepKey = `step${stepNum}`;
  const title = t(`steps.${stepKey}.title`);
  const description = t(`steps.${stepKey}.description`, {defaultValue: ''});
  const points = t.raw(`steps.${stepKey}.points`) || [];
  
  return (
    <div key={stepNum} className="my-8 p-6 bg-green-50 rounded-lg">
      <h3 className="text-xl font-bold mb-4">
        {stepNum === 3 ? '🛠️ ' : stepNum === 4 ? '🎬 ' : '🎧 '}{title}
      </h3>
      {description && <p className="mb-4 text-sm sm:text-base">{description}</p>}
      {Array.isArray(points) && points.length > 0 && (
        <ul className="list-disc pl-5 space-y-2">
          {points.map((point: string, index: number) => (
            <li 
              key={index} 
              className="text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: point.replace(/\{strong\}(.*?)\{\/strong\}/g, '<strong>$1</strong>') }}
            />
          ))}
        </ul>
      )}
    </div>
  );
})}
```__

      <div className="my-8 p-6 bg-orange-50 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          📦 {t('steps.step6.title')}
        </h3>
        <p className="mb-4 text-sm sm:text-base">{t('steps.step6.description')}</p>

        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto mb-4">
          <code>{`ffmpeg -f concat -safe 0 -i mylist.txt -c copy output_temp.mp4

ffmpeg -i output_temp.mp4 -i music.mp3 -filter_complex "[0:a][1:a]amix=inputs=2" output_final.mp4
# -filter_complex: Apply audio filter to mix both audio tracks
# [0:a][1:a]amix=inputs=2: Mix both audio streams (from video and music)
# output_final.mp4: Final output file with video and mixed audio`}</code>
        </pre>
      </div>

      <div className="my-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{t('whatYouNeed')}</h3>
        
        <ul className="space-y-6">
          <li className="text-sm sm:text-base">
            <strong>storyboard.json</strong> – short scene descriptions
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto mt-2">
              <code>{`{
  "project_name": "Midnight Train",
  "scenes": [
    {
      "scene_number": 1,
      "shot_type": "Wide",
      "camera_movement": "Sway",
      "description": "Girl waits alone at a midnight train platform. Wet pavement reflects dim station lights. Wind gently lifts her hair.",
      "duration_seconds": 5,
      "visual_elements": ["night", "train station", "wind effect", "reflections"],
      "audio_cues": ["ambient station sounds", "distant train"]
    },
    {
      "scene_number": 2,
      "shot_type": "Medium",
      "camera_movement": "Push",
      "description": "Camera slowly zooms in on her eyes. A distant light appears — a train approaches.",
      "duration_seconds": 4,
      "visual_elements": ["close-up", "eyes", "approaching train light"],
      "audio_cues": ["train approaching", "whisper"]
    }
  ],
  "style": "cinematic anime",
  "aspect_ratio": "16:9",
  "fps": 24
}`}</code>
            </pre>
          </li>

          <li className="text-sm sm:text-base">
            <strong>prompts.json</strong> – GPT-expanded prompts
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto mt-2">
              <code>{`{
  "base_prompt": "A girl stands at a midnight train station, wind blowing her hair.",
  "expanded_prompts": {
    "scene_1": {
      "visual_description": "A young woman standing alone on a midnight train platform, dim lights reflecting off the wet ground, wind blowing her hair, cinematic lighting, anime art style, 4K",
      "camera_instructions": "Wide shot, slight camera sway to create tension, shallow depth of field",
      "lighting": "Low-key lighting with high contrast, blue hour ambiance, artificial station lights casting long shadows"
    },
    "scene_2": {
      "visual_description": "Close-up of the woman's eyes, reflecting the approaching train light, detailed eyelashes, subtle eye movement, cinematic anime style",
      "camera_instructions": "Slow push-in, slight handheld shake for intensity, focus pull from eyes to reflection",
      "lighting": "Chiaroscuro lighting, single key light source from the approaching train"
    }
  },
  "style_guide": {
    "color_palette": ["#0a1a2f", "#1a3a5f", "#4a90e2", "#f5f5f5"],
    "mood": "Mysterious, anticipatory, cinematic",
    "art_references": ["Makoto Shinkai's night scenes", "Ghost in the Shell lighting"]
  }
}`}</code>
            </pre>
          </li>

          <li className="text-sm sm:text-base"><strong>scene1.png</strong>, <strong>scene2.png</strong> – image outputs</li>
          <li className="text-sm sm:text-base"><strong>scene1.wav</strong> – voice narration per scene</li>
          <li className="text-sm sm:text-base"><strong>build_project.jsx</strong> – AE import + animation script</li>
          <li className="text-sm sm:text-base"><strong>combine_video.sh</strong> – FFMPEG merge script</li>
        </ul>
      </div>

      <div className="my-8 p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
        {t.rich('cta', {
          strong: (chunks) => <strong>{chunks}</strong>,
          br: () => <br />
        })}
      </div>
    </article>
  );
}
