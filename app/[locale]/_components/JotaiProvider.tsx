"use client";

import { Provider } from 'jotai';

interface Props {
  children: React.ReactNode;
}

export default function JotaiProvider({ children }: Props) {
  return <Provider>{children}</Provider>;
}
