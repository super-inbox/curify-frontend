import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agents vs Workflows – Redefining Animation (Part 2)",
  description:
    "How Curify AI blends predictable workflows with adaptive agents for smarter content creation.",
};

export default function AgentsVsWorkflowsPost() {
  return (
    <article className="max-w-5xl pt-20 mx-auto px-6 pb-12 text-[18px] leading-8">
      <h1 className="text-4xl font-bold mb-8">🤖 Agents vs Workflows</h1>

      <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
        <Image
          src="/images/agents-vs-workflows.jpg"
          alt="Agents vs workflows"
          width={400}
          height={250}
          className="rounded-lg object-cover"
        />
      </div>

      <p className="mb-4">
        Many successful AI creators today (like NanoBanana) rely on{" "}
        <strong>carefully engineered workflows</strong> — scripted pipelines for
        writing, dubbing, editing, and publishing.
      </p>

      <p className="mb-4">
        But agents are different. As Anthropic puts it:
        <em> “Workflows are predictable. Agents are adaptive.”</em>
      </p>

      <p className="mb-4">
        At Curify, workflows ensure consistency and scale (e.g., subtitle extraction
        and muxing), while agents introduce adaptive intelligence:
      </p>

      <ul className="list-disc list-inside mb-8 space-y-1 clear-left">
        <li>Post-editing translations based on context</li>
        <li>Adjusting pacing or emotional tone in dubs</li>
        <li>Understanding intent and speaker sentiment</li>
      </ul>

      <p>
        The future of creative automation lies in harmony: workflows provide
        <strong> control</strong>, agents bring <strong>creativity</strong>.
      </p>
    </article>
  );
}
