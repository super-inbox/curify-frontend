import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { User } from '@/types/auth';
import { Project } from '@/types/projects';
import type { UserSession } from "@/types/auth";

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsAtom = atom<Project[]>([]);
export const currentProjectAtom = atom<Project | null>(null);

export const completedProjectsAtom = atom((get) =>
  get(projectsAtom).filter((p) => p.status === 'COMPLETED')
);

export const processingProjectsAtom = atom((get) =>
  get(projectsAtom).filter((p) =>
    ['processing', 'queued', 'pending'].includes(p.status)
  )
);

// ─── User ─────────────────────────────────────────────────────────────────────
// Persisted to localStorage — survives locale switches, page refreshes, remounts.
// getOnInit: true reads the stored value synchronously on first render (no flicker).
export const userAtom = atomWithStorage<(User | UserSession) | null>(
  'curifyUser',
  null,
  undefined,
  { getOnInit: true }
);

// ─── Client mounted ───────────────────────────────────────────────────────────
// Tracks whether the app has hydrated on the client at least once.
// Stored in a plain atom (not localStorage) so it resets on full page reload
// but persists across client-side navigations within the same session.
// This prevents header/workspace from flashing the logged-out state on every
// route change just because a component remounts and resets local useState.
export const clientMountedAtom = atom<boolean>(false);

// ─── Header ───────────────────────────────────────────────────────────────────
// Derived from userAtom — always in sync, never needs to be set manually.
export type HeaderType = "out" | "in" | string;
export const headerAtom = atom<HeaderType>((get) => {
  const user = get(userAtom);
  return user ? "in" : "out";
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authLoadingAtom = atom(false);

// ─── Drawer ───────────────────────────────────────────────────────────────────
export type DrawerType = "signin" | "signup" | "emailout" | "emailin" | null;
export const drawerAtom = atom<string | null>(null);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const modalOpenAtom = atom(false);

export type ModalType = "add" | "setting" | "charge" | "topup" | null;
export const modalAtom = atom<ModalType>(null);

// ─── Footer ───────────────────────────────────────────────────────────────────
export type FooterType = "out" | "in";
export const footerAtom = atom<FooterType>("out");

// ─── Job type ─────────────────────────────────────────────────────────────────
export const jobTypeAtom = atom<'translation' | 'subtitles' | 'reprocessing'>('translation');
