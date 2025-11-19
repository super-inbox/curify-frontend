import Image from "next/image";
import { Metadata } from "next";

// Import storyboard JSON directly
import storyboard from "@/public/video-enhancement/storyboard.json";

export const metadata: Metadata = {
  title: "AI Video Enhancement: Storyboards, Meme Captions & SFX Automation – Curify AI",
  description:
    "How Curify AI uses scene detection, LLM vision models, storyboards, captions, and sound effects to automatically enhance videos with meme-style storytelling.",
};

// Bullet icon
const ListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-1"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l2.25 3a.75.75 0 001.1 0l2.25-3a.75.75 0 00-1.1-1.02l-1.95 1.56V6.75z"
      clipRule="evenodd"
    />
  </svg>
);

export default function VideoEnhancementPost() {
  return (
    <article className="max-w-6xl mx-auto px-6 py-20 text-[18px] leading-8">

      {/* ------------------------------------------------------- */}
      {/* HEADER */}
      {/* ------------------------------------------------------- */}
      <header className="mb-20 space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center leading-tight">
          AI Video Enhancement with Storyboards, Captions & SFX
        </h1>
      </header>

      {/* ------------------------------------------------------- */}
      {/* TWO-COLUMN INTRO + PIPELINE IMAGE */}
      {/* ------------------------------------------------------- */}
      <section className="max-w-4xl mx-auto mb-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* LEFT: Text */}
          <div>
            <p className="text-lg leading-8">
              Modern AI tools don’t just translate or upscale videos—they can
              understand scenes, generate storyboards, write meme-style captions,
              and add perfectly timed sound effects.
              <br /><br />
              This post walks through how Curify AI builds an automated pipeline
              for <strong>scene-based video enhancement</strong> using:
              <strong> scene detection, GPT-4o Vision, storyboard JSON generation,
              captioning, and SFX layering.</strong>
            </p>
          </div>

          {/* RIGHT: Pipeline Image */}
          <div className="flex justify-center">
            <Image
              src="/images/video-enhancement-pipeline.png"
              alt="AI Video Enhancement Pipeline"
              width={270}
              height={360}
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto space-y-16">
{/* ------------------------------------------------------- */}
{/* EXAMPLE VIDEOS */}
{/* ------------------------------------------------------- */}
<section>
  <h2 className="text-3xl font-semibold mb-6">Before & After: Enhanced Clips</h2>

  <p className="mb-4">
    Below are examples showing the transformation from raw footage to
    captioned, storyboard-driven, sound-enhanced clips.
  </p>

  {/* 2 videos, scaled smaller */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 place-items-center">
    {/* ORIGINAL VIDEO (Adjusted for ~30% smaller size) */}
    <div className="max-w-[70%] mx-auto origin-top">
      <h3 className="font-semibold mb-2 text-center">Original</h3>
      <video
        controls
        className="w-full rounded-lg shadow"
        src="/video-enhancement/oil_crisis_original.mp4"
      />
    </div>

    {/* ENHANCED VIDEO (Adjusted for ~30% smaller size) */}
    <div className="max-w-[70%] mx-auto origin-top">
      <h3 className="font-semibold mb-2 text-center">Enhanced</h3>
      <video
        controls
        className="w-full rounded-lg shadow"
        src="/video-enhancement/oil_crisis_enhanced.mp4"
      />
    </div>
  </div>
</section>

        <hr className="border-gray-200" />

        {/* ------------------------------------------------------- */}
        {/* STORYBOARD GENERATION */}
        {/* ------------------------------------------------------- */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">1. Scene Detection → Storyboard JSON</h2>

          <p className="mb-4">
            Curify uses <strong>scene detection</strong> (PySceneDetect)
            to extract only visually important beats. These frames are sent to GPT-4o Vision,
            which produces an editable storyboard JSON:
          </p>

          <ul className="space-y-3">
            <li className="flex items-start"><ListIcon /> Scene timestamps</li>
            <li className="flex items-start"><ListIcon /> Meme-style captions</li>
            <li className="flex items-start"><ListIcon /> SFX selection</li>
            <li className="flex items-start"><ListIcon /> Text timing & duration</li>
          </ul>

          {/* === INSERT ACTUAL STORYBOARD JSON === */}
          <div className="mt-6 p-6 rounded-lg bg-gray-50 border max-h-[400px] overflow-auto">
            <pre className="text-sm text-gray-700">
{JSON.stringify(storyboard, null, 2)}
            </pre>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* ------------------------------------------------------- */}
        {/* MEME CAPTIONING */}
        {/* ------------------------------------------------------- */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">
            2. Auto-Generated Meme Captions
          </h2>

          <p className="mb-4">
            Captions are short, punchy hooks written by the LLM. They are synced
            to scene boundaries and rendered with bold, high-contrast styling.
          </p>

          <ul className="space-y-3">
            <li className="flex items-start"><ListIcon /> White text + black stroke</li>
            <li className="flex items-start"><ListIcon /> Bounce / pop entrance animation</li>
            <li className="flex items-start"><ListIcon /> Emotionally aligned with visual content</li>
          </ul>
        </section>

        <hr className="border-gray-200" />
{/* ------------------------------------------------------- */}
{/* SOUND EFFECTS */}
{/* ------------------------------------------------------- */}
<section>
  <h2 className="text-3xl font-semibold mb-4">3. Sound Effects & Timing</h2>

  <p className="mb-4">
    The enhancement pipeline uses a small but expressive SFX library:
  </p>

  {/* Added ListIcon for bullet points in SFX descriptions */}
  <ul className="space-y-2">
    <li className="flex items-start">
      <ListIcon />
      <strong>cash</strong> – deal making / money bag
    </li>
    <li className="flex items-start">
      <ListIcon />
      <strong>whoosh</strong> – transitions / fast movement
    </li>
    <li className="flex items-start">
      <ListIcon />
      <strong>dun</strong> – dramatic emphasis
    </li>
    <li className="flex items-start">
      <ListIcon />
      <strong>clown</strong> – comedic beats
    </li>
    <li className="flex items-start">
      <ListIcon />
      <strong>news</strong> – broadcast intro sting
    </li>
    <li className="flex items-start">
      <ListIcon />
      <strong>water_flow</strong> – oil/water ambience
    </li>
    <li className="flex items-start">
      <ListIcon />
      <strong>evil_laugh</strong> – humorous villain ending
    </li>
  </ul>

  {/* Audio players: 4 per row */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
    {[
      "cash",
      "whoosh",
      "dun",
      "clown",
      "news",
      "water_flow",
      "evil_laugh",
    ].map((key) => (
      <div
        key={key}
        className="p-4 bg-gray-50 rounded-lg border shadow-sm text-center"
      >
        <p className="font-semibold capitalize mb-2 text-sm">{key}</p>
        <audio
          controls
          src={`/video-enhancement/sfx/${key}.mp3`}
          className="w-full"
        />
      </div>
    ))}
  </div>
</section>

        <hr className="border-gray-200" />

        {/* ------------------------------------------------------- */}
        {/* PIPELINE SUMMARY */}
        {/* ------------------------------------------------------- */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">
            4. Putting It All Together
          </h2>

          <ul className="space-y-3">
            <li className="flex items-start"><ListIcon /> Scene detection isolates visual beats</li>
            <li className="flex items-start"><ListIcon /> Frames → GPT-4o Vision</li>
            <li className="flex items-start"><ListIcon /> LLM generates storyboard JSON</li>
            <li className="flex items-start"><ListIcon /> User optionally edits captions or timing</li>
            <li className="flex items-start"><ListIcon /> MoviePy assembles text + SFX + transitions</li>
          </ul>
        </section>

        <footer className="pt-10 text-center">
          <p className="text-lg mb-4">
            🚀 Want to enhance your videos using AI?  
            Try Curify Studio at{" "}
            <a
              href="https://curify-ai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline font-semibold"
            >
              curify-ai.com
            </a>
          </p>
        </footer>

      </main>
    </article>
  );
}