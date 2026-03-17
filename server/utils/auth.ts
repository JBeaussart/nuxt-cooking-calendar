import type { H3Event } from "h3";
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";

const ROLE_HIERARCHY: Record<string, number> = { admin: 3, premium: 2, free: 1 };

export function hasRole(userRole: string, required: string): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[required] || 0);
}

export function isPremiumOrAdmin(userRole: string): boolean {
  return hasRole(userRole, "premium");
}

export function isAdmin(userRole: string): boolean {
  return userRole === "admin";
}

export async function getServerUser(event: H3Event) {
  const user = await serverSupabaseUser(event);
  if (!user) return { user: null, profile: null, supabase: null, userRole: "free" };

  const supabase = await serverSupabaseClient(event);

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_role, created_at")
    .eq("id", user.id)
    .single();

  const userRole = profile?.user_role || "free";

  return {
    user: { ...user, role: userRole },
    profile,
    supabase,
    userRole,
  };
}
