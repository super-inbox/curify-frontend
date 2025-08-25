"use client";

import Image from "next/image";
import BtnN from "../_components/button/ButtonNormal";
import Link from "next/link";
import { useAtom } from "jotai";
import { drawerAtom, headerAtom, userAtom } from "@/app/atoms/atoms";
import Avatar from "../_components/Avatar";
import { useRouter } from "@/i18n/navigation";
import Icon from "../_components/Icon";

export default function Header() {
  const router = useRouter();

  const [, setDrawerState] = useAtom(drawerAtom);
  const [headerState, setHeaderState] = useAtom(headerAtom);
  const [user] = useAtom(userAtom);

  return (
    <header className="flex px-8 py-3 fixed z-10 top-0 w-full bg-transparent">
      <div className="flex items-center justify-between px-8 py-3 w-full bg-white/80 rounded-2xl">
        {/* 左侧 */}
        {headerState === "out" || headerState === "in" ? (
          <div className="relative w-40 aspect-[160/38.597]">
            <Link href={"/"}>
              <Image
                src="/logo.svg"
                alt="logo"
                fill
                className="object-contain"
              />
            </Link>
            {/* 操作导航区域 */}
            <div></div>
          </div>
        ) : (
          <div className="-ml-5">
            <BtnN
              whiteConfig={["no-border", "no-hover"]}
              onClick={() => {
                setHeaderState("in");
                setDrawerState("signin");
                router.replace("/main");
              }}
            >
              <div className="flex items-center">
                <Icon size={"3_5"} name="arrow_left" />
                <p className="ml-5">{headerState}</p>
              </div>
            </BtnN>
          </div>
        )}

        {/* 操作区 */}
        {headerState === "out" ? (
          <div>
            <BtnN
              whiteConfig={["no-bg", "no-border", "no-hover"]}
              onClick={() => setDrawerState("signin")}
            >
              Sign in
            </BtnN>
            <BtnN onClick={() => setDrawerState("signup")}>
              Sign Up for Free
            </BtnN>
            <BtnN
              whiteConfig={["no-bg", "no-border", "no-hover"]}
              onClick={() => setDrawerState("emailout")}
            >
              Customization
            </BtnN>
          </div>
        ) : (
          <div className="flex items-center">
            <p className="text-sm text-right mr-3">
              <span className="text-[var(--p-blue)] font-bold">3000</span>
              <span className="text-[var(--c1)] mx-1 font-bold">C</span>left
            </p>
            <BtnN onClick={() => setDrawerState("signup")}>Top Up Credits</BtnN>
            <Avatar user={user} />
          </div>
        )}
      </div>
    </header>
  );
}
