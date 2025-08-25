"use client";

import Image from "next/image";
import { useState } from "react";
import BtnN from "./button/ButtonNormal";
import Icon from "./Icon";

interface Props {
  user: User.Info | null;
}

export default function Avatar(props: Props) {
  const { user } = props;

  const [open, setOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`relative w-17 h-11 px-3 -mr-3`}
    >
      <div className="rounded-full cursor-pointer overflow-hidden">
        {user?.image ? (
          // 换成真实的后记得删掉
          <img src={user?.image} alt="User Avatar" />
        ) : (
          <Image
            src={user?.image || `/icons/user.svg`}
            alt={"User Avatar"}
            fill
            className="object-contain"
          />
        )}
      </div>

      {/* 列表 */}
      <div
        className={`
          absolute -right-4 z-40 top-full pt-1 transition-all duration-300 bg-white rounded-lg
          ${
            open
              ? `opacity-100 translate-y-0 pointer-events-auto`
              : `opacity-0 -translate-y-2 pointer-events-none`
          }
        `}
      >
        <div
          className={`shadow-[0_0.125rem_0.375rem_rgba(var(--p-purple-rgb),0.3)] rounded-lg min-w-60`}
        >
          <div className="pt-1.5 px-4">
            <div className="px-5 py-3 border-b border-b-[var(--c4)]">
              <p className="text-sm text-[var(--c2)]">{user?.name}</p>
              <p>{user?.email}</p>
            </div>
          </div>
          <div className="px-4 pb-3">
            <BtnN
              className="w-full"
              whiteConfig={["no-border", "no-highlight"]}
              onClick={() => {}}
            >
              <div className="flex items-center">
                <Icon name="work_order" />
                <p className="ml-2.5">Support Ticket</p>
              </div>
            </BtnN>
            <BtnN
              className="w-full"
              whiteConfig={["no-border", "no-highlight"]}
              onClick={() => {}}
            >
              <div className="flex items-center">
                <Icon name="out" />
                <p className="ml-2.5">Sign Out</p>
              </div>
            </BtnN>
          </div>
        </div>
      </div>
    </div>
  );
}
