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
        🎬 From Storyboards to AI Pipelines
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

      <p className="mb-4 clear-left">
        That’s why we build <strong>Controlled Generation Pipelines</strong> instead
        of one-shot generation. These pipelines combine structure and creativity:
      </p>

      <ul className="list-disc list-inside mb-8 space-y-1">
        <li>Storyboard-to-Video: ensures visual + narrative alignment</li>
        <li>ComfyUI-based workflows: modular, reproducible, composable</li>
        <li>Temporal & multimodal control: image + voice + scene coherence</li>
      </ul>

      <p>
        Animation today is both an art and a structured orchestration challenge. We
        think like directors, but build like engineers.
      </p>
    </article>
  );
}
