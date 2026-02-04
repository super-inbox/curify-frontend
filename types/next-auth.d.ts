// File: next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

import type { UserSession } from "@/types/auth";

declare module "next-auth" {
  interface Session {
    user: UserSession;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    id_token?: string;

    profile_fetched_at?: number;

    // cached profile fields
    user_id?: string;
    avatar_url?: string;
    plan_name?: string;
    non_expiring_credits?: number;
    expiring_credits?: number;

    // store a lightweight session user
    session_user?: UserSession;
  }
}
