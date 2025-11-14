import Image from "next/image";
import Link from "next/link";

export default function BlogPost() {
  return (
    <article className="max-w-3xl mx-auto py-12 px-6 prose prose-lg">
      <h1 className="text-4xl font-bold mb-8 leading-tight">
        From Storyboards to AI-Powered Comic Animation
      </h1>

      <p>
        Most people think AI video means "text in, clip out." But if you're aiming for
        <strong>cinematic, director-level control</strong>, it’s an entirely different game.
        In traditional animation, every detail matters — character design, motion continuity, timing, and scene transitions. Our goal is to make AI match that level of precision.
      </p>

      <Image
        src="/images/ai-animation-pipeline.jpg"
        alt="Storyboard to AI Pipeline Diagram"
        width={700}
        height={400}
        className="rounded my-6"
      />

      <p>
        That’s why we build <strong>Controlled Generation Pipelines</strong> instead of one-shot generation. These pipelines combine structure and creativity:
      </p>

      <ul>
        <li>Storyboard-to-Video: ensures visual + narrative alignment</li>
        <li>ComfyUI-based workflows: modular, reproducible, composable</li>
        <li>Temporal & multimodal control: image + voice + scene coherence</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 leading-snug">🎞️ Step 1: Simple Storyboard Example</h2>
      <p>Here’s a sample storyboard for a short scene inside Yichang Museum, featuring the Bronze Sun Man and a new mascot, Little Wing:</p>

      <table className="table-auto border mt-6">
        <thead>
          <tr>
            <th className="border px-4 py-2">🎬 Scene</th>
            <th className="border px-4 py-2">Shot</th>
            <th className="border px-4 py-2">Camera</th>
            <th className="border px-4 py-2">Visual Description</th>
            <th className="border px-4 py-2">Dialogue</th>
            <th className="border px-4 py-2">Screen Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">1</td>
            <td className="border px-4 py-2">Wide</td>
            <td className="border px-4 py-2">Sway</td>
            <td className="border px-4 py-2">A quiet night in Yichang Museum. Bronze Sun Man dances in New Stone Age clothes, full of energy. Other exhibits move subtly too.</td>
            <td className="border px-4 py-2">“Yo yo yo, I’m the Bronze Sun Man! Top-tier, full of swagger!”</td>
            <td className="border px-4 py-2">Pan across the hall with lively background exhibits.</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">2</td>
            <td className="border px-4 py-2">Medium Close</td>
            <td className="border px-4 py-2">Pull</td>
            <td className="border px-4 py-2">Little Wing appears clapping. Camera zooms in to show interaction with Sun Man.</td>
            <td className="border px-4 py-2">“Who are you? I’ve never seen you before.”</td>
            <td className="border px-4 py-2">Little Wing draws attention and Sun Man approaches.</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">3</td>
            <td className="border px-4 py-2">Close-up</td>
            <td className="border px-4 py-2">Push</td>
            <td className="border px-4 py-2">Focus on Little Wing, who cheerfully introduces themselves.</td>
            <td className="border px-4 py-2">“Hi! I’m Little Wing, just arrived today!”</td>
            <td className="border px-4 py-2">Camera pushes in on smiling mascot.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-2xl font-semibold mb-4 leading-snug">🧠 Step 2: Let AI Expand Your Scene Prompts</h2>
      <p>
        Take a simple line like: <em>“A girl stands at a midnight train station, wind blowing her hair.”</em>
        <br />
        Use GPT (e.g. gpt-4o-mini) to expand this into a detailed, stylized prompt:
      </p>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
A young woman standing alone on a midnight train platform, dim lights reflecting off the wet ground, wind blowing her hair, cinematic lighting, anime art style, 4K</pre>

      <h2 className="text-2xl font-semibold mb-4 leading-snug">🎨 Step 3: Generate Images with AI Tools</h2>
      <p>
        Use tools like <strong>Stable Diffusion</strong>, <strong>ComfyUI</strong>, or <strong>DALL·E</strong> to turn prompts into visuals. Save the images as:
      </p>
      <ul>
        <li>scene1.png – Girl at the platform</li>
        <li>scene2.png – Train lights sweep over her face</li>
        <li>scene3.png – She boards and looks back</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 leading-snug">🎬 Step 4: Add Motion in After Effects</h2>
      <p>Import the images into After Effects. Use simple effects like:</p>
      <ul>
        <li>Camera zooms or pans</li>
        <li>Fog or wind with plugins</li>
        <li>Sync AI-generated voice using XTTS or ElevenLabs</li>
        <li>Auto-subtitles from .srt or .json files</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 leading-snug">🎧 Step 5: Voiceover and Sync</h2>
      <p>
        Generate speech with XTTS or another TTS tool, and match the rhythm of the animation. For acronyms or English words inside Chinese lines, you can even merge audio from two voices (e.g., English API spoken with ElevenLabs).
      </p>

      <h2 className="text-2xl font-semibold mb-4 leading-snug">📦 Step 6: Final Output with FFMPEG</h2>
      <p>
        Combine all the clips and audio into one final video using FFMPEG. You can use a simple script like:
      </p>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
ffmpeg -f concat -safe 0 -i mylist.txt -c copy output_temp.mp4
ffmpeg -i output_temp.mp4 -i music.mp3 -filter_complex "[0:a][1:a]amix=inputs=2" output_final.mp4</pre>

      <section className="bg-yellow-50 p-6 rounded shadow mt-10">
        <h2 className="text-lg font-semibold mb-2">📂 Files You’ll Need</h2>
        <ul>
          <li><strong>Storyboard JSON</strong> – scene descriptions</li>
          <li><strong>Prompt Generator Script</strong> – GPT-powered expansion</li>
          <li><strong>Image Assets</strong> – generated by ComfyUI or SDXL</li>
          <li><strong>Audio Tracks</strong> – XTTS voiceovers</li>
          <li><strong>AE JSX Script</strong> – auto import and animate</li>
          <li><strong>FFMPEG Scripts</strong> – final merging</li>
        </ul>
      </section>

      <section className="mt-12 text-center">
        <p className="text-lg">
          🎁 Want to try this pipeline yourself?
          <br />
          <strong>Contact us</strong> to receive a starter kit with sample prompts, scenes, and scripts.
        </p>
      </section>
    </article>
  );
}