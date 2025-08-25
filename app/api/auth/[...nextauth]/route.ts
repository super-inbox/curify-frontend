// 本地开发时，如无法登录谷歌，需设置VPN，端口会随环境变化
const port = 7890;
if (process.env.NODE_ENV === "development") {
  import("global-agent").then(({ bootstrap }) => {
    process.env.GLOBAL_AGENT_HTTP_PROXY = `http://127.0.0.1:${port}`;
    bootstrap();
  });
}

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import type { Account, User, SessionStrategy, Session } from "next-auth";
import NextAuth from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";

type JWTProps = {
  token: JWT;
  user: User | AdapterUser;
  account: Account | null;
};
type SessionProps = { session: Session; token: JWT };

export const authOptions = {
  providers: [
    // 谷歌登录
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // 邮箱登录
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 获取用户信息
        const res = await fetch("http://xxx.com/api/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) throw new Error("验证失败");

        const user: User = await res.json();
        if (user && user.email) return user; // 登录成功

        return null; // 登录失败
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // debug: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" as SessionStrategy },
  callbacks: {
    // 登录后添加权限至token
    async jwt({ token, user, account }: JWTProps) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    // 通过 session 访问 token
    async session({ session, token }: SessionProps) {
      if (session.user) {
        session.user.name = token.name || "";
        session.user.email = token.email;
      }
      return session;
    },
    async redirect(res: { url: string; baseUrl: string }) {
      console.log("Redirecting to:", `${res.baseUrl}/main`);
      return `${res.baseUrl}/main`;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
