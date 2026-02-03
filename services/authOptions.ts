// authOptions.ts
import type { JWT } from "next-auth/jwt";

const PROFILE_TTL_MS = 10 * 60 * 1000; // 10 min，可按需调整

async function fetchProfileFromBackend(token: JWT) {
  // 这里要用你现有的鉴权方式：
  // 1) 如果你后端用 next-auth 的 session cookie，那 server 侧 fetch 可能拿不到 cookie（要传 headers）。
  // 2) 更常见：你在 token 里有 access_token / id_token，然后后端用它换 profile。
  //
  // 下面是“你有 backend API + bearer token”的示例：
  const apiBase = process.env.CURIFY_API_URL; // e.g. https://xxx.azurewebsites.net
  const res = await fetch(`${apiBase}/user/profile`, {
    headers: {
      Authorization: `Bearer ${(token as any).access_token ?? ""}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`profile fetch failed: ${res.status}`);
  return res.json();
}

export const authOptions = {
  // ... your providers
  callbacks: {
    async jwt({ token, user, account }) {
      // 1) 初次登录：把 access_token / id_token 之类塞进 token（如果需要给后端鉴权）
      if (account) {
        // 取决于你 provider 返回的字段名
        (token as any).access_token = (account as any).access_token;
        (token as any).id_token = (account as any).id_token;
      }

      const now = Date.now();
      const last = (token as any).profile_fetched_at as number | undefined;

      const missing =
        (token as any).user_id == null ||
        (token as any).avatar_url == null ||
        (token as any).non_expiring_credits == null ||
        (token as any).expiring_credits == null;

      const stale = !last || now - last > PROFILE_TTL_MS;

      // 2) 只有缺字段或过期才去后端拉 profile（避免每次导航都请求）
      if (missing || stale) {
        try {
          const profile = await fetchProfileFromBackend(token);

          // 注意：字段名按你后端返回结构改
          (token as any).user_id = profile.user_id;
          (token as any).avatar_url = profile.avatar_url;

          (token as any).non_expiring_credits = profile.non_expiring_credits ?? 0;
          (token as any).expiring_credits = profile.expiring_credits ?? 0;

          (token as any).profile_fetched_at = now;
        } catch (e) {
          // 失败不要阻断登录；保持旧 token
          // console.warn("profile fetch in jwt failed", e);
        }
      }

      return token;
    },

    async session({ session, token }) {
      // 3) token -> session.user 映射
      (session.user as any).user_id = (token as any).user_id ?? null;
      (session.user as any).avatar_url = (token as any).avatar_url ?? null;

      (session.user as any).non_expiring_credits =
        (token as any).non_expiring_credits ?? 0;

      (session.user as any).expiring_credits =
        (token as any).expiring_credits ?? 0;

      return session;
    },
  },
};
