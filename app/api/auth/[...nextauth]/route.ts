import NextAuth from "next-auth";
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
    // Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Email login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Get user information
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
        if (user && user.email) return user; // Login successful

        return null; // Login failed
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // debug: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" as SessionStrategy },
  callbacks: {
    // Add permissions to the token after login
    async jwt({ token, user, account }: JWTProps) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    // Access the token via the session
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

// NextAuth returns the necessary GET and POST handlers for the App Router
const handler = NextAuth(authOptions);

// Export the handlers
export { handler as GET, handler as POST };
