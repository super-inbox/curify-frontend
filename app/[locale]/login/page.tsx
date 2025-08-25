"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import Head from "next/head";
import Icon from "../_components/Icon";

export default function Login() {
  const router = useRouter();

  const [isUp, setIsUp] = useState(true);

  const onSubmit = (type: "in" | "up") => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);

      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");

      // 校验邮箱格式
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValidEmail) {
        alert("邮箱格式不正确");
        return;
      }

      // 校验密码强度（最少6位）
      if (password.length < 6) {
        alert("密码至少6位");
        return;
      }

      if (type === "up") {
        // 注册
        const res = await fetch("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          alert("注册失败");
          return;
        }
      }

      // 登录
      const result = await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl: "/main", // 登录后跳转页
      });
    };
  };

  return (
    <>
      <Head>
        <title>Login | Curify Studio</title>
      </Head>
      <div className="flex min-h-screen bg-gray-50">
        {/* Left Panel */}
        <div className="w-full md:w-4xl px-10 relative flex flex-col justify-center">
          <div className="flex flex-col relative overflow-hidden">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Welcome to Curify Studio
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Join creators using AI to localize videos in minutes.
            </p>

            <div
              className={`flex flex-row w-[200%] ${
                isUp ? "translate-x-0" : "translate-x-[-50%]"
              } transition-all ease-in-out duration-500`}
            >
              {/* login information */}
              <div className="flex-1 flex flex-col px-2">
                <button
                  onClick={() =>
                    signIn("google", { redirect: false }).then((result) => {
                      console.log(result); // 查看结果
                      if (result?.error) {
                        console.error("Login failed:", result.error);
                      }
                    })
                  }
                  className="flex items-center justify-center gap-2 border rounded-lg px-4 py-3 mb-4 hover:bg-gray-100 transition cursor-pointer"
                >
                  <Icon name="google" size={"1.5rem"} />
                  <span>Sign up with Google</span>
                </button>

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                  <span className="flex-1 h-px bg-gray-300" />
                  Or sign up with email
                  <span className="flex-1 h-px bg-gray-300" />
                </div>

                <form onSubmit={onSubmit("up")} className="flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
                  >
                    Sign up
                  </button>
                </form>

                <p className="text-sm text-gray-600 mt-4">
                  Already have an account?{" "}
                  <a
                    onClick={() => setIsUp((prev) => !prev)}
                    className="text-blue-600 cursor-pointer hover:underline"
                  >
                    Sign in
                  </a>
                </p>
              </div>

              {/* register information */}
              <div className="flex-1 flex flex-col px-2">
                <button
                  onClick={() =>
                    signIn("google", { redirect: false }).then((result) => {
                      console.log(result); // 查看结果
                      if (result?.error) {
                        console.error("Login failed:", result.error);
                      }
                    })
                  }
                  className="flex items-center justify-center gap-2 border rounded-lg px-4 py-3 mb-4 hover:bg-gray-100 transition cursor-pointer"
                >
                  <Icon name="google" size={"1.5rem"} />
                  <span>Sign in with Google</span>
                </button>

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                  <span className="flex-1 h-px bg-gray-300" />
                  Or sign in with email
                  <span className="flex-1 h-px bg-gray-300" />
                </div>

                <form onSubmit={onSubmit("in")} className="flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
                  >
                    Sign in
                  </button>
                </form>

                <p className="text-sm text-gray-600 mt-4">
                  Create a new account?{" "}
                  <a
                    onClick={() => setIsUp((prev) => !prev)}
                    className="text-blue-600 cursor-pointer hover:underline"
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="px-10 absolute left-0 bottom-0 w-full">
            <p className="pt-6 pb-10 text-sm text-gray-500 text-center border-t border-gray-200">
              By signing up, you agree to Curify's Privacy Policy & Terms of
              Service
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="md:flex w-full bg-gray-100 items-center justify-center p-10">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Intelligent video translation at scale
            </h2>
            {/* <img
              src="/sample-dashboard.png"
              alt="Dashboard Preview"
              className="rounded-lg shadow-lg border"
            /> */}
          </div>
        </div>
      </div>
    </>
  );
}
