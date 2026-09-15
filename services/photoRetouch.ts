import { apiClient } from "./api";

// Anonymous photo editing. Mirrors services/costumeTryon.ts: generate() returns a
// project_id; poll /photo-retouch/status/{id} for the signed JPEG.
//
// ANONYMOUS on purpose. The 2026-09-15 buyer-side demand pass found this offer had
// no inbound surface at all — a photographer who needs editing searches for it,
// and every result was a competitor. A sign-in wall in front of the first try is
// the gap, not the fix, so the raw File is posted straight to the endpoint rather
// than through the auth-gated /images/upload flow.
export interface PhotoRetouchRequest {
  file: File;
  email?: string;
}

export interface PhotoRetouchResponse {
  project_id?: string;
}

export interface RetouchGate {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
}

export interface PhotoRetouchStatus {
  status: string; // STARTED | COMPLETED | FAILED
  result_url?: string | null;
  regions_applied?: number | null;
  regions_planned?: number | null;
  people?: number | null;
  gates_passed?: number | null;
  gates_total?: number | null;
  gates?: RetouchGate[] | null;
  failure_reason?: string | null;
  failure_code?: string | null;
}

const POLL_INTERVAL_MS = 4000;
// The pipeline makes one model call per planned region plus one to plan, so a
// two-person frame is 6-8 sequential calls: ~3 minutes measured end to end. The
// ceiling is generous; on timeout the job still finishes server-side and the
// email delivers it, which is why pollResult signals "pending" rather than
// throwing.
const POLL_MAX_MS = 600_000;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const PENDING = "PENDING_EMAIL";

export const photoRetouchService = {
  async generate(data: PhotoRetouchRequest): Promise<PhotoRetouchResponse> {
    const form = new FormData();
    form.append("file", data.file);
    if (data.email) form.append("email", data.email);
    return apiClient.request<PhotoRetouchResponse>("/photo-retouch/generate", {
      method: "POST",
      body: form,
    });
  },

  async getStatus(projectId: string): Promise<PhotoRetouchStatus> {
    return apiClient.request<PhotoRetouchStatus>(
      `/photo-retouch/status/${encodeURIComponent(projectId)}`,
      { method: "GET" },
    );
  },

  /** Resolves with the finished status (result_url set), or throws on FAILED.
   *  Throws PENDING when the poll window closes with the job still running. */
  async pollResult(projectId: string): Promise<PhotoRetouchStatus> {
    const deadline = Date.now() + POLL_MAX_MS;
    while (Date.now() < deadline) {
      await sleep(POLL_INTERVAL_MS);
      let s: PhotoRetouchStatus;
      try {
        s = await this.getStatus(projectId);
      } catch {
        continue; // a transient 5xx should not end the wait
      }
      if (s.status === "COMPLETED" && s.result_url) return s;
      if (s.status === "FAILED") {
        throw new Error(s.failure_reason || "Editing failed. Please try another photo.");
      }
    }
    throw new Error(PENDING);
  },
};
