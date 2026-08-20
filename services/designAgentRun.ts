import { apiClient } from "./api";

/**
 * Backend agent runtime (`agent_runtime`), the canonical implementation per
 * design-agent-v0-spec §7h. Used for the two skills the client ladder cannot
 * do properly: ranking a set of candidates, and try-on posters with per-poster
 * identity/garment verification and retry.
 */

export interface AgentRunRequest {
  prompt: string;
  image_urls: string[];
  locale?: string;
  output_count?: number;
  allow_paid_generation?: boolean;
  task_type?: "auto" | "design_vote" | "tryon_poster";
}

export interface AgentArtifact {
  kind?: string;
  media_type?: string;
  object_path?: string;
  signed_url?: string;
}

export interface AgentRunStatus {
  run_id: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  task_type?: string | null;
  skill_id?: string | null;
  summary?: string | null;
  code?: string | null;
  artifacts?: AgentArtifact[];
  trace?: Array<{ stage?: string; status?: string }>;
}

export const designAgentRunService = {
  async start(body: AgentRunRequest): Promise<{ run_id: string }> {
    return apiClient.request<{ run_id: string }>("/design-agent/runs", {
      method: "POST",
      body: JSON.stringify({ task_type: "auto", locale: "en", ...body }),
    });
  },

  async status(runId: string): Promise<AgentRunStatus> {
    return apiClient.request<AgentRunStatus>(
      `/design-agent/runs/${encodeURIComponent(runId)}`,
      { method: "GET" },
    );
  },

  /** Poll to a terminal state. The runtime is a background task, so a run that
   *  never terminates is a backend problem — surface it rather than hang. */
  async poll(
    runId: string,
    opts: { timeoutMs?: number; intervalMs?: number } = {},
  ): Promise<AgentRunStatus> {
    const timeoutMs = opts.timeoutMs ?? 5 * 60 * 1000;
    const intervalMs = opts.intervalMs ?? 3000;
    const started = Date.now();
    for (;;) {
      const s = await this.status(runId);
      if (s.status === "COMPLETED" || s.status === "FAILED") return s;
      if (Date.now() - started > timeoutMs) {
        throw new Error(
          `Agent run ${runId} still ${s.status} after ${Math.round(timeoutMs / 1000)}s`,
        );
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  },
};
