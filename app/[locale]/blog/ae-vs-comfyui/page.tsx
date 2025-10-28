import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AE vs ComfyUI – Redefining Animation (Part 3)",
  description:
    "A comparison of After Effects and ComfyUI — two worlds of control and generative freedom in AI animation.",
};

export default function AeVsComfyUiPost() {
  return (
    <article className="max-w-5xl pt-20 mx-auto px-6 pb-12 text-[18px] leading-8">
      <h1 className="text-4xl font-bold mb-8">🎨 AE vs ComfyUI</h1>

      <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
        <Image
          src="/images/ae-vs-comfyui.jpg"
          alt="AE vs ComfyUI comparison"
          width={400}
          height={250}
          className="rounded-lg object-cover"
        />
      </div>

      <p className="mb-4">
        We often get asked: why not just use After Effects (AE)? Or why bother with
        ComfyUI? Both are essential — one provides fine control, the other generative
        creativity.
      </p>

      <p className="mb-4">
        AE offers <strong>timeline precision</strong> and control over transitions,
        lighting, and effects. ComfyUI brings <strong>AI-native workflows</strong>,
        combining diffusion, text, and multimodal orchestration.
      </p>

      <div className="overflow-x-auto mb-8 clear-left">
        <table className="table-auto border-collapse border text-sm w-full">
          <thead>
            <tr>
              <th className="border px-4 py-2 bg-gray-100 text-left">AE</th>
              <th className="border px-4 py-2 bg-gray-100 text-left">ComfyUI</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Precise VFX and motion control</td>
              <td className="border px-4 py-2">AI-native generation of videos</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Timeline-based editing</td>
              <td className="border px-4 py-2">Workflow/node-based rendering</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Manual / plugin-driven workflow</td>
              <td className="border px-4 py-2">
                Diffusion + LLM + multimodal orchestration
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        In our workflow, ComfyUI handles the AI generation and iteration, while AE
        refines the final look — transitions, overlays, and compositing.
      </p>
    </article>
  );
}
