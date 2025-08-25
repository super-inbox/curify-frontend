"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Head from "next/head";
import toast from "react-hot-toast";

import { useSession } from "next-auth/react";
import { request } from "@/http/request";

export default function Contact() {
  const router = useRouter();
  const session = useSession();

  const [form, setForm] = useState({ email: "", subject: "", text: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendEmail = async () => {
    if (!form.text || !form.subject) {
      toast.error("内容不能为空");
      return;
    }

    if (session.data?.user?.email) {
      setForm({ ...form, email: session.data.user.email });
    }

    await request("/api/send-email", {
      method: "POST",
      body: JSON.stringify(form),
      alert: {
        successMsg: "邮件已发送，我们会尽快联系您！",
        errMsg: "发送失败，请稍后重试",
      },
    });
  };

  return (
    <>
      <Head>
        <title>Contact Sales | Curify Studio</title>
      </Head>
      <div className="h-full p-6 py-18 bg-gray-50 absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center">
        {/* Back to projects link */}
        <a
          onClick={() => router.back()}
          className="text-blue-600 cursor-pointer absolute top-0 left-4 p-6"
        >
          ← Go Back
        </a>

        <div className="max-w-full flex flex-col h-full">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Contact the Curify Team
          </h1>

          {/* C. Discord CTA */}
          <div className="p-6 flex flex-row items-center justify-around">
            <p className="text-gray-600 mr-6">
              💬 Chat with the team, request features, or get help from the
              community.
            </p>
            <a
              href="https://discord.gg/rKqzbvZu"
              target="_blank"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 whitespace-nowrap"
              rel="noopener noreferrer"
            >
              Join Discord
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 mx-auto">
            <span className="flex-1 h-px w-10 bg-gray-300" />
            or
            <span className="flex-1 h-px w-10 bg-gray-300" />
          </div>

          {/* 3 Column Contact Layout */}
          {/* A. Email Contact */}
          <div className="bg-white p-6 rounded shadow flex flex-col flex-1">
            <h2 className="text-lg font-semibold mb-4">📧 创建一个工单</h2>
            {!session.data && (
              <input
                name="email"
                type="text"
                value={form.email}
                onChange={handleChange}
                placeholder="电子邮件地址"
                className="w-full border rounded px-3 py-2 mb-3"
              />
            )}
            <input
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              placeholder="标题（20字限制，请尽量保持简洁，例如：试用申请、售后问题、咨询、投诉等）"
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <textarea
              name="text"
              rows={4}
              value={form.text}
              onChange={handleChange}
              placeholder={`您可以在此处写下您的详尽需求：

1. 想获得试用权限：
您可描述您的具体试用需求，例如：视频语言转换，口型转换，视频时长，画质要求等

2. 账号发生了问题：
您可描述您遇到问题时所处的状态以及问题本身，例如：
设备由于卡顿或VPN代理等原因，导致充值未到账；或其他任何您遇到的问题

我们将在2个工作日内核实确认，并向您的邮箱发送反馈邮件`}
              className="w-full border rounded px-3 py-2 mb-3 flex-1"
            />
            <button
              onClick={sendEmail}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Send Email
            </button>
          </div>

          {/* B. Calendly CTA */}
          {/* <div className="bg-white p-6 rounded shadow flex flex-col items-center justify-center text-center">
            <h2 className="text-lg font-semibold mb-4">
              📅 Schedule a 15-min Call
            </h2>
            <p className="text-gray-600 mb-4">
              Talk to our team for product questions, feedback, or partnerships.
            </p>
            <a
              href="https://calendly.com/qqwjq9916/15-minute-meeting"
              target="_blank"
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
              rel="noopener noreferrer"
            >
              Book via Calendly
            </a>
          </div> */}
        </div>
      </div>
    </>
  );
}
