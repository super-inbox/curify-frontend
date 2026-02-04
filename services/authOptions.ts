// File: ./services/authOptions.ts

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import type { AuthOptions, Account } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";

import type { User as AppUser } from "@/types/auth";

// 10min TTL
const PROFILE_TTL_MS = 10 * 60 * 1000;

type ApiResponse<T> = {
  status_code: number;
  message: string;
  data: T;
};

type AuthSuccessResponse = {
  user: AppUser; // 这里是后端 build_user_profile_response 返回的结构（你要确保 types 对齐）
  access_token: string;
  refresh_token: string;
  token_type?: string;
};

async function backendAuthLogin(email: string, password: string): Promise<AuthSuccessResponse> {
  const apiBase = process.env.CURIFY_API_URL;
  if (!apiBase) throw new Error("CURIFY_API_URL is not set");

  const res = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // 你的 LoginRequest: { email, password }
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`backend /auth/login failed: ${res.status}`);

  const json = (await res.json()) as ApiResponse<AuthSuccessResponse>;
  return json.data;
}

async function backendGoogleLogin(idToken: string): Promise<AuthSuccessResponse> {
  const apiBase = process.env.CURIFY_API_URL;
  if (!apiBase) throw new Error("CURIFY_API_URL is not set");

  const res = await fetch(`${apiBase}/auth/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // 你的 GoogleLoginRequest: { token }
    body: JSON.stringify({ token: idToken }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`backend /auth/google-login failed: ${res.status}`);

  const json = (await res.json()) as ApiResponse<AuthSuccessResponse>;
  return json.data;
}

async function fetchProfileFromBackend(accessToken: string): Promise<AppUser> {
  const apiBase = process.env.CURIFY_API_URL;
  if (!apiBase) throw new Error("CURIFY_API_URL is not set");

  const res = await fetch(`${apiBase}/user/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`backend /user/profile failed: ${res.status}`);

  const json = (await res.json()) as ApiResponse<AppUser>;
  return json.data;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email ?? "";
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        // ✅ 用你后端 /auth/login
        const data = await backendAuthLogin(email, password);

        // ✅ 这里返回一个 “NextAuth User” 对象
        // NextAuth 只要求 id/email 等字段存在；其余字段你可以带上，后续在 jwt callback 里保存到 token
        const u = data.user;

        return {
          id: u.user_id,            // NextAuth 需要 id
          email: u.email,           // 必须
          name: (u as any).username ?? u.email.split("@")[0],
          // 把后端 tokens/profile 暂存到 user 上，jwt callback 里再搬到 token
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          profile: u,
        } as unknown as AdapterUser;
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, account }) {
      // --- 1) 初次登录（Credentials 或 Google） ---
      // Credentials：authorize 已经把 profile + access_token 放在 user 里
      if (user) {
        const anyUser = user as any;

        // 从 credentials authorize 里带过来的
        if (anyUser.access_token) token.access_token = anyUser.access_token;
        if (anyUser.refresh_token) token.refresh_token = anyUser.refresh_token;
        if (anyUser.profile) token.user = anyUser.profile as AppUser;
      }

      // GoogleProvider：这里需要用 account.id_token 去后端换 access_token + profile
      if (account?.provider === "google") {
        const idToken = (account as Account & { id_token?: string }).id_token;

        // 只在第一次 sign-in（或 token 没 access_token）时换一次
        if (idToken && !token.access_token) {
          try {
            const data = await backendGoogleLogin(idToken);
            token.access_token = data.access_token;
            token.refresh_token = data.refresh_token;
            token.user = data.user;
          } catch {
            // 不阻断登录
          }
        }
      }

      // --- 2) TTL 刷新 profile（避免每次切 locale 都 hit /user/profile） ---
      const now = Date.now();
      const last = (token as any).profile_fetched_at as number | undefined;

      const missing = !token.user || !token.access_token;
      const stale = !last || now - last > PROFILE_TTL_MS;

      if (!missing && stale) {
        try {
          const profile = await fetchProfileFromBackend(String(token.access_token));
          token.user = profile;
          (token as any).profile_fetched_at = now;
        } catch {
          // ignore
        }
      }

      return token;
    },

    async session({ session, token }) {
      // ✅ session.user = 你自己的 profile（配合 module augmentation 最舒服）
      if (token.user) {
        session.user = token.user as any; // 做了 next-auth.d.ts augmentation 后可去掉 any
      }
      // 如果你还想在前端用 access_token（比如 client 直接打后端）
      (session as any).access_token = token.access_token;
      (session as any).refresh_token = token.refresh_token;

      return session;
    },
  },
};
