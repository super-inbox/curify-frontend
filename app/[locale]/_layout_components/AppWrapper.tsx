"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { footerAtom, headerAtom, userAtom } from "@/app/atoms/atoms";
import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
  user: User.Info | null;
}

export default function AppWrapper(props: Props) {
  const { children, user } = props;

  const [, setUser] = useAtom(userAtom);
  const [, setHeaderState] = useAtom(headerAtom);
  const [, setFooterState] = useAtom(footerAtom);

  const pathname = usePathname();

  useEffect(() => {
    setUser(user); // 注入一次
    setHeaderState(user ? "in" : "out");
  }, [user, setUser, setHeaderState]);

  useEffect(() => {
    const pagePart = pathname.split("/");
    setFooterState(pagePart[2] ? "in" : "out");
  }, [pathname, setFooterState]);

  return <>{children}</>;
}
