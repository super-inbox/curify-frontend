import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { User } from "@/types/auth";
import { Project } from "@/types/projects";
import type { UserSession } from "@/types/auth";
import type { BackendJobType } from "@/types/projects";


// ─────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────

export const projectsAtom = atom<Project[]>([]);
export const currentProjectAtom = atom<Project | null>(null);

export const completedProjectsAtom = atom((get) =>
  get(projectsAtom).filter((p) => p.status === "COMPLETED")
);

export const processingProjectsAtom = atom((get) =>
  get(projectsAtom).filter((p) =>
    ["processing", "queued", "pending"].includes(p.status)
  )
);


// ─────────────────────────────────────────────────────────
// User
// ─────────────────────────────────────────────────────────
// Persisted to localStorage — survives locale switches, refreshes.

export const userAtom = atomWithStorage<(User | UserSession) | null>(
  "curifyUser",
  null,
  undefined,
  { getOnInit: true }
);


// ─────────────────────────────────────────────────────────
// Client mounted
// ─────────────────────────────────────────────────────────
// Used to prevent auth UI flicker.

export const clientMountedAtom = atom<boolean>(false);


// ─────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────

export type HeaderType = "out" | "in" | string;

export const headerAtom = atom<HeaderType>((get) => {
  const user = get(userAtom);
  return user ? "in" : "out";
});


// ─────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────

export const authLoadingAtom = atom(false);


// ─────────────────────────────────────────────────────────
// Drawer
// ─────────────────────────────────────────────────────────

export type DrawerType =
  | "signin"
  | "signup"
  | "emailout"
  | "emailin"
  | null;

export const drawerAtom = atom<DrawerType>(null);


// ─────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────

export const modalOpenAtom = atom(false);

export type ModalType =
  | "add"
  | "setting"
  | "charge"
  | "topup"
  | null;

export const modalAtom = atom<ModalType>(null);


// ─────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────

export type FooterType = "out" | "in";

export const footerAtom = atom<FooterType>("out");


// ─────────────────────────────────────────────────────────
// Legacy job type (kept for compatibility)
// ─────────────────────────────────────────────────────────
// Your current modal still uses this in some places.
// We keep it temporarily until everything switches to tool context.

export const jobTypeAtom = atom<
  "translation" | "subtitles" | "reprocessing"
>("translation");


// ─────────────────────────────────────────────────────────
// Tool-driven job context (NEW)
// ─────────────────────────────────────────────────────────
// This replaces jobTypeAtom for tool workflows.

export type CreateJobContext = {
  toolId: string;
  slug: string;

  // backend enum
  job_type: BackendJobType;
};

export const createJobContextAtom =
  atom<CreateJobContext | null>(null);


// ─────────────────────────────────────────────────────────
// Helper derived atoms
// ─────────────────────────────────────────────────────────

export const activeJobTypeAtom = atom((get) => {
  const ctx = get(createJobContextAtom);
  if (ctx) return ctx.job_type;

  // fallback to legacy atom
  const legacy = get(jobTypeAtom);

  if (legacy === "translation") return "full_translation";
  if (legacy === "subtitles") return "subtitle_only";

  return "video_transcript";
});