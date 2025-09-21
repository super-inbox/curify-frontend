"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { footerAtom, headerAtom, userAtom } from "@/app/atoms/atoms";
import { usePathname } from "next/navigation";
import { User } from "@/types/auth";

interface Props {
  children: React.ReactNode;
  user: User | null;
}

export default function AppWrapper(props: Props) {
  const { children, user } = props;

  const [, setUser] = useAtom(userAtom);
  const [, setHeaderState] = useAtom(headerAtom);
  const [, setFooterState] = useAtom(footerAtom);

  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      setUser(user);
      setHeaderState("in");
    } else {
      const mockUser = localStorage.getItem("curifyUser");
      if (mockUser) {
        const parsedUser = JSON.parse(mockUser);
        setUser(parsedUser);
        setHeaderState("in");
      } else {
        setHeaderState("out");
      }
    }
  }, [user, setUser, setHeaderState]);

  useEffect(() => {
    const pagePart = pathname.split("/");
    setFooterState(pagePart[2] ? "in" : "out");
  }, [pathname, setFooterState]);

  return <>{children}</>;
}
