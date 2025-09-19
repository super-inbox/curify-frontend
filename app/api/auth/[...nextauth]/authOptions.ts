import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Account, User, SessionStrategy, Session } from "next-auth";
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
        const res = await fetch("http://xxx.com/api/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) throw new Error("Authentication failed");
        const user: User = await res.json();
        if (user && user.email) return user;

        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" as SessionStrategy },
  callbacks: {
    async jwt({ token, user }: JWTProps) {
      if (user) {
        token.name = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: SessionProps) {
      if (session.user) {
        session.user.username = token.name || "";
        session.user.email = token.email;
      }
      return session;
    },
    async redirect(res: { url: string; baseUrl: string }) {
      return `${res.baseUrl}/main`;
    },
  },
};
