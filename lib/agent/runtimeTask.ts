/**
 * Which requests belong to the BACKEND agent runtime rather than the client
 * ladder.
 *
 * `agent_runtime` already implements two skills end to end — design-vote and
 * tryon-poster — and `POST /design-agent/runs` is live in production. Neither
 * was reachable from the product: DesignAgentClient executes steps client-side
 * through nanoGenerate and never called that endpoint. Verified against prod on
 * 2026-08-20: a design_vote run completes and returns TWO durable artifacts,
 * a rendered report PNG and an analysis JSON tagged `manifest` — which is the
 * artifact nine 21q cases were short of.
 *
 * These patterns MIRROR `infer_task_type` in app/agent_runtime/skills.py. The
 * backend still does the real inference (we send task_type "auto"); this only
 * decides whether to hand the turn over at all, so a drift between the two is
 * a missed handover, never a wrong skill.
 */
export type RuntimeTaskType = "design_vote" | "tryon_poster";

const VOTE_RE =
  /投票|哪款|哪个设计|包装.*(?:好|质感)|vote|which\s+(?:design|packaging)|compare/i;
const TRYON_RE =
  /自拍|穿搭|试穿|电商海报|outfit|try[- ]?on|ecommerce\s+poster/i;

export function runtimeTaskType(query: string): RuntimeTaskType | null {
  if (VOTE_RE.test(query)) return "design_vote";
  if (TRYON_RE.test(query)) return "tryon_poster";
  return null;
}

/** design-vote renders deterministically over the supplied board — no paid
 *  generation. tryon-poster generates images and the skill refuses without it. */
export function runtimeNeedsPaidGeneration(task: RuntimeTaskType): boolean {
  return task === "tryon_poster";
}
