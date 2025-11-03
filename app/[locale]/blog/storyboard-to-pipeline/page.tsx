import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "From Storyboards to AI Pipelines – Redefining Animation (Part 1)",
  description:
    "How Curify AI bridges creative storytelling with structured, controllable AI video pipelines.",
};

export default function StoryboardToPipelinePost() {
  return (
    <article className="max-w-5xl pt-20 mx-auto px-6 pb-12 text-[18px] leading-8">
      <h1 className="text-4xl font-bold mb-8">
      Create Your Own AI-Powered Comic Animation: A Simple Step-by-Step Guide
      </h1>

      <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
        <Image
          src="/images/ai-animation-pipeline.jpg"
          alt="AI storyboard-to-video pipeline"
          width={400}
          height={250}
          className="rounded-lg object-cover"
        />
      </div>

      <p className="mb-4">
        Most people think AI video means "text in, clip out." But if you're aiming
        for <strong>cinematic, director-level control</strong>, it’s an entirely
        different game.
      </p>

      <p className="mb-4">
        In traditional animation, every detail matters — character design, motion
        continuity, timing, and scene transitions. Our goal is to make AI match
        that level of precision.
      </p>

      <p className="mb-4">
        Animation today is both an art and a structured orchestration challenge. We
        think like directors, but build like engineers.
      </p>

      <p className="mb-4 clear-left">
        That’s why we build <strong>Controlled Generation Pipelines</strong> instead
        of one-shot generation. These pipelines combine structure and creativity:
      </p>

      <ul className="list-disc list-inside mb-8 space-y-1">
        <li>Storyboard-to-Video: ensures visual + narrative alignment</li>
        <li>ComfyUI-based workflows: modular, reproducible, composable</li>
        <li>Temporal & multimodal control: image + voice + scene coherence</li>
      </ul>
      <p className="mb-4">
        Now, let’s walk through a simple example to show how AI pipelines work in
        practice.
      </p>

      <h3 className="text-2xl font-semibold mt-6 mb-2">
        📝 Step 1: Start with a Basic Prompt
      </h3>
      <blockquote className="italic bg-gray-100 px-4 py-2 rounded border-l-4 border-blue-400 mb-4">
        A girl stands at a midnight train station, wind blowing her hair.
      </blockquote>

      <p className="mb-4">With the help of GPT, we expand it into a richer visual prompt:</p>

      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto mb-6">
A young woman standing alone on a midnight train platform, dim lights reflecting off the wet ground, wind blowing her hair, cinematic lighting, anime art style, 4K</pre>

      <h3 className="text-2xl font-semibold mt-10 mb-4">🎬 Step 2: Convert Prompt to a Storyboard Table</h3>

      <table className="table-auto border mt-4 mb-8 w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-4 py-2 text-left">Scene</th>
            <th className="border px-4 py-2 text-left">Shot</th>
            <th className="border px-4 py-2 text-left">Camera</th>
            <th className="border px-4 py-2 text-left">Visual</th>
            <th className="border px-4 py-2 text-left">Dialogue</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">1</td>
            <td className="border px-4 py-2">Wide</td>
            <td className="border px-4 py-2">Sway</td>
            <td className="border px-4 py-2">
              The girl waits alone at the platform. Wet pavement reflects dim station lights. Wind gently lifts her hair.
            </td>
            <td className="border px-4 py-2">(No dialogue – ambient station sounds)</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">2</td>
            <td className="border px-4 py-2">Medium</td>
            <td className="border px-4 py-2">Push</td>
            <td className="border px-4 py-2">
              The camera slowly zooms in on her eyes. A distant light appears — a train approaches.
            </td>
            <td className="border px-4 py-2">She whispers, “It’s time.”</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-2xl font-semibold mt-10 mb-4">🛠️ Step 3: Generate Visuals</h3>
      <ul className="list-disc list-inside mb-6">
        <li>
          🎨 Use <strong>Stable Diffusion</strong> or <strong>ComfyUI</strong> to turn each scene description into a high-res image.
        </li>
        <li>
          Keep the style consistent by using the same LoRA model, art style, and seed.
        </li>
      </ul>

      <h3 className="text-2xl font-semibold mt-10 mb-4">🎬 Step 4: Add Motion and Atmosphere in After Effects</h3>
      <ul className="list-disc list-inside mb-6">
        <li>
          Import images into <strong>Adobe After Effects</strong>
        </li>
        <li>
          Apply keyframe animations: pan, zoom, fog overlays, glow effects
        </li>
        <li>
          Add ambient sound or cinematic transitions
        </li>
      </ul>

      <h3 className="text-2xl font-semibold mt-10 mb-4">🎧 Step 5: Add Voice and Subtitles</h3>
      <ul className="list-disc list-inside mb-6">
        <li>
          Use <strong>XTTS</strong> or <strong>ElevenLabs</strong> to generate natural voiceovers
        </li>
        <li>
          For acronyms (like API, NBA), generate English snippets separately and merge in post
        </li>
        <li>
          Add subtitles using `.srt` or `.json` files synced to voice
        </li>
      </ul>

      <h3 className="text-2xl font-semibold mt-10 mb-4">📦 Step 6: Final Composition with FFMPEG</h3>
      <p className="mb-2">Use FFMPEG to combine all pieces into one video:</p>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto mb-6">
ffmpeg -f concat -safe 0 -i mylist.txt -c copy output_temp.mp4
ffmpeg -i output_temp.mp4 -i music.mp3 -filter_complex \"[0:a][1:a]amix=inputs=2\" output_final.mp4
      </pre>

      <h3 className="text-2xl font-semibold mt-10 mb-4">📁 What You'll Need</h3>
      <ul className="list-disc list-inside mb-6">
        <li><code>storyboard.json</code> – short scene descriptions</li>
        <li><code>prompts.json</code> – GPT-expanded prompts</li>
        <li><code>scene1.png</code>, <code>scene2.png</code> – image outputs</li>
        <li><code>scene1.wav</code> – voice narration per scene</li>
        <li><code>build_project.jsx</code> – AE import + animation script</li>
        <li><code>combine_video.sh</code> – FFMPEG merge script</li>
      </ul>

      <p className="mt-10 text-lg">
        🚀 Ready to bring your storyboard to life with AI?
        <br />
        <strong>We can provide a full starter kit</strong> with examples, templates, and tools to help you get started.
      </p>
    </article>
  );
}
