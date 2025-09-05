import { atom } from 'jotai';

// User state
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'paid';
  credits: number;
  subscription_status?: string;
}

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom(get => get(userAtom) !== null);
export const userPlanAtom = atom(get => get(userAtom)?.plan || 'free');
export const userCreditsAtom = atom(get => get(userAtom)?.credits || 0);

// Loading states
export const isLoadingAtom = atom(false);
export const authLoadingAtom = atom(false);

// Projects state
export const projectsAtom = atom<Project[]>([]);
export const currentProjectAtom = atom<Project | null>(null);

// UI state
export const sidebarOpenAtom = atom(false);
export const modalOpenAtom = atom(false);


export type DrawerType = "signin" | "signup" | "emailout" | "emailin" | null;
export const drawerAtom = atom<DrawerType>(null);

export type ModalType = "add" | "setting" | "charge" | null;
export const modalAtom = atom<ModalType>(null);

export type HeaderType = "out" | "in" | string;
export const headerAtom = atom<HeaderType>("out");

export type FooterType = "out" | "in";
export const footerAtom = atom<FooterType>("out");
