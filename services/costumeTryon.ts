import { apiClient } from "./api";

// Anonymous "Chinese costume try-on" video generation. Mirrors
// services/nanoGenerate.ts / services/productVideo.ts: generate() returns a
// project_id; poll /projects/{id}/status for the mp4.
//
// This endpoint is ANONYMOUS (no auth required) — the raw photo is posted as
// multipart/form-data directly to /costume-tryon/generate (we do NOT go through
// the auth-gated /images/upload flow). apiClient still attaches a Bearer token
// if one happens to exist, which is harmless.
export interface CostumeTryonRequest {
  file: File;
  gender: "male" | "female";
  email?: string;
}

export interface CostumeTryonResponse {
  success: boolean;
  project_id?: string;
  message?: string;
}

export interface CostumeTryonStatus {
  status: string; // STARTED | COMPLETED | FAILED | ...
  result_url?: string | null;
  failure_reason?: string | null;
  failure_code?: string | null;
}

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_MS = 240_000; // 4-min ceiling (render can take 1–2 min + upload)
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const costumeTryonService = {
  async generate(data: CostumeTryonRequest): Promise<CostumeTryonResponse> {
    const form = new FormData();
    form.append("file", data.file);
    form.append("gender", data.gender);
    if (data.email) form.append("email", data.email);
    return apiClient.request<CostumeTryonResponse>("/costume-tryon/generate", {
      method: "POST",
      body: form,
    });
  },

  async getStatus(projectId: string): Promise<CostumeTryonStatus> {
    // Anon-pollable endpoint (the /projects/{id}/status route requires auth).
    // Returns the status object directly (not {data}-wrapped).
    return apiClient.request<CostumeTryonStatus>(
      `/costume-tryon/status/${encodeURIComponent(projectId)}`,
      { method: "GET" }
    );
  },

  // Poll until COMPLETED (returns the signed mp4 result_url) or FAILED
  // (throws with failure_reason). Same pattern as pollNanoResult /
  // ProductVideoGenerate.poll.
  async pollResult(projectId: string): Promise<string> {
    const deadline = Date.now() + POLL_MAX_MS;
    await sleep(2000); // let the background task start
    while (Date.now() < deadline) {
      let st: CostumeTryonStatus;
      try {
        st = await this.getStatus(projectId);
      } catch {
        await sleep(POLL_INTERVAL_MS); // transient network / 429 — retry
        continue;
      }
      const s = (st.status || "").toUpperCase();
      if (s === "COMPLETED") {
        if (st.result_url) return st.result_url;
        throw new Error("Render finished but no video came back — please try again.");
      }
      if (s === "FAILED") {
        throw new Error(st.failure_reason || "Costume video generation failed. Please try again.");
      }
      await sleep(POLL_INTERVAL_MS);
    }
    throw new Error("This is taking longer than usual — please try again in a moment.");
  },
};
