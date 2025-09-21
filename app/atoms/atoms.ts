import { atom } from 'jotai';
import { User } from '@/types/auth';
import { Project } from '@/types/projects';

// Projects atoms
export const projectsAtom = atom<Project[]>([]);
export const currentProjectAtom = atom<Project | null>(null);

// Derived atoms
export const completedProjectsAtom = atom((get) => 
  get(projectsAtom).filter(p => p.status === 'COMPLETED')
);

export const processingProjectsAtom = atom((get) => 
  get(projectsAtom).filter(p => ['processing', 'queued', 'pending'].includes(p.status))
);
// UI state atoms
export const authLoadingAtom = atom(false);
export const userAtom = atom<User | null>(null);
export const modalOpenAtom = atom(false);

export type DrawerType = "signin" | "signup" | "emailout" | "emailin" | null;
export const drawerAtom = atom<string | null>(null);

export type ModalType = "add" | "setting" | "charge" | "topup" | null;
export const modalAtom = atom<ModalType>(null);

export type HeaderType = "out" | "in" | string;
export const headerAtom = atom<HeaderType>("out");

export type FooterType = "out" | "in";
export const footerAtom = atom<FooterType>("out");

export const jobTypeAtom = atom<'translation' | 'subtitles' | 'reprocessing'>('translation');
