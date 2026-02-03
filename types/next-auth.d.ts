import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      user_id?: string | null;
      avatar_url?: string | null;
      non_expiring_credits?: number;
      expiring_credits?: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id?: string | null;
    avatar_url?: string | null;
    non_expiring_credits?: number;
    expiring_credits?: number;
    profile_fetched_at?: number;
    access_token?: string;
    id_token?: string;
  }
}
