// FILEPATH: ./app/api/auth/[...nextauth]/authOptions.ts
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";
import type { Account, Profile } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";
import type { User as CustomUser } from "@/types/auth";

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
        const res = await fetch("http://xxx.com/api/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) throw new Error("Authentication failed");

        const user: CustomUser = await res.json();

        if (user && user.email) {
          // Return as AdapterUser with required emailVerified property
          return {
            id: user.user_id,
            emailVerified: null,
            ...user,
          } as AdapterUser;
        }

        return null;
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  pages: { 
    signIn: "/login" 
  },
  session: { 
    strategy: "jwt" 
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as CustomUser;
      }
      return session;
    },
  
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/main`;
    },
  },
};