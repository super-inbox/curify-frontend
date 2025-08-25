"use client";

import { useAtom } from "jotai";
import { drawerAtom } from "@/app/atoms/atoms";
import Drawer from "../../_components/Drawer";
import BtnN from "../../_components/button/ButtonNormal";
import Icon from "../../_components/Icon";
import Input from "../../_components/Input";
import { useState } from "react";
import Link from "next/link";

export default function EmailDrawer() {
  const [state, setState] = useAtom(drawerAtom);

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [detail, setDetail] = useState("");

  const [emailValid, setEmailValid] = useState(false);
  const [subjectValid, setSubjectValid] = useState(false);

  return (
    <Drawer open={state === "emailout"}>
      <Link
        className={`
          flex items-center justify-center
          shadow-[inset_0_0_0_1px_rgba(var(--p-purple-rgb),1)]
          hover:text-[var(--p-blue)]
          px-5 py-3 rounded-lg w-full text-center text-[var(--c2)] text-sm
        `}
        href="https://discord.gg/rKqzbvZu"
      >
        <p className="mr-3">Join Our Discord Community</p>
        <Icon name="discord" size={5} />
      </Link>

      <p className="py-3 border-b border-b-[var(--c4)] w-full mb-3 text-center">
        Or
      </p>

      <div className="flex flex-col items-center gap-3 w-full">
        <h2 className="text-base text-[var(--c2)]">Contact Us via Email</h2>

        <Input
          value={email}
          placeholder="Email"
          onChange={setEmail}
          setValid={setEmailValid}
          rules={[
            {
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              errorMsg: "Please enter a valid email address.",
            },
          ]}
        />

        <Input
          value={subject}
          placeholder="Subject (Max 30 Characters)"
          onChange={setSubject}
          setValid={setSubjectValid}
          cantEmpty
        />

        <div className="overflow-hidden w-full">
          <textarea
            className={`
              w-full outline-none px-4 py-3 rounded-[0.675rem]
              min-h-40 max-h-[calc(100vh-2.25rem*2-2.75rem*4-2.6875rem-3rem-0.75rem*2-3rem*2)]
              text-sm text-[var(--c2)] placeholder-[var(--c4)]
              shadow-[inset_0_0_0_1px_rgba(var(--c4-rgb),1)] 
              hover:shadow-[inset_0_0_0_1px_rgba(var(--p-blue-hover-rgb),1)] 
              focus:shadow-[inset_0_0_0_1px_rgba(var(--p-blue-rgb),1)]
            `}
            value={detail}
            placeholder={`You may describe your situation and needs here to help us better understand and prepare.

We’ll review and respond via email within 2 business days.`}
            onChange={(e) => setDetail(e.target.value)}
          />
        </div>

        <div className="-mb-3">
          <BtnN disabled={!(emailValid && subjectValid)} onClick={() => {}}>
            Send
          </BtnN>
        </div>
      </div>
    </Drawer>
  );
}
