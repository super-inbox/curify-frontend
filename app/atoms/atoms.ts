import { atom } from "jotai";

export type DrawerType = "signin" | "signup" | "emailout" | "emailin" | null;
export const drawerAtom = atom<DrawerType>(null);

export type ModalType = "add" | "setting" | "charge" | null;
export const modalAtom = atom<ModalType>(null);

export type HeaderType = "out" | "in" | string;
export const headerAtom = atom<HeaderType>("out");

export type FooterType = "out" | "in";
export const footerAtom = atom<FooterType>("out");

export const userAtom = atom<User.Info | null>(null);
